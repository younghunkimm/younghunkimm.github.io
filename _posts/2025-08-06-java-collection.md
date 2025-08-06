---
title: "[Java] 컬렉션(Collection)"
categories: [Java, Java/Basic]
tags: [Java, 컬렉션, Collection, List, Set, Map, TIL]
date: '2025-08-06 20:39:00 +0900'
---

## 컬렉션이란?

---

데이터를 효율적으로 저장하고 관리할 수 있도록 제공하는 자료구조 프레임워크이다.   
컬렉션은 배열보다 더 유연하고, 다양한 기능을 제공한다.

## 컬렉션의 핵심 구성요소

---

### List (순서가 중요한 데이터)

- **특징**: 저장 순서가 유지되며, 중복된 요소 저장이 가능하다.
- **주요 구현 클래스**
  - `ArrayList`: 배열 기반, 검색 속도가 빠름
  - `LinkedList`: 노드 기반, 삽입/삭제에 유리
  - `Vector`: 동기화 지원, 현재는 많이 사용되지 않음
- **사용 예시**
  ```java
  List<String> names = new ArrayList<>();
  names.add("철수");
  names.add("영희");
  names.add("철수"); // 중복 허용
  ```

### Set (중복 없는 고유 데이터)

- **특징**: 중복을 허용하지 않으며, 저장 순서는 보장되지 않음 (단, 구현체에 따라 다름)
- **주요 구현 클래스**
  - `HashSet`: 가장 일반적인 Set, 순서 없음
  - `LinkedHashSet`: 입력 순서 유지
  - `TreeSet`: 정렬된 상태로 저장 (Comparable 또는 Comparator 필요)
- **사용 예시**
  ```java
  Set<Integer> lotto = new HashSet<>();
  lotto.add(3);
  lotto.add(7);
  lotto.add(3); // 중복 무시
  ```

### Map (키와 값의 쌍으로 저장)

- **특징**: 키를 기준으로 값을 저장하며, 키는 중복 불가
- **주요 구현 클래스**
  - `HashMap`: 가장 일반적인 Map
  - `LinkedHashMap`: 입력 순서 유지
  - `TreeMap`: 키를 기준으로 정렬
- **사용 예시**
  ```java
  Map<String, Integer> scoreMap = new HashMap<>();
  scoreMap.put("철수", 90);
  scoreMap.put("영희", 85);
  ```

## 핵심 메서드

---

### List

```java
List<String> list = new ArrayList<>();

// 요소 추가
list.add("apple"); // add(E e)
list.add(1, "banana"); // add(index, E e)
list.add(0, "peach"); // 0번째 index에 넣고 하나씩 밀림
// list.add(4, "orange"); // ⚠️ 오류(3번째 index가 비어있기 때문)
// -> { "peach", "apple", "banana" }

// 요소 조회 및 수정
String val = list.get(0); // "peach"
list.set(0, "grape"); // -> { "grape", "apple", "banana" }

// 요소 제거
list.remove(0); // remove(index)
list.remove("apple"); // remove(Object)

// 포함 여부, 인덱스 확인
boolean hasGrape = list.contains("grape"); // contains(Object)
int firstIdx = list.indexOf("grape"); // 앞부터 조회한 index, 없으면 -1
int lastIdx = list.lastIndexOf("grape"); // 뒤부터 조회한 index, 없으면 -1

// 상태 확인
boolean isEmpty = list.isEmpty(); // 비어있는지
int size = list.size(); // 요소가 몇개인지

// 전체 요소 삭제
list.clear();

// 배열 변환
String[] arr = list.toArray(new String[0]);

// 반복 처리
list.forEach(System.out::println);

Iterator<String> it = list.iterator();
while (it.hasNext()) {
    System.out.println(it.next());
}

// List 전용 메서드 예시
List<String> sub = list.subList(0, Math.min(2, list.size())); // subList(): 부분 리스트를 반환
ListIterator<String> listIt = list.listIterator(); // listIterator(): 양방향 탐색 가능한 반복자
while (listIt.hasNext()) {
    System.out.println("앞: " + listIt.next());
}
while (listIt.hasPrevious()) {
    System.out.println("뒤: " + listIt.previous());
}
```

### Set

```java
Set<String> set = new HashSet<>();

// 요소 추가 (중복 허용 안됨)
set.add("dog");
set.add("cat");
set.add("dog"); // 중복 추가 무시됨
// -> { "dog", "cat" }

// 요소 제거
set.remove("dog");

// 포함 여부 확인
boolean hasCat = set.contains("cat");

// 비었는지, 크기 확인
boolean setIsEmpty = set.isEmpty();
int setSize = set.size();

// 전체 요소 삭제
set.clear();

// 배열로 변환
String[] setArr = set.toArray(new String[0]);

// 반복 처리
set.forEach(System.out::println);

Iterator<String> setIt = set.iterator();
while (setIt.hasNext()) {
    System.out.println(setIt.next());
}

// TreeSet 전용 메서드 예시
NavigableSet<Integer> treeSet = new TreeSet<>(Set.of(10, 20, 30, 40));
System.out.println(treeSet.first()); // first(): 가장 낮은 값 반환
System.out.println(treeSet.ceiling(25)); // ceiling(e): e 이상인 최소값
System.out.println(treeSet.higher(30)); // higher(e): e 초과 최소값
System.out.println(treeSet.lower(20)); // lower(e): e 미만 최대값
System.out.println(treeSet.subSet(10, true, 30, false)); // subSet(from, to): 범위 조회
```

### Map

```java
Map<String, Integer> map = new HashMap<>();

// 요소 추가 및 조회
map.put("철수", 90); // put(K, V)
map.put("영희", 85);
map.putIfAbsent("영희", 100); // 이미 있으므로 무시됨

int score = map.get("철수"); // Key 값이 "철수"인 value 값을 반환
int defaultScore = map.getOrDefault("민수", 0); // "민수"인 Key가 없다면 default 값을 반환

// 요소 수정
map.replace("철수", 95); // replace(K, newVal)
map.replace("영희", 85, 88); // replace(K, oldVal, newVal)

// 요소 제거
map.remove("영희"); // remove(K)
map.remove("철수", 90); // remove(K, V) → 값이 다르면 제거 안 됨

// 포함 여부 확인
boolean hasKey = map.containsKey("민수");
boolean hasValue = map.containsValue(95);

// 상태 확인
boolean mapIsEmpty = map.isEmpty();
int mapSize = map.size();

// 반복 처리
for (String key : map.keySet()) {
    System.out.println("key = " + key);
}

for (Integer value : map.values()) {
    System.out.println("value = " + value);
}

for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " = " + entry.getValue());
}

// Map 전용 고급 메서드
map.compute("민수", (k, v) -> v == null ? 1 : v + 10); // compute(): 기존 값 기반 연산
map.computeIfAbsent("영희", k -> 100); // computeIfAbsent(): 없을 때만 생성
map.merge("철수", 5, Integer::sum); // merge(): 기존 값과 병합

// TreeMap 전용 메서드 예시
TreeMap<String, Integer> treeMap = new TreeMap<>();
treeMap.put("apple", 3);
treeMap.put("banana", 2);
treeMap.put("cherry", 5);

System.out.println(treeMap.firstKey()); // firstKey(): 가장 앞 키 반환
System.out.println(treeMap.ceilingKey("apricot")); // ceilingKey(): 주어진 키 이상 중 가장 작은 키
System.out.println(treeMap.subMap("apple", "cherry")); // subMap(): 범위 맵 반환

// 전체 제거
map.clear();
```
