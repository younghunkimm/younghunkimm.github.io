---
title: "[Java] 예외 처리(try-catch)와 예외 던지기(throws)"
categories: [Java, Java/Basic]
tags: [Java, Error, Exception, try-catch, throws, TIL]
date: '2025-08-19 19:55:00 +0900'
---

## try-catch

---

예외 처리는 안정적인 프로그램을 만들기 위해 필수적인 기능이다.
그것을 위해 자바에서는 `try-catch` 문을 사용한다.

### try-catch 기본 구조

```java
try {
    // 예외가 발생할 가능성이 있는 코드
} catch ([예외타입] [변수명]) {
    // 예외 발생 시 실행되는 코드
}
```

### 예제

#### 예제 코드

```java
public class TryCatchExample {
    public static void main(String[] args) {
        try {
            int result = 10 / 0; // 💥 ArithmeticException 발생
            System.out.println("결과: " + result);
        } catch (ArithmeticException e) {
            System.out.println("0으로 나눌 수 없습니다: " + e.getMessage());
        }

        System.out.println("프로그램 계속 실행");
    }
}
```

#### 출력 결과

```bash
0으로 나눌 수 없습니다: / by zero
프로그램 계속 실행
```

### 다중 catch 블록

하나의 `try`에 여러 개의 `catch`를 붙여 다양한 예외 처리 가능

```java
try {
    String text = null;
    System.out.println(text.length()); // 💥 NPE 발생
} catch (ArithmeticException e) {
    System.out.println("수학적 예외: " + e.getMessage());
} catch (NullPointerException e) {
    System.out.println("Null 참조 예외: " + e.getMessage());
} catch (Exception e) { // ⚠️ 상위 예외(Exception)가 가장 아래에 있어야 함
    System.out.println("그 외 예외: " + e.getMessage());
}
```

### 다중 예외 한 번에 처리 (Java 7+)

`|` 연산자로 여러 예외를 한 블록에서 처리 가능

```java
try {
    // 예외 가능 코드
} catch (IOException | SQLException e) {
    e.printStackTrace();
}
```

### finally 블록

예외 발생 여부와 관계없이 **항상 실행**되는 블록   
주로 **리소스 해제**(파일 닫기, DB 연결 종료 등)에 사용한다.

```java
try {
    FileInputStream fis = new FileInputStream("test.txt");
} catch (FileNotFoundException e) {
    System.out.println("파일을 찾을 수 없습니다.");
} finally {
    System.out.println("리소스 정리 작업 수행");
}
```

### try-with-resources (Java 7+)

자동으로 리소스를 닫아주는 기능

> 💡 `AutoCloseable` 인터페이스 구현 객체만 가능
{: .prompt-info}

```java
try (FileInputStream fis = new FileInputStream("test.txt")) {
    // 파일 읽기 작업
} catch (IOException e) {
    e.printStackTrace();
}
```

## throws 키워드 (예외 던지기)

---

`throws` 키워드는 메서드가 호출자에게 예외 처리를 위임할 때 사용한다.   
즉, 해당 메서드에서 예외가 발생할 수 있음을 선언하고, 처리 책임을 호출한 쪽에 넘기는 역할을 한다.

### 기본 문법

```java
[반환타입] [메서드명(매개변수)] throws [예외타입1], [예외타입2] {
    // 메서드 내용
}
```

- `throws` 뒤에는 **발생 가능한 예외 타입**을 쉼표로 구분해 나열한다.
- 여러 예외를 동시에 선언 가능하다.

### 예제 코드

```java
public void readFile(String path) throws IOException {
    FileReader reader = new FileReader(path); // IOException 발생 가능
    reader.close();
}
```

- `IOException`은 **Checked Exception**이므로, 반드시 `throws`로 선언하거나 메서드 내부에서 `try-catch`로 처리해야 한다.

#### 호출한 쪽에서 처리

```java
public static void main(String[] args) {
    try {
        readFile("test.txt");
    } catch (IOException e) {
        System.out.println("파일 읽기 실패: " + e.getMessage());
    }
}
```
