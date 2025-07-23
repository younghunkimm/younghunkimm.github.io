---
title: "[Java] Scanner 그리고 Buffer 비우기"
categories: [Java, Java/Trouble Shooting]
tags: [Java, Scanner, Buffer, Trouble Shooting, TIL]
date: '2025-07-09 23:06:00 +0900'
---

## 📝 개요

---

Java 를 공부하며, 계산기를 만드는 프로젝트를 진행 중에 에러를 해결하는 과정 중 알게 된 사실을 정리하고자 한다.

## 🔥 문제 상황

---

계산기의 기능은 숫자 2개와 연산자를 사용자에게 입력받아 사칙연산을 할 수 있는 간단한 기능이다.

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ArithmeticCalculator calc = new ArithmeticCalculator();
        
        while (true) {
            try {
                System.out.print("첫 번째 숫자를 입력하세요: ");
                double num1 = sc.nextDouble();

                System.out.print("두 번째 숫자를 입력하세요: ");
                double num2 = sc.nextDouble();

                System.out.print("사칙연산 기호를 입력하세요(+,-,*,/): ");
                char symbol = sc.next().charAt(0);

                double result = calc.calculate(num1, num2, symbol);
            
                System.out.println("결과: " + result);

                System.out.println("더 계산하시겠습니까? (exit 입력 시 종료)");
                if (sc.next().equalsIgnoreCase("exit")) break;
            } catch (InputMismatchException e) {
                System.out.println("유효한 숫자를 입력해주세요.");
            } catch (IllegalArgumentException e) {
                System.out.println(e.getMessage());
            } catch (ArithmeticException e) {
                System.out.println(e.getMessage());
            } catch (Exception e) {
                System.out.println("알 수 없는 오류가 발생했습니다.");
            }
        }

        sc.close();
    }
}
```

첫 번째 숫자에 문자열을 입력 후 Enter 키를 눌렀더니

![Buffer Error](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FX4ori%2FbtsPbXGmaUO%2FAAAAAAAAAAAAAAAAAAAAAEkVbq3xOExGqIrZY1V9YZXhMJbGGQJ1p7omv2W4Oyvz%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3Dul%252BmDmTIx6P4ldHaGl6%252BVj1XvCw%253D)

해당 메시지가 무한으로 출력되는 현상이 발생했다.

## 👀 원인

---

`Scanner` 클래스는 입력 버퍼를 사용하여 데이터를 읽는다.
<br>
`nextDouble()` 메서드는 입력된 문자열을 숫자로 변환하려고 시도하는데, 만약 문자열이 숫자가 아닌 경우 `InputMismatchException` 예외를 발생시킨다.
<br>
이 예외가 발생하면, `Scanner`의 입력 버퍼에 해당 문자열이 남아있게 된다.
<br>
이후 `nextDouble()`을 다시 호출하면, 여전히 같은 문자열을 읽으려고 시도하게 되어 무한 루프가 발생한다.

## 💡 설명

---

> 물이 담긴 빨대컵

##### `Scanner`를 **물이 담긴 빨대컵**이라고 상상해보자.

- 컵(버퍼): 사용자가 키보드로 입력한 모든 내용(글자, 숫자, 엔터 키)이 잠시 저장되는 공간
- 빨대(메서드): `sc.next()`, `sc.nextDouble()`, `sc.nextLine()` 같은 메서드들이 빨대 역할을 하며, 이 빨대로 컵에 담긴 물(입력)을 가져온다.

##### 문제의 핵심은 각 빨대가 물을 마시는 방식이 다르다는 것

1. `sc.nextDouble()`, `sc.nextInt()`, `sc.next()`
   - 이 빨대들은 토큰(Token) 단위로 물을 마신다. 토큰은 공백(스페이스, 탭, 엔터)으로 구분되는 단어 같은 것
   - **문제점**: 이 빨대들은 토큰만 마시고, 토큰 뒤에 따라오는 **나머지 물(특히 엔터 키`\n`에 해당하는 줄바꿈 문자)**은 컵(버퍼)에 그대로 남겨둔다.

   **예시:** 사용자가 키보드로 `123` 을 입력하고 `Enter` 키를 눌렀다고 가정

   - 컵에는 `123\n` (123 뒤에 줄바꿈 문자) 이 담긴다.
   - `sc.nextDouble()` 이 `123` 을 읽어간다.
   - 컵에는 `\n` 이 남는다.

2. `sc.nextLine()`
   - 이 빨대는 **줄(Line)** 단위로 물을 마신다.
   - 현재 커서 위치부터 **다음 줄바꿈 문자(`\n`)가 나올 때 까지** 모든 물을 마시고, `\n` 자신도 마시고 버린다.

##### 문제 발생 시나리오

1. 코드: `double firstNumber = sc.nextDouble();`
2. 사용자 입력: `abc` (그리고 `Enter` 키)
3. 컵(버퍼) 상태: `abc\n` 이 담긴다.
4. `sc.nextDouble()` 동작
   : `abc` 는 숫자가 아니므로 `InputMismatchException` 예외 발생
5. 예외 발생 후
   : `abc\n`은 여전히 컵에 남아있게 된다.  
   `sc.nextDouble()` 은 예외를 던지고 입력을 소비하지 않기 때문
6. `catch` 블록 진입
   : `try-catch` 블록에 의해 `inputMismatchException` 예외가 잡히고, 오류 메시지가 출력된다.
7. `while` 루프 반복
   : 다시 루프의 처음으로 돌아가 첫 번째 숫자를 입력받는 코드를 실행
8. 문제 발생 ❗️
   : `sc.nextDouble()` 은 컵에 남아있던 `abc`를 다시 만나 또 다시 예외를 던지고, 이 과정이 반복된다.  
   사용자는 아무것도 입력하지 않았는데도 무한히 오류 메시지가 출력되는 현상이 발생한다.

## ✅ 해결

---

`sc.nextLine()` 사용하여 버퍼 비우기

```java
try {
    double num1 = sc.nextDouble();
    // ...
} catch (InputMismatchException e) {
    System.out.println("유효한 숫자를 입력해주세요.");
    sc.nextLine(); // 버퍼 비우기
    // ...
```

##### 시나리오

1. 사용자 입력: `abc` (Enter) -> 컵에 `abc\n`
2. `sc.nextDouble()` 예외 발생. `abc\n` 잔류
3. `catch` 블록 진입. 오류 메세지 출력
4. `sc.nextLine()` 실행
   : 컵에 남아있던 `abc\n` 모두 마시고 버퍼를 비운다. (컵이 비워짐)
5. `while` 루프 반복. `sc.nextDouble()` 이 실행
6. 정상 작동
   : 컵이 비어있으므로 `sc.nextDouble()` 은 새로운 사용자 입력을 기다린다.  
   무한 반복 문제가 해결

