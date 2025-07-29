---
title: "[Architecture] Layered Architecture"
categories: [Architecture]
tags: [Java, spring, spring boot, architecture, layered architecture]
date: '2025-07-28 20:20:00 +0900'
---

## 💡 레이어드 아키텍쳐란?

---

**레이어드 아키텍쳐**는 소프트웨어를 역할별로 수직 계층(layer) 으로 나누는 설계 방식이다.   
각 계층은 자신의 책임만 수행하며, 하위 계층에만 의존하는 구조를 가진다.   

이 구조는 관심사의 분리(Separation of Concerns)를 통해   
코드의 **가독성, 유지보수성, 재사용성을 향상**시키는 데 목적이 있다.

## 📚 주요 레이어 구성 (4계층)

---

![4layered]({{ site.baseurl }}/assets/img/posts/250729/250729-1.png){: style="width: 500px; max-width: 100%;"}

> 위 방향으로만 의존하도록 설계\
> 예를 들어, Repository가 Service 호출❌
{: .prompt-warning}

### 계층별 설명

1. **Presentation Layer (Controller)**
   - 웹 요청 수신, 요청 흐름 제어
   - 클라이언트의 요청을 받고 응답을 반환하는 역할 (Request, Response)

2. **Business Layer (Service)**
   - 핵심 비즈니스 로직 수행

3. **Persistence Layer (Repository)**
   - 데이터베이스와 직접 통신하는 계층 (JPA, MyBatis 등)

4. **Database Layer (DB)**
   - DB 테이블과 매핑되는 핵심 도메인 객체

### DTO (Data Transfer Object)

- Controller ⇌ Service 또는 Service ⇌ 외부 API 간 데이터 전달용
- Entity를 직접 노출하지 않기 위해 사용

## 💻 도서 관리 시스템 예시

---

### API 흐름

```plaintext
[클라이언트 요청]
  ↓요청  ↑응답
Controller (BookController)
  ↓호출  ↑결과
Service (BookService)
  ↓호출  ↑결과
Repository (BookRepository)
  ↓조회  ↑결과
Entity (Book)  ⇌  DB Table (books)
```

### 코드(조회 기능) 예시

`controller/BookController.java`
```java
@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // 1. 클라이언트가 "/books/{id}" 로 Get 요청
    // ?keyword=
    @GetMapping
    public ResponseEntity<List<BookDto>> searchBooks(
        @RequestParam(required = false) String keyword;
    ) {
        // 클라이언트에게 응답 시 Dto 로 매핑
        List<BookDto> bookDtoList;

        // 2. Service 조회 기능 호출
        if (keyword != null && !keyword.trim().isEmpty()) {
            bookDtoList = bookService.findByKeyword(keyword);
        } else {
            bookDtoList = bookService.findAll();
        }

        // 응답
        return ResponseEntity.ok(bookDtoList);
    }
}
```

`service/BookService.java`
```java
@service
public class BookService {
    private final BookRepository bookRepository;
    
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // 3. 실제 DB 조회는 Repository 에 위임(호출)
    public List<BookDto> findAll() {
        // 결과 데이터를 DTO 로 매핑 후 Controller 에게 반환
        return bookRepository.findAll()
                .stream()
                .map(BookDto::new)
                .toList();
    }

    public List<BookDto> findByKeyword(String keyword) {
        return bookRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(BookDto::new)
                .toList();
    }
}
```

`repository/BookRepository.java`
```java
// 4. DB 조회
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCase(String keyword);
}
```

`entity/Book.java`
```java
@Getter
@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String category;
    private LocalDateTime createdAt;

    public Book() {}

    public Book(String title, String author, String isbn, String category) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.category = category;
        this.createdAt = LocalDateTime.now();
    }
}
```

`dto/BookDto.java`
```java
@Getter
public class BookDto {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String category;
    private String createdAt;

    public BookDto(Book book) {
        this.id = book.getId();
        this.title = book.getTitle();
        this.author = book.getAuthor();
        this.isbn = book.getIsbn();
        this.category = book.getCategory();
        this.createdAt = book.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
}
```

## ❓ 왜 관심사를 분리해야할까?

---

`Presentation Layer(Controller)` 에서 직접 `DB` 에 접근하는 것이 훨씬 빠르고 직관적일텐데,   
왜 관심사를 분리해야할까?   

### 1️⃣ 유지보수가 쉬워짐

기능별로 코드가 분리되어 있기 때문에,   
어느 부분을 수정해야 하는지 명확하게 파악할 수 있어   
디버깅과 유지보수가 편해진다.

### 2️⃣ 변경에 유연함

예를 들어

- 데이터베이스를 `MySQL` → `MongoDB` 로 바꿀 때 `Repository` 만 수정
- 응답 포맷을 `JSON` → `XML` 로 바꿀 때 `Controller` 만 수정

**즉, 한 부분을 바꿔도 다른 부분에 영향이 적다.**

### 3️⃣ 테스트가 쉬워짐

- 각 계층을 독립적으로 테스트할 수 있어서 단위 테스트 작성이 용이
- `DB` 없이도 `Service` 계층을 테스트할 수 있다.

### 4️⃣ 협업이 효율적

- 역할이 분리되어 있고, 구조가 명확하기 때문에 협업에 유리
  - A개발자: `Controller`
  - B개발자: `Repository`
  - C개발자: `Service`

### 5️⃣ 공통 기능 처리에 유연

로깅, 보안, 트랜잭션 등

### 6️⃣ 재사용성 증가

`Service`, `Repository` 등의 로직을 다른 곳에서 재활용이 가능하다.

### 📝 정리

이처럼 관심사를 분리하면 코드가 더 명확해지고, 깔끔하고, 테스트하기 쉬운 구조가 된다.   
관심사 분리는 단순한 설계 규칙이 아닌, 유지보수성과 확장성을 높이는 핵심 원칙이다.

## ⚠️ 단점

---

1. 계층 간 경계 약화 위험
   - 한 레이어가 너무 많은 책임을 질 경우 비대해질 수 있다. (특히 `Service`)

2. 단방향 구조의 한계
   - 지나치게 계층화되면 복잡한 로직 흐름이 오히려 불편해질 수 있다.

3. 도메인 중심이 아님
   - 비즈니스 도메인을 중심으로 설계하는 DDD, 클린 아키텍쳐보다 유연성이 낮다.
