---
title: "[CI/CD] CI/CD Pipeline 구축 (2) - AWS 인프라 세팅 (EC2 & ALB)"
categories: [CI/CD]
tags: [spring, CI/CD, AWS, EC2, ALB, Security Group]
date: '2025-09-19 23:32:00 +0900'
mermaid: true
---

해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/sparta-spring-plus){:target="_blank"} 에서 확인하실 수 있습니다.

## 1. EC2 인스턴스 생성
---

CI/CD 파이프라인을 구축하기 위한 실행 환경으로 **EC2 인스턴스**를 생성합니다.  
운영 서버로 사용할 것이기 때문에, 다음과 같이 환경을 구성했습니다.

### OS

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-os.png "EC2 OS"){: style="border-radius: 1rem"}

### 키페어

나중에 로컬에서 인스턴스 서버에 직접 접속하여 헬스 체크, 서버 로그 등을 확인하기 위하여 생성해줍니다.   
다운로드 받은 `.pem` 파일은 안전한 곳에 보관합니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-keypair.png "EC2 Keypair"){: style="border-radius: 1rem"}

### 보안 그룹

로드밸런서(ALB)의 보안 그룹을 생성하고 그 보안 그룹을   
인스턴스 보안 그룹에 지정해주어야 하기 때문에(ALB만 접근할 수 있도록)   
추후에 보안 그룹을 직접 생성하여 지정해줄 예정입니다.   

그러므로 지금은 따로 설정 없이 보안 그룹 생성 옵션을 선택합니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-security-group.png "EC2 Instance Security Group"){: style="border-radius: 1rem"}

### 인스턴스 개수

로드밸런서를 활용할 것이기 때문에 저는 학습을 위하여 최소 개수인 2개를 생성 해주었습니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-count.png "Number of instances"){: style="border-radius: 1rem"}

### 사용자 데이터

고급 세부 정보(Advanced details) 섹션을 펼쳐보면 최하단에 **사용자 데이터(User Data)** 입력란이 있습니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-user-data.png "EC2 User Data"){: style="border-radius: 1rem"}

사용자 데이터(User Data)는 인스턴스가 **처음 부팅될 때 실행될 스크립트**입니다.   
Auto Scaling이 인스턴스를 증설할 때도 **Launch Template의 User Data가 그대로 적용**되므로,   
공통 도구 설치를 여기에 넣어두면 신규 인스턴스도 동일 환경으로 올라옵니다.   

현재는 Auto Scaling을 적용하지 않기 때문에, 사용자 데이터 방식을 활용했습니다.

> 운영 팁: User Data로 설치하면 첫 부팅 시간이 늘어날 수 있습니다. \
> 부팅 속도/안정성이 중요하면 **커스텀 AMI**로 미리 도구를 구워두거나, \
> **SSM State Manager**로 상태를 유지하는 방식을 검토해볼 수 있습니다.
{: .prompt-tip}

```shell
#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
PATH=/usr/sbin:/usr/bin:/sbin:/bin

log() { echo "== $1"; }

log "[1/9] apt 업데이트"
apt-get update -y

log "[2/9] 필수 유틸 설치 (curl, ca-certificates, gpg, jq, unzip)"
apt-get install -y curl ca-certificates gnupg jq unzip

log "[3/9] Docker 공식 APT 리포지토리 설정"
install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
  > /etc/apt/sources.list.d/docker.list

log "[4/9] 패키지 인덱스 갱신"
apt-get update -y

log "[5/9] Docker/Compose 설치 (공식 리포에서)"
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

log "[6/9] Docker 서비스 활성화"
systemctl enable docker || true
systemctl start docker || true

log "[7/9] SSM Agent 설치/업데이트"
if ! snap list | grep -q amazon-ssm-agent; then
  snap install amazon-ssm-agent --classic
else
  snap refresh amazon-ssm-agent
fi
systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service

log "[8/9] AWS CLI v2 설치 (없을 때만)"
if ! command -v aws >/dev/null 2>&1; then
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64) PKG="awscli-exe-linux-x86_64.zip" ;;
    aarch64|arm64) PKG="awscli-exe-linux-aarch64.zip" ;;
    *) echo "Unsupported arch: $ARCH"; exit 1 ;;
  esac
  TMPDIR="$(mktemp -d)"
  cd "$TMPDIR"
  curl -sSL "https://awscli.amazonaws.com/${PKG}" -o awscliv2.zip
  unzip -q awscliv2.zip
  ./aws/install -i /usr/local/aws -b /usr/local/bin
  cd /
  rm -rf "$TMPDIR"
fi

log "[9/9] docker 그룹 권한 부여"
getent group docker >/dev/null || groupadd docker || true
for u in ubuntu ec2-user; do
  if id "$u" &>/dev/null; then usermod -aG docker "$u" || true; fi
done
U1000="$(getent passwd 1000 | cut -d: -f1 || true)"
if [ -n "${U1000:-}" ]; then usermod -aG docker "$U1000" || true; fi

log "버전 확인"
docker --version || true
docker compose version || true
aws --version || true
jq --version || true
systemctl status snap.amazon-ssm-agent.amazon-ssm-agent.service || true

log "완료: 다음 로그인부터 docker 명령에 sudo 불필요(그룹 재로그인 필요)"
```

