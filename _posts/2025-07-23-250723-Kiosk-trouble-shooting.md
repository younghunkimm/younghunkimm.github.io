---
title: "[Java] 키오스크 과제 트러블슈팅 기록"
categories: [Java, Java/Trouble Shooting]
tags: [Java, 트러블슈팅, Trouble Shooting, TIL]
date: '2025-07-23 13:13:00 +0900'
---

키오스크 과제를 진행하면서 겪은 트러블슈팅의 과정들에 대한 기록입니다.   
해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/java-kiosk){:target="_blank"} 에서 확인하실 수 있습니다.

## 트러블슈팅1️⃣

---

### ⭐️ 주제

**장바구니 수량 처리**

### 🔥 발생

과제 요구사항 중 하나는 **장바구니에 담긴 메뉴 아이템들에 수량을 함께 저장하는 기능**을 구현하는 것이었다.   

처음에는 `List<MenuItem>` 컬렉션을 사용해서 메뉴 아이템들을 담고 있었기 때문에   
여기에 수량 정보를 어떻게 매칭할 수 있을지 고민이 많았다.   

> 익숙했던 방식과의 차이

기존에 개발할 때 사용했었던 PHP나 JavaScript는 배열과 객체를 유연하게 다룰 수 있었기 때문에   
대충 구현 흐름이 그려졌는데 이걸 Java에서 구현하려니 막막했던 것 같다.

### 🔍 원인

처음 떠올랐던 자료구조는 `Map<MenuItem, Integer>` 형태였다.   
MenuItem을 key로, 수량을 value로 매칭하면 쉽게 해결될 것 같았다.   

하지만 한 가지 의문이 들었다.

> "나중에 수량 외에도 다른 정보를 함께 저장해야 한다면?"

이 경우 해당 구조는 확장성에서 불리하다고 판단되어,   
결국은 보류하고 튜터님께 의견을 구하러 갔다.

> 튜터님의 피드백

이런 고민을 안고 튜터님께 조언을 구했더니,   
"혹시 어떤 방식으로 구현할지 생각해본게 있으신가요?" 라는 질문을 받았다.   

`Map` 을 생각했지만, 앞서 말한 이유로 보류했다 말씀드리니   
그게 정답이 맞다고 하셨다. (내심 뿌듯했다)

튜터님은 더 많은 힌트를 주실 수 있었지만,   
**혼자 해결해보는 경험이 더 중요**하다고 생각해   
스스로 검색하며 방법을 찾아보도록 유도해 주셨다.

### ✅ 해결

```java
public class Cart {
    // ...

    private final Map<MenuItem, Integer> cartList = new HashMap<>();

    // 장바구니에 담긴 아이템들의 합계금액 구하기
    public BigDecimal getTotalPrice() {
        return cartList.entrySet().stream()
                .map(entry -> entry.getKey().getPrice().multiply(new BigDecimal(entry.getValue())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    // 장바구니 추가 기능
    public void put(MenuItem menuItem) {
        // 이미 key가 있다면 해당 key의 value값을 현재값의 + 1
        // 없다면 default 값인 0에 +1 하여 생성
        cartList.put(menuItem, cartList.getOrDefault(menuItem, 0) + 1);
    }

    // ...
}
```

그리하여 나는 `Map<MenuItem, Integer>` 를 활용해 수량 기능을 구현했다.   

하지만 앞으로 매칭할 데이터가 더 생긴다면 어떻게 처리할지도 고민해보았다.   
그래서 생각한 방법은 다음과 같다.

1. `MenuItemInfo` 라는 새로운 클래스 생성
2. 그 안에 수량, 옵션, 할인 등과 같은 정보를 저장
3. `Map<MenuItem, MenuItemInfo>` 구조로 변경

### 💡 결론

문제를 단순히 "수량만 저장하면 된다" 는 관점에서 보지 않고,   
추후 유지보수나 확장성을 고려해 자료구조를 고민했던 점이 특히 의미 있었다.   
처음엔 막막했지만,   
단순한 기능 하나에도 많은 설계적 요소가 포함될 수 있다는 걸 배웠다.

## 트러블슈팅2️⃣

---

### ⭐️ 주제

`BigDecimal` 타입의 `stripTrailingZeros()` 메소드

> `stripTrailingZeros()`
> 
> Java 의 `BigDecimal` 클래스에서 제공하는 메소드로  
> **소수점 아래 불필요한 0을 제거**하는 기능이다.
{: .prompt-info}

