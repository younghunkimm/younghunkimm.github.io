---
title: "[Spring] 일정관리 Develop 프로젝트 트러블슈팅 기록"
categories: [Spring, Spring/Trouble Shooting]
tags: [Java, spring, JPA, MySQL, Trouble Shooting]
date: '2025-08-13 12:04:00 +0900'
---

일정관리 Develop 프로젝트를 진행하면서 겪은 트러블슈팅의 과정들에 대한 기록입니다.   
해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/schedule-management-develop-api){:target="_blank"} 에서 확인하실 수 있습니다.

## 트러블슈팅1️⃣

---

### ⭐️ 주제

JPA에서 발생한 `N+1` 문제와 QueryDSL DTO Projections

### 🔥 발생

일정 상세 조회 API에서 `Schedule`과 `Comment`를 함께 조회하는 로직이 있었다.   
또, `Comment` 응답 DTO 에는 작성자명을 함께 포함하고 있었다.

`ScheduleServiceImpl.java`
```java
@Transactional(readOnly = true)
public ScheduleSearchDetailResponseDto findById(Long scheduleId) {

    Schedule findSchedule = scheduleRepository.findWithMemberByIdOrElseThrow(id);
    List<Comment> findCommentList = commentRepository.findCommentsByScheduleIdAndDeletedAtIsNullOrderByModifiedAtDesc(findSchedule.getId());

    return ScheduleSearchDetailResponseDto.from(
            findSchedule,
            findCommentList.stream()
                    .map(CommentSearchResponseDto::from)
                    .toList()
    );
}
```

- `findByIdElseThrow`로 일정 Entity를 먼저 조회
- 댓글은 별도의 `findCommentsByScheduleIdAndDeletedAtIsNullOrderByModifiedAtDesc` 쿼리로 조회
  - JPA 메서드 명명 규칙으로 조건과 정렬을 함께 처리하니 가독성도 좋지 않았다.
- DTO 변환 과정에서 `comment.getMember().getName()`을 호출했을 때 댓글마다 `Member` 조회 쿼리가 추가 발생

**⚠️결과**

- 일정 1건 + 댓글 N개 -> `1 + 1 + N` 쿼리 발생
- 댓글 수가 많아질수록 쿼리 수도 기하급수적으로 증가

### 🔍 원인

#### 연관관계 로딩 전략

- 지연 로딩(LAZY) 전략을 사용
- 연관된 엔티티(`Member`)를 처음 접근할 때 추가 SELECT 쿼리 실행
- FK인 id 값이 아닌 다른 속성(name)은 DB에서 가져와야 함

`Comment.java`
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "schedule_id")
private Schedule schedule;
```

### ✅ 해결

#### DTO Projections 사용

연관관계의 Entity를 추가 쿼리하지 않도록 필요한 값만 1번의 쿼리로 SELECT 하여 DTO로 바로 매핑했다.   
핵심은 Entity가 아닌 DTO를 직접 조회하므로, **LAZY 프록시** 접근 자체가 없고, `Fetch Join`이 필요하지 않다는 점이다.

> 💡 **LAZY 프록시**
>
> 연관 Entity를 즉시 로딩하지 않고 프록시 객체를 먼저 주입해 두었다가, 필요할 때(접근 시점) 실제 SELECT를 실행해 초기화하는 매커니즘
{: .prompt-info}

```java
@RequiredArgsConstructor
public class CommentRepositoryImpl implements CommentRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<CommentSearchResponseDto> findAllByScheduleId(Long scheduleId) {

        QComment qComment = QComment.comment;
        QMember qMember = QMember.member;

        return queryFactory
                .select(Projections.constructor(
                        CommentSearchResponseDto.class,
                        qComment.id,
                        qMember.name,
                        qComment.content,
                        qComment.createdAt,
                        qComment.modifiedAt
                ))
                .from(qComment)
                .join(qComment.member, qMember)
                .where(
                        qComment.schedule.id.eq(scheduleId),
                        qComment.deletedAt.isNull()
                )
                .orderBy(qComment.modifiedAt.desc())
                .fetch();
    }
}
```

#### 실행 쿼리

```sql
SELECT c.id, m.name, c.content, c.created_at, c.modified_at
FROM comment c
JOIN member m ON c.member_id = m.id
WHERE c.schedule_id = ?
  AND c.deleted_at IS NULL
