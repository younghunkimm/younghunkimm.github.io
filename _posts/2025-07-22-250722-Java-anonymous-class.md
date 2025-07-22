---
title: "[Java] 익명 클래스(Anonymous Class)"
categories: [Java]
tags: [Java, 익명 클래스, Anonymous Class, TIL]
date: '2025-07-22 20:06:00 +0900'
---

인프런 얄코의 **제대로 파는 자바** 강의를 듣고 정리한 글입니다.

## 익명 클래스란?

---

**익명 클래스(Anonymous Class)**는 이름이 없는 클래스이며, **일회성으로 사용되는 객체를 생성할 때 사용**되며, 보통 인터페이스나 추상 클래스의 메소드를 재정의할 때 자주 쓰인다.

## 예제

---

`onClickListener.java`
```java
public interface OnClickListener {
    void onClick();
}
```

`Button.java`
```java
public class Button {
    String name;
    public Button(String name) {
        this.name = name;
    }

    //  ⭐️ 인터페이스를 상속한 클래스 자료형
    private OnClickListener onClickListener;
    public void setOnClickListener(OnClickListener onClickListener) {
        this.onClickListener = onClickListener;
    }

    public void func() {
        onClickListener.onClick();
    }
}
```

`Main.java`
```java
Button button1 = new Button("Enter");
Button button2 = new Button("CapsLock");
Button button3 = new Button("ShutDown");

button1.setOnClickListener(new OnClickListener() {
    @Override
    public void onClick() {
        System.out.println("줄바꿈");
        System.out.println("커서를 다음 줄에 위치");
    }

    // ⚠️ 새로운 메소드
    public void onDblClick() {
        System.out.println("2번 줄바꿈");
    }
});

button2.setOnClickListener(new OnClickListener() {
    @Override
    public void onClick() {
        System.out.println("기본입력 대소문자 전환");
    }
});

button3.setOnClickListener(new OnClickListener() {
    @Override
    public void onClick() {
        System.out.println("작업 자동 저장");
        System.out.println("프로그램 종료");
    }
})

// ⚠️ 불가
// 💡 익명클래스의 인스턴스는 상속받거나 오버라이드 된 메소드만 호출 가능
// button1.onDblClick();

for (Button button : new Button[] { button1, button2, button3 }) {
    button.func();
}
```