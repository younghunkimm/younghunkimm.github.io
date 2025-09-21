---
title: "[CI/CD] CI/CD Pipeline 구축 (4) - Docker 빌드 & 레지스트리"
categories: [CI/CD]
tags: [spring, CI/CD, AWS, Docker, DockerHub]
date: '2025-09-21 17:22:00 +0900'
mermaid: true
---

해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/sparta-spring-plus){:target="_blank"} 에서 확인하실 수 있습니다.

## 1. Docker 도입 배경
---

Spring Boot 애플리케이션을 직접 `jar`로 배포하는 방식에는 몇 가지 한계가 있었습니다.

- 서버 환경(OS, JDK 버전, 네트워크 세팅)이 다르면 실행 환경 불일치 발생  
- 배포할 때마다 빌드/실행 환경을 맞춰야 하는 번거로움  
- 여러 서버(EC2 인스턴스)에서 동일한 환경을 보장하기 어려움  

이 문제를 해결하기 위해 **Docker**를 도입했습니다.  
Docker 이미지를 만들어두면 **어떤 서버에서도 동일한 실행 환경**을 재현할 수 있고,  
CI/CD 파이프라인에서 빌드와 배포를 **컨테이너 단위로 표준화**할 수 있습니다.

<br><br><br>

## 2. Dockerfile 작성
---

멀티스테이지 빌드 방식을 사용했습니다.  
빌드 스테이지에서는 Gradle 컨테이너를 사용하고,  
실행 스테이지는 가볍고 최적화된 Amazon Corretto 17을 사용합니다.

```dockerfile
# === 빌드 스테이지 ===
# 베이스 이미지
FROM gradle:8.14-jdk17 AS builder
WORKDIR /app

# 캐시를 위해 wrapper 먼저 복사
COPY gradlew ./
COPY gradle/wrapper/ ./gradle/wrapper/

# 나머지 소스 복사
COPY . .

# 윈도우 줄바꿈 제거 + 실행 권한 부여
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# --no-daemon 권장
RUN ./gradlew clean build -x test --no-daemon

# === 실행 스테이지 ===
# 베이스 이미지
FROM amazoncorretto:17
WORKDIR /app
# 빌드된 JAR만 파일 복사해 이미지 크기 최소화
COPY --from=builder /app/build/libs/*.jar app.jar
# Spring Boot 기본 포트
EXPOSE 8080
# java -jar로 앱 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
```

> 명령어 설명
> - `gradle/wrapper`를 먼저 복사하면 **Gradle 버전 다운로드 캐시**가 빌드 단계마다 재사용됩니다.
> - `sed -i 's/\r$//' gradlew`는 Windows에서 발생하는 `CRLF` 문제를 해결합니다.
> - `--no-daemon` 옵션을 사용하면 CI/CD 환경에서 **빌드 데몬 충돌을 방지**할 수 있습니다.
{: .prompt-tip}

<br><br><br>

## 3. Docker 빌드 & 실행
---

### 로컬 빌드
```shell
# Docker 이미지 빌드
docker build -t younghunkimm/spring-plus:latest .

# 컨테이너 실행
docker run -d -p 8080:8080 --env-file .env.prod --name spring-plus younghunkimm/spring-plus:latest
```

- `-d`: 백그라운드 실행
- `-p 8080:8080`: 호스트 8080 포트를 컨테이너 8080 포트에 매핑
- `--env-file .env.prod`: 환경변수를 파일로 주입
- `--name spring-plus`: 컨테이너 이름 지정
- `younghunkimm/spring-plus:latest`: 이미지 이름과 태그

#### product env example

```html
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://localhost:3306/<DB_NAME>
DB_USERNAME=<DB_USERNAME>
DB_PASSWORD=<DB_PASSWORD>
JWT_SECRET_KEY=<JWT_SECRET_KEY>
AWS_ACCESS_KEY_ID=<Access Key>
AWS_SECRET_ACCESS_KEY=<Secret Key>
```

> 실제 운영 환경에서는 `SSM Parameter Store`에서 환경 변수를 읽어오도록 설정하기 때문에  
> 레지스트리 등록 후 테스트를 완료하신 뒤에는 `.env.prod` 파일은 삭제를 권장드립니다.
{: .prompt-danger}

### 실행 확인
```shell
# 모든 컨테이너 상태 확인 (`-a` 옵션으로 종료된 컨테이너도 표시)
docker ps -a

# 컨테이너 로그 확인 (`-f` 옵션으로 실시간 로그 확인)
docker logs -f spring-plus

# Spring Actuator Health Check
curl http://localhost:8080/actuator/health
```

Spring Boot 앱이 정상적으로 실행되는지 확인합니다.

<br><br><br>

## 4. Docker Hub Private Repository
---

CI/CD 파이프라인에서는 이미지를 저장하고 배포 서버(EC2)에서 가져올 수 있는 **저장소**가 필요합니다.  
이를 위해 **Docker Hub Private Repository**를 사용했습니다.

### Docker Hub 토큰 발급

해당 토큰은 GitHub Actions에서 Docker Hub에 로그인할 때 사용됩니다.

![image]({{ site.baseurl }}/assets/img/posts/250922/dockerhub-access-token.png "Docker Hub Access Token"){: style="border-radius: 1rem"}

### Docker Hub에서 Repository 생성

![image]({{ site.baseurl }}/assets/img/posts/250922/dockerhub-repo.png "Docker Hub Private Repository"){: style="border-radius: 1rem"}

### Docker Image 확인

```shell
docker images

>>
PS C:\Users\huni> docker images
REPOSITORY                 TAG       IMAGE ID       CREATED        SIZE
younghunkimm/spring-plus   latest    a1b7da39e3ae   10 hours ago   821MB
```

### Docker Hub Image Push

```shell
# Docker Hub Login
docker login

# Image Push
docker tag younghunkimm/spring-plus:latest younghunkimm/spring-plus:v1.0.0
docker push younghunkimm/spring-plus:v1.0.0
```

이제 EC2 인스턴스에서는 `docker pull` 명령으로 이미지를 가져올 수 있습니다.   
실제 파이프라인에서는 로컬이 아닌 **GitHub Actions**에서 자동으로 빌드/푸시를 수행합니다.

> 운영 팁: Docker Hub는 무료 계정의 경우 **Private Repository 개수 제한**이 있으니,  
> 팀 단위에서는 AWS ECR(Amazon Elastic Container Registry)도 고려해볼 수 있습니다.
{: .prompt-info}

<br><br><br>

## 다음 포스팅
---

이번 포스팅에서는 **Docker 이미지 빌드 및 Docker Hub 푸시** 과정을 정리했습니다.  
다음 포스팅에서는 **GitHub Actions OIDC 설정** 과정을 다룹니다.
