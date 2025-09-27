---
title: "[Spring] AWS S3 Presigned URL 활용한 파일 업로드/다운로드 (2) - Spring Boot Presigned URL 설정"
categories: [AWS, AWS/S3]
tags: [spring, spring boot, AWS, S3, Presigned URL, File Upload, File Download]
date: '2025-09-26 22:59:00 +0900'
mermaid: true
---

해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/sparta-spring-plus){:target="_blank"} 에서 확인하실 수 있습니다.

> 해당 포스팅에서는 유저 프로필 이미지 업로드/다운로드를 예시로 진행합니다.
{: .prompt-tip}

## Spring Boot Presigned URL 설정
---

> Spring Boot 3.3.3 버전을 기준으로 작성되었습니다.  
> 의존성 버전은 [Spring Cloud AWS GitHub Link](https://github.com/awspring/spring-cloud-aws)에서 확인할 수 있습니다.
{: .prompt-info}

### 의존성 추가 및 환경변수 설정

#### build.gradle

```groovy
dependencies {
    // Spring Cloud AWS
    implementation platform("io.awspring.cloud:spring-cloud-aws-dependencies:3.2.1") // BOM
    implementation "io.awspring.cloud:spring-cloud-aws-starter-s3"
}
```

#### application.yml

> `S3AutoConfiguration`이 자동으로 `Bean`으로 등록되고,  
> 해당 환경 변수들을 기반으로 `S3Client` 및 `S3Presigner`가 생성되기 때문에  
> **정확한 경로의 환경 변수 설정이 중요**합니다.
{: .prompt-info}

```yaml
# 공통
spring:
  cloud:
    aws:
      region:
        static: ap-northeast-2
      s3:
        bucket: <YOUR_BUCKET_NAME>
```

```yaml
# application-local.yml
storage:
  prefix: local
```

```yaml
# application-prod.yml
storage:
  prefix: prod
```

<br>

### Presigned URL 기능 구현

#### FileDomain

클라이언트 요청 데이터 중 `FileDomain` 타입을 받는데,  
`S3 Bucket` 경로를 제한하기 위해 `ENUM`으로 정의했습니다.  

로컬 기준 `/local/profile/*` 경로에서 `profile`에 해당하는 부분입니다.

```java
public enum FileDomain {
    PROFILE;

    public String getDirectory() {
        return this.name().toLowerCase();
    }
}
```

#### Request DTO

업로드용 Request DTO

```java
@Getter
@NoArgsConstructor
public class PresignedPutUrlRequest {

    private FileDomain domain; // 파일 도메인 경로
    private String filename; // 파일명
}
```

다운로드용 Request DTO

```java
@Getter
@NoArgsConstructor
public class PresignedGetUrlRequest {

    private String fileKey; // 파일 전체 경로
}
```

#### Response DTO

업로드용 Response DTO

```java
@Getter
@Builder
public class PresignedPutUrlResponse {

    private final String fileKey; // 파일 전체 경로
    private final String presignedUrl; // Presigned URL
}
```

다운로드용 Response DTO

```java
@Getter
@Builder
public class PresignedGetUrlResponse {

    private final String fileKey; // 파일 전체 경로
    private final String presignedUrl; // Presigned URL
}
```

#### Controller

Presigned URL을 발급해 줄 API 엔드포인트를 생성합니다.

```java
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/presigned/upload")
    public PresignedPutUrlResponse createPresignedPutUrl(
        @AuthenticationPrincipal AuthUser authUser,
        @RequestBody PresignedPutUrlRequest request
    ) {

        return fileService.createPresignedPutUrl(
            authUser,
            request.getDomain(),
            request.getFilename()
        );
    }

    @PostMapping("/presigned/download")
    public PresignedGetUrlResponse createPresignedGetUrl(
        @RequestBody PresignedGetUrlRequest request
    ) {

        return fileService.createPresignedGetUrl(request.getFileKey());
    }
}
```

#### Service

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${storage.prefix}")
    private String prefix;

    // === 업로드용 Start ===
    public PresignedPutUrlResponse createPresignedPutUrl(
        AuthUser authUser,
        FileDomain domain,
        String fileName
    ) {

        String fileKey = String.format("%s/%s/%d/%s/%s",
            prefix, // `local` or `prod`
            domain.getDirectory(), // FileDomain
            authUser.getId(), // 로그인된 유저의 id
            UUID.randomUUID(), // 충돌 방지 및 보안성 강화
            fileName // 파일명
        );

        String presignedUrl = generatePresignedPutUrl(fileKey);

        return PresignedPutUrlResponse.builder()
            .presignedUrl(presignedUrl)
            .fileKey(fileKey)
            .build();
    }

    private String generatePresignedPutUrl(String fileKey) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(bucket)
            .key(fileKey)
            .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(10)) // Presigned URL 유효기간
            .putObjectRequest(putObjectRequest) // 요청 정보 (Put)
            .build();

        // AWS 서버에 요청하여 지정 경로(fileKey)에 대한 Presigned URL 생성
        return s3Presigner.presignPutObject(presignRequest).url().toString();
    }
    // === 업로드용 End ===

    // === 다운로드용 Start ===
    public PresignedGetUrlResponse createPresignedGetUrl(String fileKey) {

        String presignedUrl = generatePresignedGetUrl(fileKey);

        return PresignedGetUrlResponse.builder()
            .presignedUrl(presignedUrl)
            .fileKey(fileKey)
            .build();
    }

    // 재사용을 위한 public 메서드
    public String getPresignedUrl(String fileKey) {
        return generatePresignedGetUrl(fileKey);
    }

    private String generatePresignedGetUrl(String fileKey) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
            .bucket(bucket)
            .key(fileKey)
            .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(10))
            .getObjectRequest(getObjectRequest)
            .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }
    // === 다운로드용 End ===

    // === 삭제용 Start ===
    public void deleteFile(String fileKey) {

        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
            .bucket(bucket)
            .key(fileKey)
            .build();

        // 삭제에 성공/실패에 대한 로그를 남기고, 예외를 전파하여 트랜잭션 롤백 처리
        try {
            s3Client.deleteObject(deleteObjectRequest);
            log.info("Successfully deleted file from S3: {}", fileKey);
        } catch (SdkException e) {
            log.error("Failed to delete file from S3. fileKey: {}", fileKey, e);
            throw e;
        }
    }
    // === 삭제용 End ===
}
```

#### fileKey 구조

`{prefix}/{domain}/{userId}/{uuid}/{filename}`

- `prefix`: `local` or `prod` (환경별 구분)
- `domain`: `FileDomain` enum 값 (e.g. `profile`)
- `userId`: 로그인된 유저의 고유 id
- `uuid`: 고유 식별자 (충돌 방지 및 보안성 강화)
- `filename`: 실제 파일명

<br>

### 업로드/다운로드 테스트

Postman을 사용하여 업로드/다운로드 API를 테스트합니다.

#### 업로드 테스트

##### Presigned URL 발급 요청

![Image]({{ site.baseurl }}/assets/img/posts/250926/postman-presigned-put-url-request.png "Postman Presigned PUT URL Request"){:style="border-radius: 1rem"}

##### S3에 직접 파일 업로드

![Image]({{ site.baseurl }}/assets/img/posts/250926/postman-presigned-put-url-upload.png "Postman Presigned PUT URL Upload"){:style="border-radius: 1rem"}

##### S3 콘솔에서 업로드된 파일 확인

![Image]({{ site.baseurl }}/assets/img/posts/250926/s3-bucket-uploaded-file.png "S3 Bucket 업로드된 파일 확인"){:style="border-radius: 1rem"}

##### 지정한 시간(10분) 후 `Access Denied` 응답 확인

![Image]({{ site.baseurl }}/assets/img/posts/250926/postman-presigned-put-url-expired.png "Postman Presigned PUT URL Expired"){:style="border-radius: 1rem"}

#### 다운로드 테스트

##### Presigned URL 발급 요청

![Image]({{ site.baseurl }}/assets/img/posts/250926/postman-presigned-get-url-request.png "Postman Presigned GET URL Request"){:style="border-radius: 1rem"}

##### URL을 통해 접속

![Image]({{ site.baseurl }}/assets/img/posts/250926/postman-presigned-get-url-access.png "Postman Presigned GET URL Access"){:style="border-radius: 1rem"}

##### 지정한 시간(10분) 후 `Access Denied` 응답 확인

![Image]({{ site.baseurl }}/assets/img/posts/250926/postman-presigned-get-url-expired.png "Postman Presigned GET URL Expired"){:style="border-radius: 1rem"}

## 다음 포스팅
---

이번 포스팅에서는 **Spring Boot Presigned URL 설정** 과정을 정리했습니다.  
다음 포스팅에서는 **Spring Boot 유저 프로필 이미지** 과정을 다룹니다.