ORDER BY c.modified_at DESC;
```

- 컬럼 단위 조회라서 **전송량과 매핑 비용이 작다.** (불필요한 Entity Graph를 로딩하지 않음)

#### 적용 후 Service Layer 코드

`ScheduleServiceImpl.java`
```java
@Transactional(readOnly = true)
public ScheduleSearchDetailResponseDto findById(Long id) {

    Schedule findSchedule = scheduleRepository.findWithMemberByIdOrElseThrow(id);
    List<CommentSearchResponseDto> findCommentList = commentRepository.findAllByScheduleId(findSchedule.getId());

    return ScheduleSearchDetailResponseDto.from(findSchedule, findCommentList);
}
```

### 💡 결론

- `N+1`은 **LAZY + 연관 Entity 탐색** 패턴에서 발생한다.
- `DTO Projections`는 페이징 처리에도 유리하다.

## 트러블슈팅2️⃣

---

### ⭐️ 주제

수정 직후 `modifiedAt` 응답 데이터 반영 (`Dirty Checking`  + `saveAndFlush`)

### 🔥 발생

일정 수정 직후, 응답에서 `modifiedAt`(수정일)이 즉시 반영되지 않는 상황이 발생했다.

### 🔍 원인

`MemberServiceImpl.java`
```java
@Override
@Transactional
public MemberUpdateResponseDto update(Long memberId, Long authMemberId, MemberUpdateRequestDto requestDto) {

    Member findMember = memberRepository.findByIdOrElseThrow(memberId);

    memberPolicy.checkOwnerOrThrow(findMember, authMemberId);

    // Dirty Checking
    // Entity의 필드만 변경 (영속 상태)
    findMember.updateName(requestDto.getName());
    findMember.updateEmail(requestDto.getEmail());

    // ⚠️ modifiedAt이 세팅되기 전 DTO 변환
    return MemberUpdateResponseDto.from(findMember);
}
```

- Auditing 적용 시점
  : `@LastModifiedDate`는 Entity 변경이 감지된 뒤 `flush` 과정에서 `Auditing Listener`가 값을 채워 넣는다.

- 문제 원인
  : `flush` 이전에 Entity를 DTO로 변환해 응답을 만들면, 아직 `modifiedAt`이 세팅되지 않았기 때문에 이전 값이 DTO에 담길 수 있다.

### ✅ 해결

- `saveAndFlush`로 즉시 동기화
  - 수정 직후 같은 메서드 안에서 바로 목록/상세를 다시 조회해야 한다면, DB에 즉시 반영해야 한다.
  - 이때 `saveAndFlush`로 즉시 `flush` 하여 `modifiedAt`을 DB에 반영시킨 뒤, DTO로 매핑한다.

`MemberServiceImpl.java`
```java
@Override
@Transactional
public MemberUpdateResponseDto update(Long memberId, Long authMemberId, MemberUpdateRequestDto requestDto) {

    Member findMember = memberRepository.findByIdOrElseThrow(memberId);

    memberPolicy.checkOwnerOrThrow(findMember, authMemberId);

    // Dirty Checking
    // Entity의 필드만 변경 (영속 상태)
    findMember.updateName(requestDto.getName());
    findMember.updateEmail(requestDto.getEmail());

    // ✅ 변경 내용을 DB에 반영하여 즉시 동기화
    memberRepository.saveAndFlush(findMember);

    // modifiedAt 정상 세팅된 상태로 DTO 변환
    return MemberUpdateResponseDto.from(findMember);
}
```

### 💡 결론

- 문제의 본질은 수정 → 즉시 조회 흐름에서 `flush` 타이밍이 늦어 `modifiedAt`이 아직 DB에 반영되지 않은 채 영속 컨텍스트의 기존 스냅샷을 재사용한 데 있다.
- `Dirty Checking`으로 자연스럽게 수정하고, 즉시 반영이 필요한 경우에만 `saveAndFlush`(혹은 `flush`)로 DB 동기화를 앞당긴 뒤 조회하면 `modifiedAt`이 바로 응답에 반영된다.
