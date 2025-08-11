---
title: "[Java] 람다(Lambda), 함수형 인터페이스"
categories: [Java, Java/Basic]
tags: [Java, 람다, Lambda, 함수형 인터페이스, Functional Interface, TIL]
date: '2025-08-11 09:08:00 +0900'
---

## 람다표현식이란?

---

Java 8부터 도입된 람다 표현식(Lambda Expression)은 자바에서도 함수형 프로그래밍 스타일을 가능하게 해준다.   
람다는 익명 함수의 일종으로, 코드의 간결함과 가독성을 크게 향상시킨다.

## 함수형 인터페이스란?

---

하지만 이 람다의 진짜 핵심은 **함수형 인터페이스**에 있다.   
함수형 인터페이스는 **오직 하나의 추상 메서드만 가지는 인터페이스**이다.   
이 인터페이스를 구현할 때 람다표현식을 사용할 수 있다.   

자바에서는 `@FunctionalInterface` 어노테이션을 붙여 컴파일 타임에 함수형 인터페이스임을 명시할 수 있다.

```java
@FunctionalInterface
interface MyFunction {
    void run();
}
```

## 기본 제공 함수형 인터페이스 정리

---

Java8의 `java.util.function` 패키지에는 다양한 상황에 사용할 수 있는 표준 함수형 인터페이스들이 제공된다.

| 인터페이스명          | 추상 메서드    | 시그니처                 | 설명                      |
| :-------------------- | :------------- | :----------------------- | :------------------------ |
| `Supplier<T>`         | `get()`        | `T get()`                | 매개변수 없이 T 반환      |
| `Consumer<T>`         | `accept(T)`    | `void accept(T t)`       | T를 받아 소비             |
| `BiConsumer<T, U>`    | `accept(T, U)` | `void accept(T t, U u)`  | 두 값을 받아 소비         |
| `Function<T, R>`      | `applyu(T)`    | `R apply(T t)`           | T를 받아 R 반환           |
| `BiFunction<T, U, R>` | `apply(T, U)`  | `R apply(T t, U u)`      | 두 값을 받아 R 반환       |
| `UnaryOperator<T>`    | `apply(T)`     | `T apply(T t)`           | T를 받아 T 반환           |
| `BinaryOperator<T>`   | `apply(T, T)`  | `T apply(T t1, T t2)`    | T 2개를 받아 T 반환       |
| `Predicate<T>`        | `test(T)`      | `boolean test(T t)`      | T를 받아 boolean 반환     |
| `BiPredicate<T, U>`   | `test(T, U)`   | `boolean test(T t, U u)` | 두 값을 받아 boolean 반환 |

## 함수형 인터페이스 사용 예제

---

1. `Supplier<T>`
   - 입력❌, 출력⭕
   - 사용 예: 객체 제공
     ```java
     Supplier<String> supplier = () -> "Hello";
     System.out.println(supplier.get()); // Hello
     ```

2. `Consumer<T>`
   - 입력⭕, 출력❌
   - 사용 예: 입력값을 소비
     ```java
     Consumer<String> consumer = s -> System.out.println(s);
     consumer.accept("Hello Consumer"); // Hello Consumer
     ```

3. `Function<T, R>`
   - 입력⭕, 출력⭕
   - 사용 예: T를 R로 매핑
     ```java
     Function<Integer, String> func = i -> "숫자: " + i;
     System.out.println(func.apply(10)); // 숫자: 10
     ```

4. `Predicate<T>`
   - 입력⭕, `boolean` 반환
   - 사용 예: 조건 판단
     ```java
     Predicate<Integer> isPositive = i -> i > 0;
     System.out.println(isPositive.test(5)); // true
     ```

5. `UnaryOperator<T>`
   - 입력과 출력이 같은 타입 (`Function<T, R>`의 하위)
   - 사용 예: 값 변환
     ```java
     UnaryOperator<Integer> square = i -> i * i;
     System.out.println(square.apply(4)); // 16
     ```

6. `BinaryOperator<T>`
   - 같은 타입 2개 입력, 같은 타입 출력 (`BiFunction<T, T, T>`의 하위)
     ```java
     BinaryOperator<Integer> add = (a, b) -> a + b;
     System.out.println(add.apply(3, 4)); // 7
     ```

**그 외 BiFunction, BiConsumer, BiPredicate 등**

- `BiFunction<T, U, R>`: 2개 입력 -> 결과 반환
- `BiConsumer<T, U>`: 2개 입력 -> 소비만
- `BiPredicate<T, U>`: 2개 입력 -> `boolean` 반환

## 람다 표현식과 함수형 인터페이스의 매칭 방식

---

### 1️⃣ 타입 추론의 기본

람다 표현식은 컨텍스트 기반 타입 추론을 통해 어떤 함수형 인터페이스에 할당될지 결정된다.

```java
Consumer<String> printer = s -> System.out.println(s);
```

- `s -> System.out.println(s)`는 `Consumer<T>`의 `accept(T t)` 메서드에 맞춰서 작성된 람다이다.
- 컴파일러는 좌변의 타입인 `Consumer<String>`을 보고, `T`가 `String`임을 추론한다.

### 2️⃣ 메서드 시그니처 매칭

람다는 **인터페이스의 추상 메서드 시그니처**와 일치하는 형태여야 한다.   

예를 들어 다음과 같은 함수형 인터페이스가 있다고 했을 때
```java
@FunctionalInterface
interface StringChecker {
    boolean check(String input);
}
```

그러면 다음 람다는 이 인터페이스에 할당 가능하다.
```java
StringChecker sc = s -> s.isEmpty();
```

- 람다의 입력 `s`, 반환 타입 `boolean`은 `boolean check(String input)`과 정확히 일치

### 3️⃣ 메서드 참조도 같은 방식

```java
Predicate<String> isEmpty = String::isEmpty;
```

- `String::isEmpty`는 `boolean isEmpty()` 메서드를 참조
- `Predicate<T>`의 `test(T t)` 메서드에 매핑됨

## Stream filter에서의 실전 예제

---

```java
List<String> names = Arrays.asList("Kim", "Lee", "Park");

List<String> result = names.stream()
        .filter(name -> name.startsWith("K")) // Predicate<String>
        .collect(Collectors.toList());

System.out.println(result); // [Kim]
```

- `filter()`는 `Predicate<T>`를 인자로 받음
- `name -> name.startsWith("K")`는 `boolean test(String name)`에 정확히 대응됨
