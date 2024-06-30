---
title: "[Github Blog] 마크다운(Markdown) 사용법"
categories: [Tips]
tags: [마크다운, Markdown]
date: '2024-06-30 12:01:00 +0900'
---

> 자주 쓰이는 <span style="color: orange;">마크다운 문법</span>을 정리한 글입니다.
{: .prompt-info}

## 헤더

---

> 문단별 제목

* **예시**
  
  ```plaintext
  # 1단계 제목 (h1)
  ## 2단계 제목 (h2)
  ### 3단계 제목 (h3)
  #### 4단계 제목 (h4)
  ##### 5단계 제목 (h5)
  ###### 6단계 제목 (h6)
  ```

* **결과**
  
  <h1 data-toc-skip>1단계 제목 (h1)</h1>
  <h2 data-toc-skip>2단계 제목 (h2)</h2>
  <h3 data-toc-skip>3단계 제목 (h3)</h3>
  <h4 data-toc-skip>4단계 제목 (h4)</h4>
  <h5 data-toc-skip>5단계 제목 (h5)</h5>
  <h6 data-toc-skip>6단계 제목 (h6)</h6>

---

## 폰트 스타일

---

> 굵게, 기울임꼴, 취소선, 밑줄

* **예시**

  ```plaintext
  **굵게**
  *기울임꼴*
  ~~취소선~~
  <u>밑줄</u>
  ```

* **결과**

  **굵게**  
  *기울임꼴*  
  ~~취소선~~  
  <u>밑줄</u>

---

## 줄바꿈

---

### HTML 태그를 활용

> 문장 끝에 `<br>` 입력

* **예시**
  
  ```plaintext
  안녕<br>
  하세요
  ```
* **결과**
  
  안녕<br>
  하세요

### 공백을 활용

> 문장 끝에 띄워쓰기를 `2번` 입력하면 줄이 바뀜

* **예시**

  ```plaintext
  안녕  
  하세요
  ```

* **결과**

  안녕  
  하세요.

### 인용구에서의 줄바꿈

