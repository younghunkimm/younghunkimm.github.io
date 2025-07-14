---
title: "[Java] 다형성(Polymorphism)"
categories: [Java]
tags: [Java, polymorphism, 다형성, 객체지향, OOP, TIL]
date: '2025-07-14 20:06:00 +0900'
---

인프런 얄코의 **제대로 파는 자바** 강의를 듣고 정리한 글입니다.

## 다형성이란?

---

- 하나의 객체가 여러 가지 형태를 가질 수 있는 성질
- 객체지향 프로그램(OOP)의 핵심 개념 중 하나로, 주로 **상속**과 **인터페이스**를 통해 구현된다.

## 예제

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

        public void forceFunc () {
            System.out.println("프로그램 강제종료");
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

4. `Main.java`

    ```java
    public class Main {
        public static void main(String[] args) {
            // ⭐️ Button의 범주로 묶어 배열에서 사용할 수 있다.
            Button[] buttons = {
                    new Button("Space"),
                    new ToggleButton("NumLock", false),
                    new ShutDownButton()
            }

            for (Button button : buttons) {
                // ⭐️ 모든 Button들은 func 메서드를 가짐
                button.func();
            }
        }
    }
    ```

## `instanceof` 연산자

---

- 뒤에 오는 클래스의 자료형에 속하는(족보상 같거나 아래인) 인스턴스인지 확인
- 상속관계가 아닌 클래스끼리는 컴파일 오류

```java
Button button = new Button("버튼");
ToggleButton toggleButton = new ToggleButton("토글", true);
ShutDownButton shutDownButton = new ShutDownButton();

// true
boolean typeCheck1 = button instanceof Button;
boolean typeCheck2 = toggleButton instanceof Button;
boolean typeCheck3 = shutDownButton instanceof Button;

// false
boolean typeCheck4 = button instanceof ShutDownButton;
boolean typeCheck5 = button instanceof ToggleButton;

// ⚠️ 컴파일 에러
boolean typeCheck6 = toggleButton instanceof ShutDownButton;
boolean typeCheck7 = shutDownButton instanceof ToggleButton;
```

```java
Button[] buttons = {
        new Button("Space"),
        new ToggleButton("NumLock", false),
        new ShutDownButton()
};

for (Button btn : buttons) {
    if (btn instanceof ShutDownButton) { // ⭐️ 족보상 아래
        // ⭐️ 자식 클래스의 기능을 사용하려면 명시적 타입 변환
        ((ShutDownButton) btn).forceFunc();
    }
    btn.func();
}
```