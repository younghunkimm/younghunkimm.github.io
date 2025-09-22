---
title: "[CI/CD] CI/CD Pipeline 구축 (5) - GitHub Actions OIDC 설정"
categories: [CI/CD]
tags: [spring, CI/CD, AWS, IAM, OIDC, GitHub Actions, Security]
date: '2025-09-22 18:31:00 +0900'
mermaid: true
---

해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/sparta-spring-plus){:target="_blank"} 에서 확인하실 수 있습니다.

## 1. OIDC를 사용하는 이유
---

시크릿 키를 직접 저장해서 사용하거나 오랫동안 유지할수록 보안상 좋지 않기 때문에  
최근에는 액세스 토큰을 직접 사용하는 대신 OIDC를 사용하는 것을 권장합니다.  

> OpenID Connect의 약자로 OAuth 2.0 기반의 인증 프로토콜입니다.

OIDC를 사용하면 긴 수명의 AWS 액세스 키를 GitHub에 저장할 필요가 없고,  
사용할 때만 유효한 짧은 수명의 액세스 토큰을 사용할 수 있기 때문에 보안상 훨씬 안전합니다.

<br><br><br>

## 2. ssm:SendCommand 정책 추가
---

GitHub Actions에서 AWS SSM Run Command를 실행하려면,  
`ssm:SendCommand` 권한이 포함된 IAM 정책이 필요합니다.

콘솔: `IAM > Policies > Create policy`

JSON 탭에서 다음 정책을 입력합니다.

```yaml
{
    "Version": "2012-10-17",                 # 정책 문서 포맷 버전(고정 값)
    "Statement": [                           # 규칙(Statement)들의 배열
    {
      "Sid": "AllowSendOnDeployDoc",       # 사람이 읽기 쉬운 규칙 ID(식별자)
      "Effect": "Allow",                   # 아래 Action을 허용(deny가 아님)
      "Action": "ssm:SendCommand",         # SSM Run Command 실행 권한
      # 허용할 리소스
      "Resource": "arn:aws:ssm:ap-northeast-2:<ACCOUNT_ID>:document/spring-plus-deploy" # 배포용 SSM Command 문서 실행 허용 (나중에 만들 예정)
    },
        {
            "Sid": "AllowSendToTaggedInstances",
            "Effect": "Allow",
            "Action": "ssm:SendCommand",
            "Resource": [
                "arn:aws:ec2:ap-northeast-2:<ACCOUNT_ID>:instance/*"                   # 이 계정·리전의 EC2 인스턴스(전체)
            ],
            "Condition": {
                "StringEquals": {
                    "ssm:resourceTag/SSMTarget": "spring-plus" # 대상 인스턴스에 태그 SSMTarget=spring-plus 가 있어야 함
                }
            }
        },
        {
            # 파이프라인에서 성공/실패 판정을 위한 읽기 권한 설정
            "Sid": "ReadBackCommandResults",      # 실행 결과를 조회하는 별도 규칙
            "Effect": "Allow",
            "Action": [                           # 명령/실행 내역·결과 조회에 필요한 읽기 권한
                "ssm:GetCommandInvocation",
                "ssm:ListCommands",
                "ssm:ListCommandInvocations"
            ],
            "Resource": "*"                       # 결과 조회는 모든 명령/대상에서 읽기 허용
        }
    ]
}
```

정책명을 입력하고 정책을 생성합니다. (e.g. `SendCommandOnlyToTaggedInstances`)

<br><br><br>

## 3. GitHub Identity Provider 추가
---

콘솔: `IAM > Identity providers > Add provider`
- Provider type: **OpenID Connect**
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com` (기본)

<span style="color: orange;">**생성된 Identity Provider ARN을 복사해둡니다.**</span>

> 한번만 생성하면 됨.
{: .prompt-info}

<br><br><br>

## 4. GitHub Actions용 IAM Role 생성
---

콘솔: `IAM > Roles > Create Role`

### Step 1. 신뢰할 수 있는 엔터티 선택

- Trusted entity type: `Custom trust policy`

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:sub": "repo:<GITHUB_USERNAME>/<GITHUB_REPO_NAME>:ref:refs/heads/main",
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                }
            }
        }
    ]
}
```

#### 설명

복사했던 Identity Provider ARN을 넣는 부분입니다.  

이 역할을 가정(assume)할 주체가 GitHub OIDC 공급자임을 지정  
즉, 해당 AWS 계정(`<ACCOUNT_ID>`)에 등록된 `token.actions.githubusercontent.com` OIDC 공급자로부터 온 토큰만 허용

```json
            "Principal": {
                "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
            }
```

<br>

GitHub OIDC 토큰으로 이 역할을 가정하는 STS 액션을 허용

```json
            "Action": "sts:AssumeRoleWithWebIdentity"
```

<br>

토큰의 audience가 `sts.amazonaws.com`과 일치해야 함을 지정

```json
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                }
            }
```

<br>

토큰의 subject가 특정 리포지토리(`repo:<GITHUB_USERNAME>/<GITHUB_REPO_NAME>`)의 `main` 브랜치 푸시 이벤트(`ref:refs/heads/main`)에서 생성된 토큰과 일치해야 함을 지정

```json
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:sub": "repo:<GITHUB_USERNAME>/<GITHUB_REPO_NAME>:ref:refs/heads/main",
                }
            }
```

### Step 2. 권한 추가

[처음에 만든 정책](#2-ssmsendcommand-정책-추가)을 검색하여 선택합니다.

![image]({{ site.baseurl }}/assets/img/posts/250922/iam-ssm-send-command-policy.png "SSM Send Command 정책 선택"){: style="border-radius: 1rem"}

### Step 3. 세부 정보

이름 및 설명을 입력하고 역할을 생성합니다.

> 생성한 역할의 ARN은 GitHub Secrets에 등록하여 GitHub Actions의 Workflows에서 사용합니다.
{: .prompt-info}

<br><br><br>

## 다음 포스팅
---

이번 포스팅에서는 **GitHub Actions OIDC 설정** 과정을 정리했습니다.  
다음 포스팅에서는 **SSM Document 작성 & 활용** 과정을 다룹니다.