<br>
<br>
<br>

## 2. ALB 사전 세팅
---

애플리케이션 무중단 배포와 트래픽 분산을 위해 **Application Load Balancer(ALB)** 를 구성합니다.  
Target Group에 EC2 인스턴스를 연결하고, ALB가 트래픽을 자동 분배하도록 합니다.

### 보안 그룹 생성

DNS 없이 진행하였기 때문에 HTTPS는 추가하지 않았습니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/alb-security-group.png "Application Load Balancer Security Group"){: style="border-radius: 1rem"}

### 대상 그룹 생성

Spring Boot 기본 포트인 8080 포트를 지정합니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/alb-target-group.png "Application Load Balancer Target Group"){: style="border-radius: 1rem"}

Spring Actuator의 `/actuator/health` 엔드포인트를 Health Check 경로로 지정합니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/alb-target-group2.png "Application Load Balancer Target Group"){: style="border-radius: 1rem"}

다음을 누르고 처음에 생성한 인스턴스 2개를 선택하여 연결한 뒤 대상 그룹을 생성해주면 됩니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/alb-target-group3.png "타겟 그룹에 인스턴스들을 등록"){: style="border-radius: 1rem"}

<br>
<br>
<br>

## 3. ALB 생성
---

![image]({{ site.baseurl }}/assets/img/posts/250920/alb-selection.png "Application Load Balancer 선택"){: style="border-radius: 1rem"}

### 기본 구성

![image]({{ site.baseurl }}/assets/img/posts/250920/alb-configuration.png "Application Load Balancer 기본 구성"){: style="border-radius: 1rem"}

### 네트워크 매핑

![image]({{ site.baseurl }}/assets/img/posts/250920/alb-network-mapping.png "Application Load Balancer 네트워크 매핑"){: style="border-radius: 1rem"}

### 보안 그룹 설정

사전 세팅 시 생성한 ALB 보안 그룹을 지정합니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/alb-security-group-selection.png "Application Load Balancer 보안 그룹 설정"){: style="border-radius: 1rem"}

### 리스너 설정

사전 세팅 시 생성한 Target Group을 지정합니다.

> 이미지 캡쳐 전 이미 만들어둔 로드밸런서가 있어 사용 중으로 표기됨

![image]({{ site.baseurl }}/assets/img/posts/250920/alb-listener.png "Application Load Balancer 리스너 설정"){: style="border-radius: 1rem"}

### 검토 및 생성

마지막으로 검토 섹션을 확인하고 ALB를 생성합니다.

<br>
<br>
<br>

## 4. EC2 보안 그룹 생성
---

이제 EC2 Instance에 보안 그룹을 설정하여 ALB와 내 로컬 PC에서만 접근할 수 있도록 구성을 해야합니다.

### 보안 그룹 생성

EC2 > 보안 그룹 > 보안 그룹 생성 탭으로 이동하여 다음과 같이 인바운드룰의 규칙을 추가하고 생성해줍니다.

> 로드밸런서 보안 그룹을 선택합니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-create-security-group.png "EC2 인스턴스 보안 그룹의 인바운드룰에 로드밸런서 보안 그룹 추가"){: style="border-radius: 1rem"}

> 키 페어로 로컬에서 EC2 서버에 접속하기 위한 22번 포트(SSH)를 선택합니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-create-security-group2.png "EC2 인스턴스 보안 그룹의 인바운드룰에 SSH 추가"){: style="border-radius: 1rem"}

### 보안 그룹 변경

각 인스턴스의 보안 그룹을 방금 만든 보안 그룹으로 변경해줍니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-change-security-group.png "EC2 Instance Change Security Group"){: style="border-radius: 1rem"}

### 접속 테스트

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-connect.png "EC2 SSH Connect"){: style="border-radius: 1rem"}

- `chmod 400 <키페어파일명>.pem`: 개인키 최소 읽기 권한 설정
- `ssh -i <키페어파일명>.pem <사용자명>@<퍼블릭IP>`: SSH 접속  
  사용자명과 퍼블릭IPv4는 `EC2 > 인스턴스 > 인스턴스 선택 > 연결`에서 확인할 수 있습니다.

> 다음 포스팅에서 이어집니다. [이동]({{ site.baseurl }}/posts/cicd-pipeline-3/)
{: .prompt-info}
