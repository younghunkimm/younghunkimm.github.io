---
title: "[Java] 스트림(Stream)"
categories: [Java, Java/Basic]
tags: [Java, Stream, TIL]
date: '2025-08-21 20:26:00 +0900'
---

## 스트림이란?

---

스트림(Stream)은 Java8에서 도입되었으며, **컬렉션(Collection)**, **배열(Array)**, **I/O 자원** 등에 저장된 요소들을 함수형 스타일로 처리할 수 있게 해주는 API이다.   

반복문을 대체할 수 있는 강력한 도구로, **간결한 코드, 가독성 향상, 병렬 처리 지원**이라는 장점을 가진다.   
하지만 **재사용 불가, 디버깅 어려움, 작은 데이터셋에서의 성능 문제** 같은 단점도 존재하므로, 상황에 맞게 적절히 활용하는 것이 중요하다.

## 스트림의 특징

---

1. 데이터 원본 변경 없음
   - 원본 데이터를 수정하지 않고 새로운 결과를 생성한다.
2. 일회성
   - 스트림은 한 번 소비하면 재사용할 수 없다. 필요하다면 다시 생성해야한다.
3. 내부 반복(Internal Iteration)
   - 반복문(`for`, `while`) 대신 내부적으로 반복을 수행한다.
4. 지연 연산(Lazy Evaluation)
   - 중간 연산은 즉시 실행되지 않고, 최종 연산이 호출될 때 한 번에 처리된다.
5. 병렬 처리(Parallel Processing)
   - `.parallel()`을 사용하면 멀티코어를 활용한 병렬 연산이 가능하다.

## 스트림의 연산

---

스트림 연산은 크게 **중간 연산(`Intermediate`)**과 **최종 연산(`Terminal`)**으로 나뉜다.

### 중간 연산

- `filter`: 조건에 맞는 요소만 추출
- `map`: 요소를 변환
- `sorted`: 정렬
- `distinct`: 중복 제거
- `limit`/`skip`: 요소 제한, 건너뛰기
- `peek`: 디버깅용 중간 확인

### 최종 연산

- `forEach`: 요소를 순회하며 처리
- `collect`: 결과를 컬렉션이나 문자열 등으로 수집
- `toList`: 리스트를 반환하지만 불변하기 때문에 수정이 불가능
- `reduce`: 누적 연산
- `count`, `max`, `min`: 집계 연산
- `anyMatch`, `allMatch`, `noneMatch`: 조건 검사 (`boolean` 반환)
- `findFirst`, `findAny`: 요소 검색

## 스트림 생성

---

### 배열로 생성

```java
Integer[] integerArray = { 1, 2, 3, 4, 5 };
Stream<Integer> integerStream = Arrays.stream(integerArray);
Object[] integerStreamToArray = integerStream.toArray();
```

### 원시값 배열로 생성

- 원시값 배열은 스트림의 클래스가 바뀜

```java
int[] intArray = { 1, 2, 3, 4, 5 };
IntStream intStream = Arrays.stream(intArray);
int[] intStreamToArray = intStream.toArray();

double[] dblArray = { 1.1, 2.2, 3.3 };
DoubleStream dblStream = Arrays.stream(dblArray);
double[] dblStreamToArray = dblStream.toArray();
```

### 직접 생성

```java
IntStream withInts = IntStream.of(1, 2, 3, 4, 5);
Stream<Integer> withIntegers = Stream.of(1, 2, 3, 4, 5);
```

### 컬렉션으로 생성

```java
Integer[] integerArray = { 1, 2, 3, 4, 5 };
List<Integer> integerList = new ArrayList<>(Arrays.asList(integerArray));
Stream integerListStream = integerList.stream();
```

### Map으로 생성

- 맵의 경우 Entry의 스트림으로 생성

```java
Map<String, Character> score = new HashMap<>();
score.put("English", 'B');
score.put("Math", 'C');
score.put("Programming", 'A');

Stream<Map.Entry<String, Character>> scoreEntryStream = score.entrySet().stream();
```

### 빌더로 생성

```java
Stream.Builder<Character> builder = Stream.builder();
builder.accept('스');
builder.accept('트');
builder.accept('림');
builder.accept('빌');
builder.accept('더');

Stream<Character> withBuilder = builder.build();
```

### concat 메서드로 생성

```java
Stream<Integer> stream1 = Stream.of(11, 22, 33);
Stream<Integer> stream2 = Stream.of(44, 55, 66);
Stream<Integer> streamConcat = Stream.concat(stream1, stream2);
```

### 이터레이터로 생성

- 인자: 초기값, 다음 값을 구하는 람다 함수
- `limit`으로 횟수를 지정해야 함

```java
Stream<Integer> withIter1 = Stream
            .iterate(0, i -> i + 2)
            .limit(10);
Object[] withIter1_Arr = withIter1.toArray();

Stream<String> withIter2 = Stream
            .iterate("홀", s -> s + (s.endsWith("홀") ? "짝" : "홀"))
            .limit(8);
Object[] withIter2_Arr = withIter2.toArray();
```

### 원시자료형 스트림의 기능들로 생성

```java
IntStream fromRange1 = IntStream.range(10, 20); // 20 미포함
IntStream fromRange2 = IntStream.rangeClosed(10, 20); // 20 포함

Stream<Integer> fromRangeBox = fromRange1.boxed();
```

### Random 클래스의 스트림 생성 메서드

- `new Random().ints(streamSize, randomNumberOrigin, randomNumberBound)`

```java
IntStream randomInts = new Random().ints(5, 0, 100);
int[] randomInts_Arr = randomInts.toArray();

DoubleStream randomDbls = new Random().doubles(5, 2, 3);
double[] randomDbls_Arr = randomDbls.toArray();
```

### 문자열을 각 문자에 해당하는 정수의 스트림으로

```java
IntStream fromString = "Hello World".chars();
int[] fromString_Arr = fromString.toArray();
```

## 예제

---

### 기본 예제

```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Kim", "Park", "Lee", "Kim");

        // 중복 제거, 정렬, 필터링, 변환, 수집
        List<String> result = names.stream()
                .distinct()
                .filter(name -> name.startsWith("K"))
                .sorted()
                .map(String::toUpperCase)
                .collect(Collectors.toList());

        System.out.println(result); // [KIM]
    }
}
```

### 숫자 합계 구하기

```java
int sum = Arrays.asList(1, 2, 3, 4, 5).stream()
                .reduce(0, Integer::sum);
```

### 평균 점수 구하기

```java
List<Integer> scores = Arrays.asList(90, 80, 70, 100);
double avg = scores.stream() // Stream<Integer>
                   .mapToInt(Integer::intValue) // IntStream
                   .average() // OptionalDouble
                   .orElse(0.0);
```

### 특정 조건의 데이터 추출

```java
List<String> emails = users.stream()
                           .filter(user -> user.isActive())
                           .map(User::getEmail())
                           .toList();
```

### 병렬 스트림

- 큰 데이터셋에서 성능 향상이 가능하지만, 오히려 작은 데이터에서는 오버헤드로 인해 성능저하가 있을 수 있음
- 동기화가 필요한 경우 주의가 필요함 (Thread-safe ❌)

```java
int sum = Arrays.stream(new int[] {1,2,3,4,5,6,7,8,9,10})
                .parallel()
                .sum();
```

---

#### Reference

- 제대로 파는 자바 by 얄코
