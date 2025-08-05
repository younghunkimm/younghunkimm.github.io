---
title: "[Java] 제네릭(Generic): 타입 안정성과 재사용성"
categories: [Java, Java/Basic]
tags: [Java, 제네릭, Generic, 공변성, 반공변성, 불공변성, 와일드카드, TIL]
date: '2025-08-05 19:11:00 +0900'
---

## 제네릭은 왜 필요한가?

---

자바에서 컬렉션이나 API를 설계하다 보면 타입과 관련된 다양한 문제를 마주하게 된다.   
그중에서도 **컴파일 타임에 타입 안정성을 확보하고, 중복 없이 유연한 코드를 작성**하기 위해 도입된 기능이 바로 **제네릭(Generic)**이다.

제네릭을 활용하면 형 변환에 의한 오류를 방지할 수 있으며,   
다양한 타입에 대해 공통된 로직을 처리할 수 있는 재사용 가능한 코드를 작성할 수 있다.

## 제네릭이란?

---

제네릭(Generic)이란 클래스나 메서드에서 사용할 데이터 타입을 코드 작성 시점이 아닌 **인스턴스 생성 시점에 지정할 수 있도록 하는 기능**을 의미한다.

```java
List<String> list = new ArrayList<>();
```

위 코드에서 `List<String>`은 해당 리스트가 문자열(String)만을 담을 수 있음을 의미한다.   
컴파일 시점에 타입 검사가 이루어지므로 **런타임 오류를 줄이고, 형 변환을 줄일 수 있는 장점**이 있다.

## 제네릭의 기본 문법

---

### 제네릭 클래스

#### 기초 예제

```java
public class Box<T> {
    private T value;

    public void setValue(T value) {
        this.value = value;
    }

    public T getValue() {
        return value;
    }
}
```

여기서 `T` 는 타입 파라미터(Type Parameter)로, 실제 사용할 타입은 인스턴스를 생성할 때 지정하게 된다.

```java
// <>: 다이아몬드 연산자
// 타입 파라미터로 타입추론이 가능하여 new에서는 생략
Box<Integer> integerBox = new Box<>();
Box<Double> doubleBox = new Box<>();

Integer number = Integer.valueOf(10);

integerBox.setValue(number);
Integer integerBoxValue = integerBox.getValue();

// ⚠️ 컴파일 에러
// doubleBox.setValue(number);
// Double doubleBoxValue = doubleBox.getValue();
```

#### extends 사용

```java
public class Animal {}

public class Dog extends Animal {}

public class Cage<T extends Animal> {
    private T animal;

    public void setAnimal(T animal) {
        this.animal = animal;
    }

    public T getAnimal() {
        return animal;
    }
}
```

- `Cage<T>`는 `T`가 반드시 `Animal`의 하위 클래스여야 함을 보장한다.
- `Cage<Dog>`은 가능하지만, `Cage<String>`은 안된다.

### 제네릭 메서드

#### 기초 예제

```java
public class DebugUtil {
    // 반환 타입(void) 앞에 지정
    public <T> void printArray(T[] array) {
        for (T item : array) {
            System.out.println(item);
        }
    }
}
```

```java
String[] names = { "홍길동", "임꺽정", "장길산" };
DebugUtil.printArray(names);
```

- 다양한 타입의 배열을 받아 출력한다.
- `T`는 호출 시점에 자동으로 유추된다.

#### 두 값 중 큰 값을 반환하는 메서드

```java
public class MathUtil {
    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }
}
```

```java
public class Person implements Comparable<Person> {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 나이를 기준으로 비교
    @Override
    public int compareTo(Person other) {
        return Integer.compare(this.age, other.age);
    }

    @Override
    public String toString() {
        return name + " (" + age + ")";
    }
}
```

