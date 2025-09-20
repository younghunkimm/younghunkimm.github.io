---
title: "[CI/CD] CI/CD Pipeline 구축 (3) - AWS 인프라 세팅 (IAM & Parameter Store)"
categories: [CI/CD]
tags: [spring, CI/CD, AWS, IAM, EC2, SSM, Parameter Store]
date: '2025-09-20 19:22:00 +0900'
mermaid: true
---

해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/sparta-spring-plus){:target="_blank"} 에서 확인하실 수 있습니다.

## 5. IAM Role & Policy 설계
---

EC2 인스턴스가 SSM을 통해 원격 명령을 받으려면, 인스턴스에 **적절한 IAM Role**을 부여해야 합니다.

- **EC2 Role (Instance Profile)**  
  - `AmazonSSMManagedInstanceCore` (SSM 접속 기본 권한)  
  - `s3:GetObject`, `s3:PutObject` (S3 접근용)  
  - `ssm:GetParameter` (Parameter Store 읽기) 

- **GitHub Actions OIDC Role**  
  - GitHub OIDC Provider와 Trust 관계 설정  
  - Docker Hub 푸시, `aws ssm send-command` 실행에 필요한 최소 권한 부여 

### EC2 Role 생성

EC2에 부여할 역할(Role)을 생성합니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-iam-role.png "EC2 IAM Role 생성"){: style="border-radius: 1rem"}

### SSM 권한 정책 추가

`AmazonSSMManagedInstanceCore` 관리형 정책을 추가합니다.

> 이 정책은 SSM Agent가 SSM 서비스와 통신하는 데 필요한 최소 권한을 제공합니다. \
> SSM Agent가 설치되어 있어야 하며, EC2 인스턴스 생성 시 사용자 데이터에 SSM Agent 설치 스크립트를 포함시켰습니다.
{: .prompt-tip}

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-iam-role2.png "EC2 IAM Role 권한 추가"){: style="border-radius: 1rem"}

이름을 입력하고 역할을 생성합니다.

### S3 권한 인라인 정책 추가

EC2 인스턴스에서 S3 버킷에 접근할 수 있도록 정책을 추가하였습니다.   
최소 권한 원칙에 따라, 필요한 작업과 리소스만 허용합니다.   

1. 생성한 역할을 선택하고, **권한 추가 > 인라인 정책 생성**을 클릭합니다.
2. JSON 탭에서 다음 정책을 입력합니다.

```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject", # S3 Bucket 읽기 권한
                "s3:PutObject", # S3 Bucket 쓰기 권한
                "s3:DeleteObject" # S3 Bucket 삭제 권한
            ],
            "Resource": [
                "arn:aws:s3:::<버킷명>/prod/profile/*"
            ]
        }
    ]
}
```

### 운영서버와 로컬서버 자격증명 차이 설명

해당 내용에 대해선 따로 포스팅하여 다루었으니, [여기]({{ site.baseurl }}/posts/spring-boot-s3-presigned-url/){:target="_blank"}를 참고해주세요.   
이번 포스팅에서는 간단한 설명만 추가합니다.

#### 운영서버

운영서버에서 S3에 접근할 때는 `prod` 폴더를 사용합니다.   
이후 `profile`이 아닌 `post` 폴더 권한도 열어주고 싶다면   
`Resource`에 `arn:aws:s3:::<버킷명>/prod/post/*` 도 추가해주면 됩니다.   

EC2 Role 정책에 S3 권한 정책을 설정해주면, EC2 인스턴스에서 IMDS를 통해   
역할(Role) 정보를 받아 S3에 접근할 수 있습니다.   

즉, EC2 인스턴스에서 S3 버킷에 접근할 때는 별도의 Access Key 및 Secret Key 없이도   
역할(Role) 기반으로 권한이 부여되기 때문에 환경변수로 관리할 필요가 없어 보안에 유리합니다.

#### 로컬서버

