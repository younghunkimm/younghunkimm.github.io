---
title: "[Spring] TaskFlow 트러블슈팅 기록"
categories: [Spring, Spring/Trouble Shooting]
tags: [spring, 트러블슈팅, Trouble Shooting, TIL]
date: '2025-09-08 11:30:00 +0900'
---

TaskFlow 과제를 진행하면서 겪은 트러블슈팅의 과정들에 대한 기록입니다.   
해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/taskflow-spring){:target="_blank"} 에서 확인하실 수 있습니다.

## 트러블슈팅

---

### ⭐️ 주제

`@PreAuthorize` 권한 실패 시 500 에러 발생   
왜 `AccessDeniedHandler`가 아닌 `GlobalExceptionHandler`가 호출되었을까?

### 🔥 발생

- 권한이 없는 사용자가 `@PreAuthorize`가 붙은 API를 호출
  
```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole('ADMIN')")
public @interface AdminOnly{
}
```
    
```java
@AdminOnly // 관리자만 접근 가능
@PostMapping("/api/teams") // 해당 API를 호출
@ResponseStatus(HttpStatus.CREATED)
public CommonResponse<CreateTeamResponse> createTeam(
    @Valid @RequestBody
    CreateTeamRequest createTeamRequest) {
    CreateTeamResponse createTeamResponse = createTeamUseCase.execute(
        createTeamRequest.name(),
        createTeamRequest.description());

    return CommonResponse.success("팀이 성공적으로 생성되었습니다.", createTeamResponse);
}
```

- 기대: `403 Forbidden`
- 실제: `500 Internal Server Error`
- `CustomAccessDeniedHandler` 로그가 찍히지 않음
- 대신 `GlobalExceptionHandler`가 모든 예외를 받아 JSON 변환 실패 → 500 발생

### 🔍 원인

1. 예외 처리 경로 차이

   - URL 기반 인가(`authorizeHttpRequests`) → `Security Filter Chain` 단계에서 실패 → `AccessDeniedHandler`가 처리
   - 메서드 기반 인가(`@PreAuthorize`) → 컨트롤러 진입 직전 `AOP` 단계에서 실패 → `Spring MVC` 예외 처리 흐름 → `GlobalExceptionHandler`가 처리

2. 직렬화 오류

   - `GlobalExceptionHandler`가 `HttpStatus` 객체를 응답 바디에 직접 담음
   - Jackson이 `HttpStatus` 객체를 JSON으로 변환하지 못해 500 에러 발생

### ✅ 해결

- `GlobalExceptionHandler`에서 `AccessDeniedException`을 명시적으로 처리하도록 수정

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    // ... 생략 ...

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<CommonResponse<?>> handleAccessDeniedException(AccessDeniedException ex) {
        ErrorCode errorCode = AuthErrorCode.FORBIDDEN;
        HttpStatus status = errorCode.getHttpStatus();
        String message = errorCode.getMessage();
        return new ResponseEntity<>(CommonResponse.failure(message, null), status);
    }

    // ... 생략 ...
}
```

### 💡 결론

- `@PreAuthorize`에서 발생하는 권한 실패 예외는 보안 필터 체인 밖에서 발생하므로 `AccessDeniedHandler`가 아닌 `GlobalExceptionHandler`가 처리한다.
- 따라서 권한 예외는 `GlobalExceptionHandler`에서 명시적으로 처리해야 한다.
