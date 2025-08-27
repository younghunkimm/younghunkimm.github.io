---
title: "[Java] 옵셔널(Optional)과 NPE"
categories: [Java, Java/Basic]
tags: [Java, Optional, TIL]
date: '2025-08-27 21:40:00 +0900'
---

## NPE이란?

---

`NullPointerException`의 약자로, `null`인 것으로부터 필드나 메서드 등을 호출하려 할 때 발생하는 `RuntimeException`이다.

- 에러 메세지로 어디서 `null`이 발생했는지 파악하기가 어렵다.
- 서비스 운영 중 장애로 이어질 수 있다.
- `null` 체크를 위한 코드로 인해 가독성이 떨어진다.

## Optional이란?

---

Java8에서 `Optional<T>` 클래스를 사용해 NPE를 방지할 수 있도록 도와준다.   
`null`을 직접 다루지 않고, **값이 있을수도 있고 없을 수도 있음**을 명시적으로 표현하기 위한 Wrapper 클래스이다.   

`Optional<T>`는 `T` 타입의 객체를 감쌀 수 있고, 값이 없으면 `Optional.empty()`를 가진다.

## Optional 생성 메서드

---

### of

- 담으려는 것이 확실히 있을 때

```java
// 💡 Optional 생성
Optional<String> catOpt = Optional.of("Cat");

// ⚠️ of로 null을 담으면 NPE
catOpt = Optional.of(null);
```

### ofNullable

- 담으려는 것이 null일 수도 있을 때

```java
Optional<String> dogOpt = Optional.ofNullable("Dog");
Optional<String> cowOpt = Optional.ofNullable(null);
```

### empty

- 명시적으로 null을 담고 싶을 때

```java
Optional<String> henOpt = Optional.empty();
```

## Optional 값 확인 메서드

---

### isPresent

- 값이 존재하면 true, 없으면 false 반환

```java
Optional<String> catOpt = Optional.of("Cat");
System.out.println(catOpt.isPresent()); // true

Optional<String> emptyOpt = Optional.empty();
System.out.println(emptyOpt.isPresent()); // false
```

### isEmpty (Java 11+)

- 값이 없으면 true, 있으면 false 반환
- `!isPresent()`와 동일

### ifPresent

- 값이 있으면 전달한 `Consumer` 실행, 없으면 실행 안함

```java
Optional<String> dogOpt = Optional.of("Dog");

dogOpt.ifPresent(v -> System.out.println("동물이름: " + v));

Optional<String> emptyOpt = Optional.empty();
emptyOpt.ifPresent(v -> System.out.println("실행 안 됨"));
```

### ifPresentOrElse

- 값이 있으면 전달한 `Consumer` 실행, 없으면 전달한 `Runner` 실행

```java
Optional<String> emptyOpt = Optional.empty();

emptyOpt.ifPresentOrElse(
        v -> System.out.println("동물이름: " + v),
        () -> System.out.println("동물 없음")
);
```

## Optional 기본값 처리 메서드

---

### orElse

- 값이 있으면 반환, 없으면 기본값 반환

```java
Optional<String> catOpt = Optional.ofNullable("Cat");
System.out.println(catOpt.orElse("Default")); // Cat

Optional<String> emptyOpt = Optional.empty();
System.out.println(emptyOpt.orElse("Default")); // Default
```

### orElseGet

- 값이 있으면 반환, 없으면 `Supplier`를 실행하여 생성된 값 반환
- `orElse`와의 차이
  - `orElse`: Optional에 값이 있든 없든 기본값 계산식은 무조건 실행됨
  - `orElseGet`: Optional에 값이 없을 때만 람다식 실행됨 (Lazy Evaluation)

**예제1. 차이 없는 경우**

```java
Optional<String> opt = Optional.of("Cat");

// 둘 다 "Cat" 출력
System.out.println(opt.orElse(getDefault()));
System.out.println(opt.orElseGet(() -> getDefault()));
```

**예제2. 차이 있는 경우**

```java
private static String getDefault() {
    System.out.println("기본값 생성 실행!");
    return "Default";
}

public static void main(String[] args) {
    Optional<String> opt1 = Optional.of("Dog");
    Optional<String> opt2 = Optional.empty();

    // orElse → 값이 있어도 getDefault() 실행
    System.out.println(opt1.orElse(getDefault())); 
    // 출력:
    // 기본값 생성 실행!   ← 불필요 실행
    // Dog

    // orElseGet → 값이 있으면 getDefault() 실행 안 함
    System.out.println(opt1.orElseGet(() -> getDefault())); 
    // 출력:
    // Dog

    // 값이 없을 때는 둘 다 실행됨
    System.out.println(opt2.orElse(getDefault()));  
    System.out.println(opt2.orElseGet(() -> getDefault()));
}
```

### orElseThrow

- 값이 있으면 반환, 없으면 **예외 발생**

```java
Optional<String> cowOpt = Optional.of("Cow");
System.out.println(cowOpt.orElseThrow()); // Cow

Optional<String> emptyOpt = Optional.empty();
// 예외 발생: NoSuchElementException
System.out.println(emptyOpt.orElseThrow());
```

