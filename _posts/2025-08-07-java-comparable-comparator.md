---
title: "[Java] 정렬(Comparable & Comparator)"
categories: [Java, Java/Basic]
tags: [Java, Comparable, Comparator, TIL]
date: '2025-08-07 19:01:00 +0900'
---

## Comparable & Comparator

---

- 둘 모두 인터페이스이다.
- `Comparable`
  - 자신과 다른 객체를 비교 (비교의 대상)
  - 숫자 클래스들, `boolean`, `String`, `Date`, `BigDecimal`, `BigInteger` 등
- `Comparator`
  - 주어진 두 객체를 비교 (비교의 주체)
  - 컬렉션에서는 **정렬의 기준**으로 사용
  - `Arrays`의 정렬 메서드, `TreeSet` 이나 `TreeMap` 등의 생성자에 활용

## 차이점

---

### Comparable

> 객체 내부에 기본 정렬 기준을 정의
{: .prompt-info}

`Comparable` 인터페이스는 해당 클래스 내부에서 기본 정렬 기준을 정의할 때 사용한다.   
이 방식은 클래스가 스스로 어떻게 정렬될지를 알고 있도록 만드는 구조이다.

**상품 객체를 가격 기준으로 정렬**
```java
public class Product implements Comparable<Product> {
    private String name;
    private int price;

    public Product(String name, int price) {
        this.name = name;
        this.price = price;
    }

    public String getName() { return name; }
    public int getPrice() { return price; }

    @Override
    public int compareTo(Product other) {
        return this.price - other.price; // 가격 기준 오름차순
    }

    @Override
    public String toString() {
        return name + ": " + price;
    }
}
```

```java
List<Product> list = Arrays.asList(
        new Product("노트북", 1200),
        new Product("마우스", 20),
        new Product("모니터", 300)
);

Collections.sort(list);
System.out.println(list);
```

**실행 결과**
```bash
마우스: 20
모니터: 300
노트북: 1200
```

- 하나의 클래스에 하나의 기본 정렬 기준만 정의할 수 있다.
- `Collections.sort(list)` 또는 `Arrays.sort(array)`처럼 간단하게 정렬 가능하다.

### Comparator

> 외부에서 정렬 기준을 유연하게 지정
{: .prompt-info}

`Comparator`는 클래스 외부에서 정렬 기준을 정의하는 방식이다.   
여러 정렬 방식이 필요하거나, 원본 클래스를 수정할 수 없는 경우에 적합하다.

**이름 기준으로 정렬하는 Comparator 구현**
```java
public class NameComparator implements Comparator<Product> {
    @Override
    public int compare(Product p1, Product p2) {
        return p1.getName().compareTo(p2.getName());
    }
}
```

```java
collections.sort(list, new NameComparator());
System.out.println(list);
```

**실행 결과**
```bash
노트북: 1200
마우스: 20
모니터: 300
```

**람다 표현식도 가능**
```java
list.sort((p1, p2) -> Integer.compare(p2.getPrice(), p1.getPrice())); // 가격 기준 내림차순
```

```java
list.sort((p1, p2) -> p1.getName().compareTo(p2.getName())); // 이름 기준 오름차순
```

## Tree 구조에서의 사용법

---

컬렉션 프레임워크에는 정렬된 트리 구조를 제공하는 `TreeSet`과 `TreeMap`이 있다.   
이들은 내부적으로 이진 탐색 트리(Red-Black Tree)를 사용하며, 저장되는 객체들이 정렬되어야 한다.   

이때 정렬 기준을 제공하는 방식으로 `Comparable` 또는 `Comparator` 인터페이스를 사용하게 된다.

> 트리에 둘 모두 적용시\
> `Comparator`가 없으면 `Comparable`의 기준을 따른다.
{: .prompt-warning}

### TreeSet에서 Comparable 사용

`TreeSet`은 삽입되는 객체가 `Comparable`을 구현하고 있어야 한다.   
그렇지 않으면 `ClassCastException`이 발생한다.

**가격 기준으로 정렬되는 상품 집합**
```java
public class Product implements Comparable<Product> {
    private String name;
    private int price;

    public Product(String name, int price) {
        this.name = name;
        this.price = price;
    }

    public String getName() { return name; }
    public int getPrice() { return price; }

    @Override
    public int compareTo(Product other) {
        return this.price - other.price;
    }

    @Override
    public String toString() {
        return name + ": " + price;
    }
}
```

```java
Set<Product> set = new TreeSet<>();
set.add(new Product("키보드", 30));
set.add(new Product("마우스", 20));
set.add(new Product("모니터", 200));

for (Product p : set) {
    System.out.println(p);
}
```

**출력 결과**
```bash
마우스: 20
키보드: 30
모니터: 200
```

### TreeSet에서 Comparator 사용

`TreeSet` 생성 시 Comparator를 전달하면, 객체가 `Comparable`을 구현하지 않아도 된다.   
또는 기본 정렬 기준 대신 다른 기준으로 정렬할 수 있다.

**이름 기준으로 정렬**
```java
// TreeSet 생성자에 Comparator를 전달
Set<Product> nameSortedSet = new TreeSet<>(Comparator.comparing(Product::getName));
nameSortedSet.add(new Product("키보드", 30));
nameSortedSet.add(new Product("마우스", 20));
nameSortedSet.add(new Product("모니터", 200));

for (Product p : nameSortedSet) {
    System.out.println(p);
}
```

**출력 결과**
```bash
마우스: 20
모니터: 200
키보드: 30
```

### TreeMap에서도 동일한 개념 적용

`TreeMap`은 키(Key)를 기준으로 정렬하며, 키 객체가 `Comparable`을 구현하거나 `Comparator`를 사용해야 한다.

**사용자 이름을 키로, 포인트를 값으로 저장**
```java
Map<String, Integer> map = new TreeMap<>();
map.put("홍길동", 1000);
map.put("이몽룡", 800);
map.put("성춘향", 900);

for (String key : map.keySet()) {
    System.out.println(key + " → " + map.get(key));
}
```

**출력 결과 (이름 오름차순)**
```bash
성춘향 → 900
이몽룡 → 800
홍길동 → 1000
```
