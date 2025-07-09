---
title: "[Java] Scanner 그리고 Buffer 비우기"
categories: [Java]
tags: [Java, Scanner, Buffer, TIL]
date: '2025-07-09 23:06:00 +0900'
---

## 🚀 Scanner 의 Buffer 비우기

---

### 📝 개요

Java 를 공부하며, 계산기를 만드는 프로젝트를 진행 중에 에러를 해결하는 과정 중 알게 된 사실을 정리하고자 한다.

### 🔥 문제 상황

계산기의 기능은 숫자 2개와 연산자를 사용자에게 입력받아 간단한 사칙연산을 할 수 있는 기능이다.

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