**예외 타입 지정 가능**

```java
Optional<String> henOpt = Optional.empty();
System.out.println(henOpt.orElseThrow(
        () -> new IllegalArgumentException("값이 없습니다!")
));
// ❌ IllegalArgumentException 발생
```

## Optional 값 변환 메서드

---

### map

- 값이 있으면 **함수를 적용해 변환**
- 값이 없으면 아무 일도 하지 않고 `Optional.empty()` 반환

```java
Optional<String> catOpt = Optional.of("Cat");

// 문자열 길이로 변환
Optional<Integer> lengthOpt = catOpt.map(String::length);
System.out.println(lengthOpt.get()); // 3

Optional<String> emptyOpt = Optional.empty();
System.out.println(emptyOpt.map(String::length)); // Optional.empty
```

### flatMap

- `map`과 비슷하지만, 함수 결과가 **Optional**일 때 사용
- `Optional<Optional<T>>` 중첩을 평탄화(flatten)

```java
Optional<String> dogOpt = Optional.of("Dog");

// map 사용 시 → Optional<Optional<Integer>>
Optional<Optional<Integer>> wrong = dogOpt.map(v -> Optional.of(v.length()));

// flatMap 사용 시 → Optional<Integer>
Optional<Integer> right = dogOpt.flatMap(v -> Optional.of(v.length()));

System.out.println(right.get()); // 3
```

### filter

- 값이 있으면 **조건 검사**
- 조건이 참이면 그대로 유지, 거짓이면 `Optional.empty()` 반환

```java
Optional<String> cowOpt = Optional.of("Cow");

// 문자열 길이가 3인지 확인
Optional<String> filtered = cowOpt.filter(v -> v.length() == 3);
System.out.println(filtered.isPresent()); // true

Optional<String> filtered2 = cowOpt.filter(v -> v.startsWith("Z"));
System.out.println(filtered2.isPresent()); // false
```

### 체이닝 예제

```java
Optional<String> catOpt = Optional.of("Cat");

// 문자열 길이가 3 이상이면 길이를 반환, 아니면 0
int length = catOpt
        .filter(v -> v.length() >= 3)  // "Cat"은 길이가 3 → 통과
        .map(String::length)           // 3
        .orElse(0);                    // 값 없으면 0

System.out.println(length); // 3
```

#### 객체 탐색 (NPE 방지)

**중간에 `user`나 `address`가 `null` 이더라도 NPE 없이 안전하게 처리됨**

```java
// 유저 → 주소 → 도시 이름 찾기
Optional<User> userOpt = userRepository.findById(1L);

String city = userOpt
        .map(User::getAddress)        // Optional<Address>
        .map(Address::getCity)        // Optional<String>
        .orElse("도시 정보 없음");     // 값이 없으면 기본값

System.out.println(city);
```

#### flatMap 활용

```java
// User 내부 메서드가 Optional 반환하는 경우
public Optional<Address> getAddress() { ... }

Optional<User> userOpt = userRepository.findById(1L);

String city = userOpt
        .flatMap(User::getAddress)    // 이미 Optional 반환하므로 flatMap
        .map(Address::getCity)
        .orElse("도시 정보 없음");

System.out.println(city);
```

## Stream에서 Optional 반환 메서드

---

### findFirst

- 스트림에서 첫 번째 요소를 Optional로 반환
- 요소가 없으면 `Optional.empty()`

```java
List<String> list = List.of("Cat", "Dog", "Cow");

Optional<String> first = list.stream()
        .findFirst();

System.out.println(first.orElse("없음")); // Cat
```

### findAny

- 스트림에서 아무 요소나 Optional로 반환
- 병렬 스트림(parallelStream)에서 주로 사용

```java
List<String> list = List.of("Cat", "Dog", "Cow");

Optional<String> any = list.stream()
        .findAny();

System.out.println(any.orElse("없음")); // Cat (보통 첫 번째, 하지만 병렬일 때는 달라질 수 있음)
```

### max(Comparator), min(Comparator)

- 스트림에서 **최댓값과 최솟값**을 Optional로 반환

```java
List<Integer> numbers = List.of(1, 5, 3);

// 최댓값
Optional<Integer> max = numbers.stream()
        .max(Integer::compareTo);

System.out.println(max.orElse(-1)); // 5

// 최솟값
Optional<Integer> min = numbers.stream()
        .min(Integer::compareTo);

System.out.println(min.orElse(-1)); // 1
```

### reduce

- 스트림 요소를 하나로 합침
- 초기값을 주지 않으면 Optional로 결과를 감쌈 (값이 없을수도 있기 때문)

```java
List<Integer> numbers = List.of(1, 2, 3);

// 초기값 없는 reduce → Optional 반환
Optional<Integer> sumOpt = numbers.stream()
        .reduce((a, b) -> a + b);

System.out.println(sumOpt.orElse(0)); // 6
```
