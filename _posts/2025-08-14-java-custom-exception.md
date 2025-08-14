---
title: "[Java] 커스텀 예외(Custom Exception)"
categories: [Java, Java/Basic]
tags: [Java, Error, Exception, Custom Exception, TIL]
date: '2025-08-14 18:49:00 +0900'
---

## 커스텀 예외(Custom Exception)

---

### 커스텀 예외란?

자바에서 **커스텀 예외(Custom Exception)**는 `Exception` 클래스 또는 `RuntimeException` 클래스를 상속받아 직접 정의하는 예외 클래스이다.

### 커스텀 예외를 사용하는 이유

1. **가독성 및 유지보수성 향상**
   - 애플리케이션의 특정 비즈니스 로직에서 발생하는 오류를 명확한 이름의 예외로 정의하면, 코드를 읽는 개발자가 어떤 문제가 발생했는지 쉽게 파악할 수 있다.

2. **오류 처리의 명확성**
   - `try-catch` 블록에서 특정 커스텀 예외만 따로 처리할 수 있어, 오류 처리 로직을 더 세밀하게 제어할 수 있다.

3. **추가 정보 제공**
   - 예외 객체에 에러 코드, 상세 메세지 등 추가 정보를 담아 오류 발생 원인을 더 자세하게 전달할 수 있다.

### 커스텀 예외 생성 방법

1. **Checked Exception**
   - `Exception` 클래스를 상속
   - 이 예외는 반드시 `try-catch`로 처리하거나 `throws` 키워드를 사용해 호출한 메서드로 예외를 던져야 한다.

2. **Unchecked Exception**
   - `RuntimeException` 클래스를 상속
   - 이 예외는 개발자의 실수로 발생하는 경우가 많아, 따로 처리하지 않아도 컴파일 오류가 발생하지 않는다.

> 대부분의 경우 `RuntimeException`을 상속받는 것을 권장한다.\
> 예외가 발생할 때마다 `throws`를 선언하거나 `try-catch`로 감싸는 번거로움을 줄일 수 있기 때문
{: .prompt-tip}

### 커스텀 예외 기본 예제

```java
// 1. RuntimeException을 상속받는 커스텀 예외 클래스 정의
class InvalidNumberException extends RuntimeException {
    // 메세지를 인자로 받는 생성자
    public InvalidNumberException(String message) {
        super(message);
    }
}

// 2. 예외를 발생시키는 메서드
public class CustomExceptionExample {
    public static int getPositiveNumber(int number) {
        if (number <= 0) {
            // 0 이하의 숫자가 입력되면 커스텀 예외를 던진다.
            throw new InvalidNumberException("양수만 입력 가능합니다.");
        }
        return number;
    }

    public static void main(String[] args) {
        try {
            // 정상적인 경우
            int result1 = getPositiveNumber(10);
            System.out.println("입력된 양수: " + result1);

            // 예외가 발생하는 경우
            int result2 = getPositiveNumber(-5); // 💥 커스텀 예외 발생
            System.out.println("입력된 양수: " + result2);
        } catch (InvalidNumberException e) {
            // 커스텀 예외를 잡아서 처리
            System.out.println("오류 발생: " + e.getMessage());
        }
    }
}
```
