---
title: "[CI/CD] CI/CD Pipeline 구축 (6) - SSM Document 작성 & 테스트 배포"
categories: [CI/CD]
tags: [spring, CI/CD, AWS, SSM, RunCommand, Document, Deployment]
date: '2025-09-23 13:21:00 +0900'
mermaid: true
---

해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/sparta-spring-plus){:target="_blank"} 에서 확인하실 수 있습니다.

## 1. SSM Document란?
---

AWS Systems Manager(SSM)의 **Document**는 EC2 인스턴스에 실행할 명령어를 정의한 스크립트 파일입니다.  
CI/CD 파이프라인에서는 **배포 스크립트**를 이 Document로 관리하여,  
GitHub Actions → SSM RunCommand → EC2 순서로 원격 배포를 실행합니다.

- **형식**: JSON 또는 YAML  
- **버전**: `schemaVersion`으로 명시 (주로 `2.2`)  
- **실행 방식**: `aws:runShellScript` 사용 → EC2에서 쉘 스크립트 실행  

<br><br><br>

## 2. Document 생성
---

콘솔: `Systems Manager > Documents > Create document > Command or Session`
- 이름: `spring-plus-deploy`
- 유형: `Command document`
- 형식: `YAML`

### Document 내용

```yaml
schemaVersion: '2.2'
description: Deploy spring-plus container on /opt/spring-plus using /spring-plus/prod/* parameters
parameters:
  ImageTag:
    type: String
    default: latest
    description: Docker image tag (e.g., commit SHA or latest)
mainSteps:
  - action: aws:runShellScript
    name: deploy
    inputs:
      runCommand:
        - |
          #!/usr/bin/env bash
          set -euo pipefail

          APP_NAME="spring-plus"
          IMAGE="younghunkimm/spring-plus:{{ ImageTag }}"
          PORT=8080
          ENV_DIR="/opt/spring-plus/env"

          # 1) 디렉토리 준비
          mkdir -p "$ENV_DIR"

          # 2) Parameter Store -> app.env 생성
          aws ssm get-parameters-by-path \
            --path "/spring-plus/prod/" \
            --with-decryption \
            --region ap-northeast-2 \
            | jq -r '.Parameters[] | "\(.Name | split("/")[-1])=\(.Value)"' > "$ENV_DIR/app.env"

          echo "[env] written -> $ENV_DIR/app.env"

          # 3) (선택) Docker Hub private이면 로그인
          if grep -q "^DOCKERHUB_TOKEN=" "$ENV_DIR/app.env"; then
            DOCKERHUB_USERNAME=$(grep "^DOCKERHUB_USERNAME=" "$ENV_DIR/app.env" | cut -d= -f2- || true)
            DOCKERHUB_TOKEN=$(grep "^DOCKERHUB_TOKEN=" "$ENV_DIR/app.env" | cut -d= -f2- || true)
            if [ -n "$DOCKERHUB_USERNAME" ] && [ -n "$DOCKERHUB_TOKEN" ]; then
              echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin || true
            fi
          fi

          # 4) 이미지 풀 & 기존 컨테이너 정리
          docker pull "$IMAGE"
          docker rm -f "$APP_NAME" || true

          # 5) 컨테이너 실행
          docker run -d --name "$APP_NAME" \
            --env-file "$ENV_DIR/app.env" \
            -p ${PORT}:8080 \
            --restart unless-stopped \
            "$IMAGE"

          # 6) 헬스체크
          MAX_RETRIES=30
          SLEEP_SEC=2
          for ((i=1; i<=MAX_RETRIES; i++)); do
            if curl -fsS "http://localhost:${PORT}/actuator/health" >/dev/null; then
              echo "HEALTH: UP"
              break
            fi
            echo "[$i/$MAX_RETRIES] waiting..."
            sleep "$SLEEP_SEC"
          done
          if [ "$i" -gt "$MAX_RETRIES" ]; then
            echo "HEALTH CHECK FAILED"
            docker logs --tail=200 "$APP_NAME" || true
            exit 1
          fi
```

