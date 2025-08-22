---
title: "[Spring] 커스텀 예외(Custom Exception)와 전역 예외 처리"
categories: [Spring]
tags: [Java, spring, Custom Exception, TIL]
date: '2025-08-22 21:01:00 +0900'
---

## 커스텀 예외

---

기본 예제 및 설명은 [여기]({{ site.baseurl }}/posts/java-custom-exception)에서 확인하실 수 있습니다.

## Spring에서 커스텀 예외가 필요한 이유

---

- **응답 일관성**: 모든 실패를 같은 JSON 스키마로 반환
- **관심사 분리**: Controller/Service는 throw만, 포맷팅은 전역 핸들러가 담당
- **테스트 용이성**: 케이스별 예외 타입으로 분기 테스트가 쉬움

## 패키지 구조 예시

---

```plaintext
global
 ├─ exception
 │   ├─ ErrorCode.java
 │   ├─ BusinessException.java
 │   ├─ NotFoundException.java
 │   ├─ UnauthorizedException.java
 │   └─ GlobalExceptionHandler.java
 └─ dto
     └─ response
         └─ ErrorResponseDto.java
domain
 └─ user ...
```

## 에러 코드 설계(HTTP + 비즈니스 코드)

---

`ErrorCode.java`
```java
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 4xx
    USER_NOT_FOUND(404, "U001", "존재하지 않는 사용자입니다."),
    INVALID_CREDENTIALS(401, "A001", "이메일 또는 비밀번호가 올바르지 않습니다."),
    VALIDATION_FAILED(400, "C001", "요청 값이 유효하지 않습니다."),

    // 5xx
    INTERNAL_ERROR(500, "S500", "서버 오류가 발생했습니다.");

    private final int status;
    private final String code;
    private final String message;
}
```

## 베이스 예외 + 구체 예외

---

### 베이스 예외

`BusinessException.java`
```java
@Getter
public class BusinessExcetpion extends RuntimeException {
    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
```

### 구체 예외1️⃣

`NotFoundException.java`
```java
public class NotFoundException extends BusinessException {
    public NotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
```

### 구체 예외2️⃣

`UnauthorizedException.java`
```java
public class UnauthorizedException extends BusinessException {
    public UnauthorizedException(ErrorCode errorCode) {
        super(errorCode);
    }
}
```

### 사용 예

```java
// Service Layer
public User getUser(Long id) {
    return userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
}
```

## 전역 예외 처리

---

`ErrorResponseDto.java`
```java
@Getter
@RequiredArgsConstructor
public class ErrorResponseDto {
    private final String code;    // 비즈니스 코드(U001 등)
    private final String message; // 사용자 메세지
    private final int status;     // HTTP 상태 코드

    public static ErrorResponseDto of(ErrorCode ec) {
        return new ErrorResponseDto(
                ec.getCode(),
                ec.getMessage(),
                ec.getStatus()
        )
    }
}
```

`GlobalExceptionHandler.java`
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponseDto> handleBusiness(BusinessException ex) {

        ErrorCode ec = ex.getErrorCode();
        
        return ResponseEntity.status(ec.getStatus()).body(ErrorResponseDto.of(ec));
    }

    // 마지막 안전망
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleAll(Exception ex) {
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponseDto.of(ErrorCode.INTERNAL_ERROR));
    }

}
```

## 컨트롤러단 사용 예시

---

```java
@PostMapping("/login")
public void login(
        @Valid @RequestBody LoginRequestDto requestDto
) {
    if (!passwordMatches(requestDto)) {
        throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }
}
```

## 클라이언트 응답 예시

---

```json
{
    "code": "U001",
    "message": "존재하지 않는 사용자입니다.",
    "status": 404
}
```
