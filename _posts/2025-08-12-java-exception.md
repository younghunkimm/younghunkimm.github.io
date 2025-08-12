---
title: "[Java] 오류(Error)와 예외(Exception)"
categories: [Java, Java/Basic]
tags: [Java, Error, Exception, TIL]
date: '2025-08-12 20:25:00 +0900'
---

## 오류와 예외

---

Java에서 **오류(Error)**와 **예외(Exception)**는 프로그램 실행 중 발생하는 문제 상황을 나타낸다.   
이 둘은 모두 `Throwable` 클래스를 상속받지만, 성격과 처리 방식이 다르다.

### Throwable

- 모든 예외와 에러의 최상위 클래스
- `throw`로 던질 수 있고, `catch`로 잡을 수 있다.
- 하위 분류: `Error`, `Exception`

### Error

- **JVM 레벨의 심각한 문제**
- 애플리케이션 코드로 복구 불가 → `catch`❌
- 대표 종류
  - `OutOfMemoryError`: 힙 메모리가 부족할 때 발생
  - `StackOverflowError`: 스택 메모리가 부족할 때 발생 (주로 무한 재귀)
- 특징
  - 발생 시 프로그램이 비정상 종료된다.
  - 개발자가 직접 발생시키는 경우는 거의 없다.

### Exception

- `Throwable` → `Exception` 계층
- 프로그램 로직에서 발생할 수 있는 예외를 표현한다.
- `Checked`와 `Unchecked`로 분류된다.

#### Checked Exception

- 컴파일 시점에 예외 처리가 강제된다.
- 반드시 `try-catch`로 처리하거나 `throws`로 선언해야 한다.
- 주로 **외부 환경**과의 상호작용에서 발생한다. (I/O, DB 등)
- 대표 예시
  - `IOException`: 파일/네트워크 입출력 오류
  - `SQLExcetpion`: 데이터베이스 접근 오류
  - `ParseException`: 데이터 파싱 실패
- 특징
  - 발생 가능성이 예측되는 예외
  - 처리하지 않으면 컴파일 에러 발생

#### Unchecked Exception

- `RuntimeException` 및 그 하위 클래스
- **컴파일러가 예외 처리를 강제하지 않는다.**
- 주로 **프로그래밍 오류**나 잘못된 로직에서 발생한다
- 대표 예시
  - `NullPointerException`: null 참조 접근
  - `IndexOutOfBoundsException`: 인덱스 범위 초과
  - `IllegalArgumentException`: 잘못된 인자 전달
- 특징
  - 실행 중(런타임)에 발생
  - 개발자가 로직을 통해 사전에 방지 가능

### 계층 구조

```plaintext
Throwable
 ├── Error
 │    └── VirtualMachineError
 │         ├── OutOfMemoryError
 │         ├── StackOverflowError
 │         └── ...
 └── Exception
      │   - Runtime Error -
      ├── RuntimeException
      │    ├── IndexOutOfBoundsException
      │    ├── NullPointerException
      │    ├── ClassCastException
      │    └── ...
      │
      │   - Compile Error -
      ├── ReflectiveOperationException
      │    ├── ClassNotFoundException
      │    ├── NoSuchMethodException
      │    └── ...
      ├── IOException
      │    └── FileNotFoundException
      └── ...
```

## 대표적인 Runtime 예외 클래스

---

### NullPointerException (NPE)

- null 참조에 접근 (메서드 호출, 필드 접근, 언박싱 등)

```java
String name = null;
int len = name.length();
```

### IndexOutOfBoundsException

- 배열, 리스트, 문자열 인덱스가 범위를 벗어날 때 발생

```java
List<Integer> list = List.of(1, 2);
list.get(2);
```

### IllegalArgumentException

- 메서드 인자가 유효 범위나 전재 조건을 위반할 때

```java
public void setAge(int age) {
    if (age < 0) throw new IllegalArgumentException("나이는 0보다 작을 수 없습니다.");
}
```

### IllegalStateException

- 객체나 시스템의 현재 상태가 호출을 수용할 수 없을 때

```java
public void start() {
    if (started) throw new IllegalStateException("이미 시작되었습니다.");
    started = true;
}
```

### NumberFormatException

- 문자열을 숫자로 파싱할 때 형식이 잘못된 경우

```java
Integer.parseInt("10a");
```

### ArithmeticException

- 잘못된 산술 연산

```java
int x = 10 / 0;
```

### ClassCastException

- 잘못된 타입 캐스팅 시 발생

```java
Object o = "hello";
Integer n = (Integer) o;
```

### UnsupportedOperationException

- 지원하지 않는 변경 연산을 수행할 때

```java
List<String> immut = List.of("a", "b");
immut.add("c"); // 불변 객체에 add 를 시도하여 발생
```

### NoSuchElementException

- 더 이상 요소가 없는데 꺼내려고 할 때
  - `Iterator.next()`
  - `Optional.get()`

### ConcurrentModificationException

- 컬렉션 순회 중 구조를 변경할 때

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
for (Integer i : list) {
    if (i == 2) list.remove(i);
}
```

### UncheckedIOException

- `IOException`을 언체크 예외로 래핑할 때 사용

```java
try {
    Files.readString(path);
} catch (IOException e) {
    throw new UncheckedIOException(e);
}
```

### DateTimeException

- `java.time` API 사용 중 잘못된 날짜/시간 값이나 포맷 오류

```java
LocalDate.of(2024, 2, 30);
```