> **환경변수(env) 적용 과정 설명 [1 ~ 2 단계]**
> 
> - `SSM Parameter Store`에서 저장된 값을 가져와 `app.env` 파일에 내용을 작성하고 서버에 파일 생성
> - 도커 컨테이너가 실행될 때 해당 `app.env` 파일을 환경 변수 파일로 지정
> - `mkdir -p` 옵션으로 `/opt` 폴더 내에 `/opt/spring-plus/env` 폴더 생성하는데 `spring-plus` 폴더가 없다면 같이 생성
{: .prompt-info}

> **Docker Hub 로그인 과정 설명 [3 단계]**
>
> - Docker Hub가 **private** 이면 `parameter store` 에 `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` 설정
>   - 해당 값이 있다면 자동 로그인, 없다면 public으로 판단
{: .prompt-info}

### 배포 경로

`/opt/spring-plus`: 애플리케이션 관련 파일 저장 위치

#### ✅ 장점

- 시스템 표준 위치라 “서비스 배포 경로”라는 의도가 명확
- root 권한으로 관리되므로 보안/권한 제어 용이
- 다른 사용자 계정과 충돌 없음

#### ❌ 단점

- 매번 `sudo` 필요
- 일반 사용자 계정에서 접근할 때 번거로움

<br><br><br>

## 3. Document 실행 테스트
---

태깅된 EC2 인스턴스(e.g. `SSMTarget=spring-plus`)가 있다면,  
AWS에서 제공하는 `SSM Run Command` 기능을 통해 `Document`를 실행할 수 있습니다.  

또, DockerHub에 Push된 이미지가 있어야 합니다.

![image]({{ site.baseurl }}/assets/img/posts/250922/ssm-run-command.png "SSM Run Command"){: style="border-radius: 1rem"}

### 만약 실행에 실패했다면

인스턴스 중 하나에 SSH로 접속하여 아래 명령어를 실행해 로그를 확인합니다.

```shell
docker ps -a
docker logs <YOUR_CONTAINER_NAME> --tail=200

# 특정 문자열로 로그를 검색하고 싶다면
docker logs <YOUR_CONTAINER_NAME> | grep "<SEARCH_KEYWORD>"
```

### 실행에 성공했다면

인스턴스 중 하나에 SSH로 접속하여 스프링 부트 실행 확인 및 헬스 체크를 해봅니다.

```shell
docker ps -a
docker logs <YOUR_CONTAINER_NAME> --tail=200

# Health check
curl -i http://localhost:8080/actuator/health
```

![image]({{ site.baseurl }}/assets/img/posts/250922/health-check-success.png "Health Check Success"){: style="border-radius: 1rem"}

<br><br><br>

## 4. 파이프라인 연계
---

이제 이 Document는 **CD 워크플로우에서 호출**하게 됩니다.

- GitHub Actions에서 **OIDC Role** Assume  
- `aws ssm send-command` 실행  
- 파라미터로 `ImageTag=${{ github.sha }}` 전달  
- 태그(`SSMTarget=spring-plus`) 붙은 모든 EC2에 배포

즉, **배포 스크립트를 GitHub Actions 안에 직접 쓰는 대신, SSM Document에 캡슐화**하여 관리하는 방식입니다.

> 장점:
> - 배포 로직을 AWS에 중앙 집중 관리  
> - 배포 스크립트 변경 시 GitHub Actions YAML을 수정할 필요 없음  
> - EC2 개수 증가 시 태그 기반으로 자동 확장 적용
{: .prompt-tip}

<br><br><br>

## 다음 포스팅
---

이번 포스팅에서는 **SSM Document 작성 & 테스트 배포** 과정을 정리했습니다.  
다음 포스팅에서는 **GitHub Actions CI/CD 워크플로우** 과정을 다룹니다.
