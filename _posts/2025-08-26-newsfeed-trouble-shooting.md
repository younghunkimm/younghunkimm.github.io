---
title: "[Spring] 뉴스피드 프로젝트 트러블슈팅 기록"
categories: [Spring, Spring/Trouble Shooting]
tags: [Java, spring, Trouble Shooting]
date: '2025-08-26 20:15:00 +0900'
---

뉴스피드 프로젝트를 진행하면서 겪은 트러블슈팅의 과정들에 대한 기록입니다.

## 트러블슈팅

---

### ⭐️ 주제

`EmbeddedId`로 복합키를 사용할 때 JPA `save()` 시 불필요한 `SELECT` 쿼리 발생 문제와 `Persistable`을 통한 해결

### 🔥 발생

`BoardLike` Entity에서 `EmbeddedId(boardId + userId)`를 PK로 사용하여 좋아요를 저장할 때,   
`boardLikeRepository.save(BoardLike.of(user, board))` 호출 시 예상과 달리 `INSERT`만 실행되지 않고,   
`SELECT` + `INSERT`가 연이어 발생하였다.   

즉, 저장 전에 불필요한 조회 쿼리가 항상 발생하는 현상이 생겼다.

`LikeService.java`
```java
@Transactional
public LikeToggle.Response toggleBoardLike(Long boardId, Long loginUserId) {

    Board findBoard = boardRepository.findByIdOrElseThrow(boardId);

    if (findBoard.isOwnedBy(loginUserId)) {
        throw new GlobalException(LikeErrorCode.CANNOT_LIKE_OWN_BOARD);
    }

    User findUser = userRepository.findByIdOrElseThrow(loginUserId);

    BoardLikeId boardLikeId = BoardLikeId.builder()
            .boardId(findBoard.getId())
            .userId(findUser.getId())
            .build();

    boolean liked = boardLikeRepository.existsById(boardLikeId);

    if (liked) {
        boardLikeRepository.deleteById(boardLikeId);
        boardRepository.decrementLikeCount(findBoard.getId());
    } else {
        boardLikeRepository.save(BoardLike.of(findBoard, findUser)); // 좋아요 저장 (문제 발생 지점)
        boardRepository.incrementLikeCount(findBoard.getId());
    }

    long likeCount = boardRepository.findLikeCountById(findBoard.getId());

    return LikeToggle.Response.builder()
            .liked(!liked)
            .likeCount(likeCount)
            .build();
}
```

`BoardLike.java`

**`of` 메서드에서 내부적으로 `BoardLikeId`를 생성하는 것을 확인할 수 있다.**

```java
@Getter
@Entity
@Table(name = "board_likes")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoardLike extends BaseEntity {

    @EmbeddedId
    private BoardLikeId id;

    @MapsId("boardId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private BoardLike(BoardLikeId id, Board board, User user) {
        this.id = id;
        this.board = board;
        this.user = user;
    }

    public static BoardLike of(Board board, User user) {

        return new BoardLike(new BoardLikeId(board.getId(), user.getId()), board, user);
    }
}
```

### 🔍 원인

- JPA의 `save()`는 Entity가 새로운 데이터인지 여부에 따라 동작 방식이 다르다.
  - 새로운 Entity라 판단되면 `persist()` 실행 (바로 `INSERT`)
  - 기존 Entity라 판단되면 `merge()` 실행 (DB 조회 후 `INSERT` or `UPDATE`)
- `EmbeddedId`를 사용하면 ID 값이 null이 아니므로 JPA는 해당 Entity를 **이미 존재하는 데이터**로 판단한다.
- 그 결과, `merge()` 로직이 실행되며 항상 `SELECT` 쿼리를 실행한 뒤 `INSERT`가 발생하는 현상이 나타난다.

### ✅ 해결

Entity가 새로운 데이터임을 직접 JPA에게 명시하기 위해 `Persistable<T>` 인터페이스를 구현하였다.   
`isNew()` 메서드를 오버라이딩하여 **`createdAt` 값이 없는 경우에만 새로운 Entity로 간주**하도록 변경했다.

`BoardLike.java`
```java
public class BoardLike extends BaseEntity implements Persistable<BoardLikeId> {

    @EmbeddedId
    private BoardLikeId id;

    @MapsId("boardId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private BoardLike(BoardLikeId id, Board board, User user) {
        this.id = id;
        this.board = board;
        this.user = user;
    }

    public static BoardLike of(Board board, User user) {

        return new BoardLike(new BoardLikeId(board.getId(), user.getId()), board, user);
    }

    // isNew() 메서드를 오버라이딩
    @Override
    public boolean isNew() {
        return getCreatedAt() == null;
    }
}
```

이로써 `save()` 호출 시 항상 `persist()`가 실행되어 불필요한 `SELECT` 쿼리 없이 바로 `INSERT`만 수행되도록 개선할 수 있었다.

### 💡 결론

- `@EmbeddedId`를 사용할 때는 JPA가 Entity를 항상 "기존 데이터"로 잘못 판단할 수 있다.
- 이로 인해 저장 시 불필요한 조회 쿼리가 추가되며, 좋아요와 같이 트래픽이 많은 기능에서는 성능 저하로 이어질 수 있다.
- `Persistable`을 구현하여 `isNew()`를 명시적으로 정의하면, JPA가 Entity의 생명주기를 올바르게 인식할 수 있고 `INSERT`만 수행되는 효율적인 저장 로직을 보장할 수 있다.
