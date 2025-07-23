---
title: "[Java] 상속(Inheritance)"
categories: [Java, Java/Basic]
tags: [Java, inheritance, 상속, TIL]
date: '2025-07-11 19:06:00'
# last_modified_at: '2025-07-11 19:06:00'
# sitemap:
#     changefreq: weekly
#     priority: 0.5
---

인프런 얄코의 **제대로 파는 자바** 강의를 듣고 정리한 글입니다.

## 기본 문법

---

```java
class 부모클래스 {
    // 필드, 생성자, 메서드 등
}

class 자식클래스 extends 부모클래스 {
    // 부모의 모든 public, protected 멤버를 상속받는다.
    // 추가적인 필드나 메서드를 정의할 수 있다.
}
```

- `extends`: 상속을 표현할 때 사용
- 한 클래스만 상속 가능 (다중 상속 불가 ❌)
- 부모 클래스의 생성자는 자동으로 상속되지 않고, `super()`로 호출 가능
- `private` 멤버는 상속되어도 직접 접근 불가 (`protected`, `public`은 가능)

## 예제1️⃣

---

1. `Button.java` (부모 클래스)

   ```java
   public class Button {
       private String print;

       public Button(String print) {
           this.print = print;
       }

       public void func() {
           System.out.println(print + " 입력 적용");
       }
   }
   ```

2. `ShutDownButton.java` (자식 클래스 1)

    ```java
    public class ShutDownButton extends Button {
        public ShutDownButton () {
            super("ShutDown"); // 💡 부모의 생성자 호출
        }

        //  💡 부모의 메소드를 override
        @Override
        public void func () {
            System.out.println("프로그램 종료");
        }
    }
    ```

3. `ToggleButton.java` (자식 클래스 2)

    ```java
    public class ToggleButton extends Button {
        private boolean on;
        
        public ToggleButton(String print, boolean on) {
            // 반드시 자식 생성자 최상위에 위치해야 한다.
            // 부모가 있어야 자식이 태어날 수 있기 때문이라고 생각하면 됨
            super(print);

            this.on = on;
        }

        @Override
        public void func () {
            // 💡 부모에서 정의한 메소드 호출 (생성자와 다르게 위치 상관 X)
            // super 를 제거하면 재귀함수가 되어 무한반복됨
            super.func();
            
            this.on = !this.on;
            System.out.println(
                    "대문자입력: " + (this.on ? "ON" : "OFF")
            );
        }
    }
    ```

## 예제2️⃣

---

1. `Slime.java` (부모 클래스)

    ```java
    public class Slime {
        protected double hp = 50;
        protected int attack = 8;
        protected double defense = 0.2;

        public void attack (Slime enemy) {
            enemy.hp -= this.attack * (1 - enemy.defense);
        }
    }
    ```

2. `FireSlime.java` (자식 클래스)

    ```java
    public class FireSlime extends Slime {
        private int fireAttack = 4;

        @Override
        public void attack (Slime enemy) {
            enemy.hp -= (attack + fireAttack) * (1 - enemy.defense);
        }
    }
    ```

## super

---

- 부모 클래스에 생성자가 작성되었을 시
  - 자식 클래스에도 생성자 작성 필요

- 부모의 기타 메소드를 자식 클래스에서 사용 시 앞에 `super.` 를 붙인다.
  - 즉, `super` 는 부모 클래스의 인스턴스를 가리킴
  - 어떤 메소드에서든, 어떤 위치에서든 사용 가능

## @Override 어노테이션

---

- 부모의 특성 메소드를 오버라이드함을 명시
  - 없어도 오류는 나지 않지만 **실수 방지**를 위해 붙인다.
  - 붙였을 때 메소드명이 다르다면 오류

## 부모 클래스에 명시된 생성자가 없는 경우

---

- 자식 클래스에서도 작성할 필요 없음
