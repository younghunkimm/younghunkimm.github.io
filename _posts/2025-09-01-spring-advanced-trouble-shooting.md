---
title: "[Spring] 스프링 심화 트러블슈팅 기록"
categories: [Spring, Spring/Trouble Shooting]
tags: [spring, 트러블슈팅, Trouble Shooting, TIL]
date: '2025-09-01 10:17:00 +0900'
---

Spring 심화 과제를 진행하면서 겪은 트러블슈팅의 과정들에 대한 기록입니다.   
해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/sparta-spring-advanced){:target="_blank"} 에서 확인하실 수 있습니다.

## 트러블슈팅

---

### ⭐️ 주제

`@WebMvcTest`에서 커스텀 `HandleMethodArgumentResolver(AuthUserArgumentResolver)`를 `@MockBean`으로 대체했는데도 진짜 Resolver가 실행되어 테스트가 실패하는 문제

### 🔥 발생

- 테스트 구성
  - `@WebMvcTest(CommentController.class)`
  - `@MockBean AuthUserArgumentResolver authUserArgumentResolver`
- 기대: 가짜(Mock) Resolver가 동작
- 실제: 컨텍스트에 등록된 진짜 Resolver가 실행되며, 테스트 환경에선 `JwtFilter`가 동작하지 않기 때문에 `request`에 값이 존재하지 않아 NPE 발생하여 테스트 실패

### 🔍 원인

#### DI 없이 new로 직접 등록

`WebConfig`가 `new AuthUserArgumentResolver()`로 객체를 직접 생성하면, 스프링 DI 컨테이너를 거치지 않는다.   
따라서 `@MockBean`으로 만든 가짜 빈이 대체할 수 없다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addArgumentResolvers(List<HandleMethodArgumentResolver> resolvers) {
        resolvers.add(new AuthUserArgumentResolver()); // ⚠️ 직접 생성
    }
}
```

#### @WebMvcTest의 동작 특성

- `@WebMvcTest`는 웹 계층만 로딩하는 "미니 컨텍스트"를 띄운다.
- `@MockBean`은 컨테이너에 등록된 빈을 가짜로 교체한다.
- 그러나 Resolver가 빈이 아닌 직접 생성된 객체라면, `@MockBean`이 대체할 수 없다.
- 따라서 ArgumentResolver 목록에는 진짜 객체가 등록된다.

### ✅ 해결

#### 1️⃣ DI로 전환 - 자동으로 Mock 주입

`WebConfig`를 생성자 주입으로 변경하면, 테스트에서 `@MockBean`이 자동으로 그 자리를 차지한다.

```java
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthUserArgumentResolver authUserArgumentResolver; // 빈 주입

    @Override
    public void addArgumentResolvers(List<HandleMethodArgumentResolver> resolvers) {
        resolvers.add(authUserArgumentResolver); // DI로 주입된 빈 사용
    }
}
```

**테스트 코드**

```java
@WebMvcTest(CommentController.class)
class CommentControllerTest {

    private final AuthUser authUser = new AuthUser(1L, "test@test.com", UserRole.USER);

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthUserArgumentResolver authUserArgumentResolver;

    @BeforeEach
    void setUp() throws Exception {
        given(authUserArgumentResolver.supportsParameter(any()))
                .willReturn(true);
        given(authUserArgumentResolver.resolveArgument(any(), any(), any(), any()))
                .willReturn(authUser);
    }

    @Test
    // 테스트 메서드들 ...
}
```

- `@WebMvcTest`가 만든 미니 컨텍스트에서 `WebConfig`가 생성될 때 `@MockBean`이 주입되어 가짜 Resolver가 등록된다.
- 추가 수동 설정이 필요하지 않다.

#### 2️⃣ 수동 MockMvc 구성 - 직접 가짜 Resolver 주입

`@WebMvcTest`를 사용하지 않고, `MockMvcBuilders.standaloneSetup()`으로 `MockMvc`를 직접 구성할 수도 있다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandleMethodArgumentResolver> resolvers) {
        resolvers.add(new AuthUserArgumentResolver()); // 직접 생성
    }
}
```

**테스트 코드**

```java
class CommentControllerTest {

    private final AuthUser authUser = new AuthUser(1L, "test@test.com", UserRole.USER);

    MockMvc mockMvc;

    @Mock
    CommentService commentService;

    @Mock
    AuthUserArgumentResolver authUserArgumentResolver;

    @BeforeEach
    void setUp() throws Exception {
        given(authUserArgumentResolver.supportsParameter(any()))
                .willReturn(true);
        given(authUserArgumentResolver.resolveArgument(any(), any(), any(), any()))
                .willReturn(authUser);

        mockMvc = MockMvcBuilders.standaloneSetup(new CommentController(commentService))
                .setCustomArgumentResolvers(authUserArgumentResolver) // 직접 가짜 Resolver 주입
                .build();
    }

    @Test
    // 테스트 메서드들 ...
}
```

- `WebConfig`의 `new` 등록을 무시하고, 가짜 Mock Resolver를 직접 주입한다.
- 💥 자동 설정되던 `@WebMvcTest`의 기능들을 Builder를 통해 수동으로 구성해야 한다.

### 💡 결론

- 프레임워크 확장 포인트(`ArgumentResolver`, `Interceptor` 등)는 반드시 DI 주입 방식으로 등록해야 한다.
- `new`로 직접 생성하면, 테스트에서 Mocking이 불가능해진다.
- 이 원칙을 지키면 `@WebMvcTest`만으로 깔끔하고 유지보수성 좋은 테스트가 가능하다.