```java
Integer score1 = 87;
Integer score2 = 92;
System.out.println("더 높은 점수: " + MathUtil.max(score1, score2));

LocalDate d1 = LocalDate.of(2023, 1, 1);
LocalDate d2 = LocalDate.of(2024, 5, 20);
System.out.println("더 최근 날짜: " + MathUtil.max(d1, d2));

Person p1 = new Person("홍길동", 30);
Person p2 = new Person("이몽룡", 25);
System.out.println("더 나이 많은 사람: " + MathUtil.max(p1, p2));
```

- `T`는 `Comparable`을 구현한 타입이어야 한다.

#### 타입에 관계없는 Key-Value 출력

```java
public class Logger {
    public static <K, V> void printKeyValue(K key, V value) {
        System.out.println("[" + key + "] -> " + value);
    }
}
```

```java
Logger.printKeyValue("userId", 1234);
Logger.printKeyValue("status", true);
Logger.printKeyValue("name", "홍길동");
```

제네릭 메서드는 다양한 타입에 대해 동일한 로직을 적용할 수 있도록 도와준다.

## 제네릭과 불공변성(Invariance)

---

자바의 제네릭은 **기본적으로 불공변적(invariant)**이다.   
이는 `List<Number>`와 `List<Integer>`가 서로 아무 관련이 없다는 의미이다.

```java
List<Number> numbers = new ArrayList<Integer>(); // ⚠️ 컴파일 오류
```

위 코드처럼 `Integer`가 `Number`의 하위 타입이라도, `List<Number`는 `List<Integer>`를 담을 수 없다.   
이러한 특성은 **타입 안정성**을 보장하기 위한 제네릭의 핵심적인 설계 원칙이다.

## 와일드카드(`?`)와 공변성/반공변성

---

불공변성의 한계를 보완하기 위해 자바는 **와일드카드(`?`)**를 제공한다.   
와일드카드는 **공변성(covariance)**과 **반공변성(contravariance)**을 표현할 수 있도록 도와준다.

### 공변성 (`<? extends T>`)

```java
public void printNumbers(List<? extends Number> list) {
    Number number = list.get(0); // 가능

    // ⚠️ Number 포함한 하위타입(Number, Double, Integer)
    //    List<Integer>인 경우 Double형을 넣을 수 없기 때문에 쓰기가 제한된다.
    // list.add(1.23); // 불가능
}
```

- `? extends T`는 `T` 또는 `T`의 하위 타입을 허용한다.
- 읽기(read)는 가능하지만, 쓰기(write)는 제한된다.
- 주로 **읽기 전용** 파라미터에 사용된다.

### 반공변성 (`<? super T>`)

```java
public void addNumbers(List<? super Integer> list) {
    list.add(10); // 가능

    // ⚠️ Integer 포함한 상위타입(Integer, Number, Object)
    //    어떤 데이터 타입이 반환될지 예측할 수 없기 때문에 읽기가 제한된다.
    // Integer number = list.get(0); // 불가능
    Object number = list.get(0); // 가능
}
```

- `? super T`는 `T` 또는 `T`의 상위 타입을 허용한다.
- 쓰기는 가능하지만, 읽을 때는 `Object`로 처리해야 한다.
- 주로 **쓰기 전용** 파라미터에 사용된다.

## PECS 원칙

---

와일드카드의 사용을 보다 쉽게 이해하기 위해 **PECS (Producer Extends, Consumer Super)** 원칙이 자주 사용된다.

- 데이터를 **제공(produce)**할 때는 `extends`
- 데이터를 **소비(consume)**할 때는 `super`

## 제네릭 사용 시 주의할 점

---

- 타입 소거(Type Erasure)
  : 제네릭 타입은 컴파일 후에 타입 정보가 제거되므로, 런타임에는 실제 타입을 알 수 없다.
- 기본 타입 사용 불가
  : 기본 타입(`int`, `double` 등)은 직접 사용할 수 없고, `Integer`, `Double` 등의 래퍼 클래스를 사용해야 한다.
- static에서의 제약
  : static 변수나 메서드는 클래스 로딩 시점에 메모리에 올라가기 때문에 **클래스에 선언된 제네릭 타입 파라미터**를 적용할 수 없다.