### 🔥 발생

BigDecimal을 이용해 연산한 결과를 콘솔창에 출력하던 중   
숫자 `10` 이 `1E+1` 로 출력되는 문제가 발생했다.

### 🔍 원인

- `stripTrailingZeros()` 는 불필요한 0을 제거한 후에 `scale()` 값이 0이 되면 `BigDecimal` 내부적으로 과학적 표기법(지수 표현)을 사용하여 값을 표현한다.

  > `scale()` 
  > 
  > Java 의 `BigDecimal` 클래스에서 제공하는 메소드로  
  > **소수점 아래 몇 자리 숫자가 있는지 반환**하는 기능이다.
  {: .prompt-info}

- 출력 결과에는 영향을 주지만, 실제 값의 크기에는 영향이 없다.

### ✅ 해결

지수 표현 없이 일반 숫자 형식으로 출력하고 싶다면,   
`toPlainString()` 또는 `toString()` 을 사용하여야 한다.

```java
BigDecimal bigDecimal = BigDecimal.valueOf(100).stripTrailingZeros() // 1E+2
String plainString = bigDecimal.toPlainString(); // "100"
```

### 💡 결론

정확한 계산을 위해 실무에서는 `BigDecimal` 을 많이 사용한다고 하는데   
사람에게 보이는 영역에 출력할 때는 신중히 다뤄야 할 것 같다.

## 트러블슈팅3️⃣

---

### ⭐️ 주제

`equals()` 와 `hashCode()` 오버라이딩

### 🔥 발생

트러블슈팅1️⃣ 에서 `List` → `Map` 으로 구조 변경하는 과정에서   
`Map<MenuItem, Integer>` 처럼 객체를 key로 사용할 경우,   
동일한 메뉴임에도 중복된 데이터가 여러 번 추가될 수 있다는 문제점을 발견했다.   

`List` 는 단순히 중복을 체크하지 않고 추가가 되기 때문에 문제가 없었지만,   
`Set` 과 `Map` 은 내부적으로 중복을 체크하기 때문에   
객체 동등성 판단 기준이 명확하지 않으면 당장에 에러가 없더라도   
추후에 예상하지 못한 동작이나 에러가 발생할 수 있다.

### 🔍 원인

`Map` 에서 key는 내부적으로 `equals()` 와 `hashCode()` 를 사용해 동등성을 판단한다.   
하지만 `MenuItem` 클래스에서 이 두 메소드를 오버라이딩하지 않았기 때문에 아래와 같은 상황이 발생할 수 있다.

```java
MenuItem item1 = new MenuItem("햄버거", 1500);
MenuItem item2 = new MenuItem("햄버거", 1500);

System.out.println(item1.equals(item2)); // false
```

두 객체는 같은 내용을 담고 있지만 `false` 가 나오는걸 볼 수 있다.   

```java
Map<MenuItem, Integer> map = new HashMap<>();

map.put(item1, 1);
map.put(item2, 3);

System.out.println(map.size()); // 2
```

### ✅ 해결

`MenuItem` 클래스에 `equals()` 와 `hashCode()` 를 오버라이딩하여
동등성을 판단하는 기준의 코드를 재정의해주면 동일한 객체로 인식하여 중복을 방지할 수 있다.

> intelliJ 에서 제공하는 **코드생성 기능**을 사용하면 자동으로 완성할 수 있다.  
> 
> 이 때, `instanceof` 방식과 `getClass` 방식을 선택할 수 있는데  
> - `instanceof` 방식은 `MenuItem` 을 상속한 **하위 클래스도 비교**할 수 있고,  
> - `getClass` 방식은 클래스가 **정확히 같을 때만 비교**할 수 있다.
{: .prompt-tip}

```java
@Override
public boolean equals(Object o) {
    if (!(o instanceof MenuItem menuItem)) return false;
    return Double.compare(price, menuItem.price) == 0 && Objects.equals(name, menuItem.name);
}

@Override
public int hashCode() {
    return Objects.hash(name, price);
}
```

### 💡 결론

이번 경험을 통해 컬렉션 구조나 객체 설계를 변경할 때는,   
객체 동등성 판단 기준도 함께 점검해야 한다는 점을 배웠다.   

어떻게 보면 사소해 보일 수 있는 `equals()` 와 `hashCode()` 가   
실질적인 로직 흐름에 큰 영향을 줄 수 있다는 것을 느낀 트러블슈팅이었다.