로컬서버에서 S3에 접근할 때는 `local` 폴더를 사용합니다.   

로컬 개발 환경에서는 EC2 Role이 적용되지 않기 때문에,
`.env.local` 파일에 S3 `Access Key`와 `Secret Key`를 환경변수로 설정하여 S3에 접근합니다.   

`Access Key`와 `Secret Key`는 S3 버킷 정책에서 `local` 폴더에 대한 접근 권한이 있는 IAM User로 발급받아야 합니다.

```shell
AWS_ACCESS_KEY_ID=<Access Key>
AWS_SECRET_ACCESS_KEY=<Secret Key>
```

### SSM Parameter Store 권한 인라인 정책 추가

EC2 인스턴스에서 SSM Parameter Store에 저장된 환경 변수를 읽어올 수 있도록 정책을 추가합니다.   
로컬 개발 환경에서는 `.env.local` 파일에 직접 환경변수를 설정하여 사용합니다.   

추가하는 방법은 앞서 S3 권한 정책 추가와 동일합니다.   

```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter", # 단일 파라미터 읽기 권한
                "ssm:GetParameters", # 다중 파라미터 읽기 권한
                "ssm:GetParametersByPath" # 경로 기반 파라미터 읽기 권한
            ],
            "Resource": "arn:aws:ssm:ap-northeast-2:<ACCOUNT_ID>:parameter/spring-plus/prod/*"
        }
    ]
}
```

`spring-plus/prod/*`: 해당 경로에 있는 모든 파라미터를 읽을 수 있도록 허용합니다.

<br>
<br>
<br>

## 6. SSM Parameter Store 환경 변수 관리
---

### Parameter 생성

콘솔: `AWS > AWS Systems Manager > Parameter Store`

DB 접속 정보, JWT 시크릿 키, 버킷 이름 등 민감한 값을 **Parameter Store**에 저장합니다.  
이 값은 EC2 인스턴스와 GitHub Actions에서 모두 읽어옵니다.

- Path 예시:
  ```
  /spring-plus/prod/DB_URL
  /spring-plus/prod/DB_USERNAME
  /spring-plus/prod/DB_PASSWORD
  ```

보안 강화를 위해 비밀번호나 키는 **SecureString** 타입을 사용했습니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ssm-parameter-store-form.png "SSM Parameter Store 생성"){: style="border-radius: 1rem"}

- `/github/spring-plus/*`: GitHub Actions CI용 파라미터
- `/spring-plus/prod/*`: 운영서버 CD용 파라미터

![image]({{ site.baseurl }}/assets/img/posts/250920/ssm-parameter-store-list.png "SSM Parameter Store 목록"){: style="border-radius: 1rem"}

### EC2 인스턴스에 SSH로 접속하여 값 조회해보기

![image]({{ site.baseurl }}/assets/img/posts/250920/ssm-parameter-store-get.png "SSH 접속하여 Parameter 조회"){: style="border-radius: 1rem"}

<br>
<br>
<br>

## 7. EC2 인스턴스 태깅
---

태그를 사용하면 인스턴스 ID를 따로 관리할 필요가 없어 유연한 관리가 가능합니다.   
해당 태그가 붙은 인스턴스들에 일괄 배포가 가능해집니다.

- Key: `SSMTarget`
- Value: `spring-plus`

이후 CD 과정에서 `ssm:resourceTag/SSMTarget = spring-plus` 조건으로 인스턴스를 선택하게 됩니다.

![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-instance-tagging.png "인스턴스에 태그를 생성"){: style="border-radius: 1rem"}
![image]({{ site.baseurl }}/assets/img/posts/250920/ec2-instance-tagging2.png "인스턴스에 태그를 생성"){: style="border-radius: 1rem"}

<br>
<br>
<br>

## 다음 포스팅
---

이번 포스팅에서는 **AWS 인프라 세팅** 과정을 정리했습니다.  
다음 포스팅에서는 **Docker 빌드 & 레지스트리** 과정을 다룹니다.