> 인용구 끝에 `\` 입력

* **예시**

  ```plaintext
  > 안녕\
  > 하세\
  > 요
  ```

* **결과**
  > 안녕\
  > 하세\
  > 요

---

## 목록

---

> 요소를 나열

### 순서가 있는 목록

* **예시**

  ```plaintext
  1. 첫번째 요소
  1. 두번째 요소
  1. 세번째 요소
  ```

* **결과**

  1. 첫번째 요소
  1. 두번째 요소
  1. 세번째 요소

### 순서가 없는 목록

> `*`, `+`, `-` 활용

* **예시**

  ```plaintext
  + 과일
    - 사과
    - 오렌지
    - 바나나
      * 원숭이
  ```

* **결과**

  + 과일
    - 사과
    - 오렌지
    - 바나나
      * 원숭이

### 체크 목록

> `* [ ]` 활용

* **예시**

  ```plaintext
  * [ ] TO DO LIST
    * [ ] Study
    * [x] Game
  ```

* **결과**
  * [ ] TO DO LIST
    * [ ] Study
    * [x] Game

### 설명 목록

> `:` 활용

* **예시**

  ```plaintext
  DBMS (Database Management System)
    : 데이터베이스 관리 시스템  
    데이터베이스를 운영하고 관리하는 소프트웨어
  ```

* **결과**
  
  DBMS (Database Management System)
    : 데이터베이스 관리 시스템  
    데이터베이스를 운영하고 관리하는 소프트웨어

---

## 인용구

---

### 일반 인용구

> `>` 활용

* **예시**

  ```plaintext
  > 인용구
  >> 안의 인용구
  >>> 안의 인용구
  ```

* **결과**

  > 인용구
  >> 안의 인용구
  >>> 안의 인용구

### 프롬프트 메세지

* **예시**

  ```plaintext
  > TIP
  {: .prompt-tip}

  > INFO
  {: .prompt-info}

  > WARNING
  {: .prompt-warning}

  > DANGER
  {: .prompt-danger}
  ```

* **결과**

  > TIP
  {: .prompt-tip}

  > INFO
  {: .prompt-info}

  > WARNING
  {: .prompt-warning}

  > DANGER
  {: .prompt-danger}

---

## 코드

---

### 인라인 코드

> `` ` `` 내용 입력 `` ` ``

* **예시**
  
  ```plaintext
  안녕하세요. `{{ site.title }}` 입니다.
  ```

* **결과**
  
  안녕하세요. `{{ site.title }}` 입니다.

### 코드 블럭

> ```` ```언어명 ````\
> 내용 입력\
> ```` ``` ````

* **예시**

  ````plaintext
  ```javascript
  let bar = 'foo';
  ```
  ````

* **결과**

  ```javascript
  let bar = 'foo';
  ```

---

## 테이블

---

* **예시**

  ```plaintext
  |      | 점수 | 등급  |
  | :--- | ---: | :---: |
  | 수학 |  100 |   A   |
  | 영어 |   65 |   C   |
  ```

* **결과**

  |      | 점수 | 등급  |
  | :--- | ---: | :---: |
  | 수학 |  100 |   A   |
  | 영어 |   65 |   C   |

---

## 링크

---

> 클릭 시 해당 페이지로 이동

* **예시**

  ```plaintext
  <{{ site.social.links[0] }}>  
  [Link]({% if site.social.links %}{{ site.social.links[0] }}{% endif %})  
  [Link]({% if site.social.links %}{{ site.social.links[0] }}{% endif %} "마우스 오버 시 출력될 링크에 대한 설명")  
  [새창으로 열기]({% if site.social.links %}{{ site.social.links[0] }}{% endif %}){:target="_blank"}

  [현재 페이지 안에서의 이동](#폰트-스타일)
  ```

* **결과**

  <{{ site.social.links[0] }}>  
  [Github]({% if site.social.links %}{{ site.social.links[0] }}{% endif %})  
  [Github]({% if site.social.links %}{{ site.social.links[0] }}{% endif %} "마우스 오버 시 출력될 링크에 대한 설명")  
  [새창으로 열기]({% if site.social.links %}{{ site.social.links[0] }}{% endif %}){:target="_blank"}

  [현재 페이지 안에서의 이동](#폰트-스타일)
  ❗️ 사용법
    : 1. 특수문자를 `제거`  
    1. 공백은 `-` 로 치환  
    2. 모든 대문자를 `소문자로 변경`

---

## 이미지

---

### 마크다운 활용

> !\[`Description`\]\(`Path`\){: style="`CSS`"}

* **예시**

  ```plaintext
  ![이미지](https://upload.wikimedia.org/wikipedia/commons/5/5f/Mahameru-volcano.jpeg "화산"){: style="border: 1px solid orange; border-radius:15px"}
  ```

* **결과**

  ![이미지](https://upload.wikimedia.org/wikipedia/commons/5/5f/Mahameru-volcano.jpeg "화산"){: style="border: 1px solid orange; border-radius:15px"}

### HTML 활용

> 이미지의 가로, 세로 길이를 설정할 수 있다.\
> \<img src="`Path`" width="`Width`" height="`Height`">

* **예시**

  ```plaintext
  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Mahameru-volcano.jpeg" width="30%" />
  ```

* **결과**

  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Mahameru-volcano.jpeg" width="30%" />


### 링크 삽입

> [!\[`Description`\]\(`Path`\)]\(`Link`\)\{`Attribute`\}

* **예시**

  ```plaintext
  [![이미지](https://upload.wikimedia.org/wikipedia/commons/5/5f/Mahameru-volcano.jpeg "화산")](https://ko.wikipedia.org/wiki/%ED%99%94%EC%82%B0){:target="_blank"}
  ```

* **결과**

  [![이미지](https://upload.wikimedia.org/wikipedia/commons/5/5f/Mahameru-volcano.jpeg "화산")](https://ko.wikipedia.org/wiki/%ED%99%94%EC%82%B0){:target="_blank"}

---