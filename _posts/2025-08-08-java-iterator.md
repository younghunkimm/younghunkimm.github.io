---
title: "[Java] 반복자(Iterator)"
categories: [Java, Java/Basic]
tags: [Java, Iterator, TIL]
date: '2025-08-08 20:42:00 +0900'
---

## Iterator란?

---

`Iterator`는 Java 컬렉션을 순차적으로 접근할 수 있게 해주는 객체이다.   
다음 요소가 있는지 확인하는 `hasNext()`와 다음 요소를 꺼내오는 `next()` 메서드를 통해 리스트, 셋, 큐 등 다양한 컬렉션을 일관된 방식으로 순회할 수 있다.

```java
List<String> list = List.of("a", "b", "c");
Iterator<String> iterator = list.iterator();

while (iterator.hasNext()) {
    String item = iterator.next();
    System.out.println(item);
}
```

## 왜 Iterator를 써야 할까?

---

1. 요소 삭제가 안전하다.

    일반적인 for-each 문에서는 순회 중 요소를 삭제하면 `ConcurrentModificationException`이 발생할 수 있다.   
    반면 `Iterator`의 `remove()` 메서드를 사용하면 안전하게 요소를 삭제할 수 있다.

    ```java
    List<String> items = new ArrayList<>();
    items.add("apple");
    items.add("test-1");
    items.add("banana");
    items.add("test-2");

    Iterator<String> iterator = list.iterator();
    while (iterator.hasNext()) {
        String item = iterator.next();
        if (item.contains("test")) {
            iterator.remove(); // 안전하게 삭제
        }
    }
    ```

2. 다양한 컬렉션에서 일관된 순회 방식 제공

    `Set`, `Queue`, `Map` 등 각각 내부 구조가 달라도 `Iterator`를 통해 동일한 방식으로 순회할 수 있다.

    ```java
    Set<Integer> set = Set.of(1, 2, 3);
    Iterator<Integer> it = set.iterator();
    while (it.hasNext()) {
        System.out.println(it.next());
    }
    ```

    특히 `Map`은 `entrySet()`, `keySet()`, `values()` 등을 통해 `Iterator` 와 함께 사용할 수 있다.

    ```java
    Iterator<Map.Entry<String, Integer>> iterator = map.entrySet().iterator();
    while (iterator.hasNext()) {
        Map.Entry<String, Integer> entry = iterator.next();
        System.out.println(entry.getKey() + ": " + entry.getValue());
    }
    ```

## 왜 for-each 문에서는 삭제가 불가능할까?

---

자바 컬렉션의 대부분은 **fail-fast** 구조이다.   
이는 컬렉션을 순회하는 도중 구조가 변경되면 즉시 예외를 발생시켜   
버그를 사전에 차단하는 매커니즘이다.   

`for-each`는 내부적으로 `Iterator`를 생성하지만   
우리는 그 `Iterator` 객체에 접근할 수 없다.   
그래서 `Iterator.remove()` 와 같은 안전한 삭제 메서드를 호출할 수 없다.   

대신 `list.remove()`처럼 컬렉션 자체를 수정하면,   
`Iterator`와 컬렉션 사이의 상태가 어긋나게 되고, 그 순간 예외가 발생한다.

## Iterable과 Iterator의 관계

---

`Iterable`은 `iterator()` 메서드를 정의한 인터페이스이다.   
`Iterable`을 구현하면 `for-each` 문에서 사용할 수 있다.

```java
class MyNumbers implements Iterable<Integer> {
    private int[] values = {1, 2, 3};

    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            int index = 0;
            public boolean hasNext() {
                return index < values.length;
            }
            public Integer next() {
                return values[index++];
            }
        };
    }
}

```

```java
MyNumbers nums = new MyNumbers();
for (int i : nums) {
    System.out.println(i);
}
```
