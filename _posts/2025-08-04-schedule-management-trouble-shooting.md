---
title: "[Spring] 일정관리 프로젝트 트러블슈팅 기록"
categories: [Spring, Spring/Trouble Shooting]
tags: [Java, spring, JPA, MySQL, Trouble Shooting]
date: '2025-08-04 10:02:00 +0900'
---

일정관리 프로젝트를 진행하면서 겪은 트러블슈팅의 과정들에 대한 기록입니다.   
해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/schedule-management-api){:target="_blank"} 에서 확인하실 수 있습니다.

## 트러블슈팅

---

### ⭐️ 주제

`JPA`를 사용해 일정 전체 목록 `LIKE` 조회하기

### 🔥 발생

Query Parameter 로 `name` 값을 받아 작성자명이 해당 문자열을 포함하는 일정 목록을 조회하는 기능을 구현했으나 문제가 발생하였다.
아래는 그 당시 작성했던 코드이다.

`ScheduleController`
```java
@GetMapping
public ResponseEntity<List<ScheduleResponseDto>> findAllSchedules(
        @RequestParam(required = false) String name
) {

    return new ResponseEntity<>(scheduleService.findAllSchedules(name), HttpStatus.OK);
}
```

`ScheduleServiceImpl`
```java
@Transactional(readOnly = true)
@Override
public List<ScheduleResponseDto> findAllSchedules(
        String name
) {

    // 💥 문제의 로직
    return scheduleRepository.findAll().stream()
            .filter(schedule -> {
                if (schedule.getName() != null && !schedule.getName().isEmpty()) {
                    return schedule.getName().contains(name);
                }
                return false;
            })
            .map(ScheduleResponseDto::new)
            .toList();
}
```

이후, Postman으로 테스트를 해보니 몇몇 케이스들은 정상적으로 조회되지 않았다.

#### Case1

- 요청: `GET /schedules` 또는 `GET /schedules?test=123`
- 결과: 500 Internal Server Error

```json
{
    "timestamp": "2025-07-30T08:45:04.702+00:00",
    "status": 500,
    "error": "Internal Server Error",
    "path": "/schedules"
}
```

#### Case2

- 요청: `GET /schedules?name=abc`
- 결과: 정상적으로 빈 배열 반환

```json
[]
```

#### Case3

- 요청: `GET /schedules?name=홍길동`
- 결과: 모든 데이터가 필터링 없이 반환됨

```json
[
    {
        "id": 1,
        "title": "임꺽정의 일정 제목",
        "contents": "임꺽정의 일정 내용",
        "name": "임꺽정",
        "createdAt": "2025-07-30T12:38:28.981426",
        "modifiedAt": "2025-07-30T12:38:28.981426"
    },
    {
        "id": 2,
        "title": "홍길동의 일정 제목",
        "contents": "홍길동의 일정 내용",
        "name": "홍길동",
        "createdAt": "2025-07-30T12:33:37.520361",
        "modifiedAt": "2025-07-30T12:33:37.520361"
    }
]
```

### 🔍 원인

Query Parameter의 `name` 값의 null 체크 누락

```java
return schedule.getName().contains(name);
```

해당 부분에서 name 값이 null 이면 NPE 발생하여 에러 발생 (Case1)   

하지만 제일 중요한 문제점은 현재 DB에서 `findAll()`   
즉, 전체 조회를 먼저한 후에 비즈니스 로직에서 필터링한다는 것이다.

### ✅ 해결

JPA는 메서드 이름을 해석하여 자동으로 JPQL 쿼리를 생성하여 처리한다.   
`findByNameContaining()` 이라는 메서드를 사용하여 `LIKE` 검색을 할 수 있다.

`ScheduleRepository`

> JpaRepository 기본 제공 메서드가 아니기 때문에 선언이 필요하다.\
> 기본 제공 메서드에는 `findById()`, `findAll()`, `save()`, `deleteById()` 등이 있다.\
> 이 메서드들은 `SimpleJpaRepository` 라는 클래스에 미리 구현되어 있다.

```java
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByNameContaining(String name); // JPQL: WHERE name LIKE %?%
}
```

`ScheduleServiceImpl`

```java
@Transactional(readOnly = true)
@Override
public List<ScheduleResponseDto> findAllSchedules(
        String name
) {

    List<Schedule> foundSchedules;
    if (name != null && !name.isEmpty()) {
        foundSchedules = scheduleRepository.findByNameContaining(name);
    } else {
        foundSchedules = scheduleRepository.findAll();
    }

    return foundSchedules.stream()
            .map(ScheduleResponseDto::new)
            .toList();
}
```

### ✨ 추가

만약 수정일 기준으로 내림차순 정렬하여 조회하고 싶다면?

`ScheduleRepository`
```java
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByNameContainingOrderByModifiedAtDesc(String name); // JPQL: WHERE name LIKE %?% ORDER BY modified_at DESC

    List<Schedule> findAllByOrderByModifiedAtDesc(); // JPQL: ORDER BY modified_at DESC
}
```

### 💡 결론

- 조건부 검색은 반드시 JPA 레벨에서 처리해야 한다.
  - 비즈니스 로직 조건 필터링을 하면 전체 데이터를 불필요하게 메모리에 적재하게 되어 성능이 떨어진다.
- **Query Parameter** 값은 **null 여부를 반드시 체크**해야 한다.
  - null 체크 누락 시 `NullPointerException` 발생
- JPA 메서드 명명 규칙을 잘 활용하면 간결하고 안전한 코드 작성이 가능하다.

## 유효성 검사 및 데이터 가공 레이어별 기준

---

- `DTO` or `Repository`
  : 간단한 규칙(무조건 영어, 무조건 숫자 등)
- `Controller`
  : 사용하는 `DTO`는 같은데 규칙이 다를 때
- `Service`
  : 복잡한 비즈니스 로직

## Dirty Checking

---

`ScheduleServiceImpl`

> 메서드에 `@Transactional` 어노테이션이 있다면 `Setter`만 호출해도 DB 업데이트가 반영된다.

```java
if (StringUtils.hasText(requestDto.getTitle())) schedule.updateTitle(requestDto.getTitle());
if (StringUtils.hasText(requestDto.getName())) schedule.updateName(requestDto.getName());
```