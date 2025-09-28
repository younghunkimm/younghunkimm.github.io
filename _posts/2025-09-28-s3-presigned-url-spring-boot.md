---
title: "[Spring] AWS S3 Presigned URL 활용한 파일 업로드/다운로드 (3) - Spring Boot 유저 프로필 이미지"
categories: [AWS, AWS/S3]
tags: [spring, spring boot, AWS, S3, Presigned URL, File Upload, File Download]
date: '2025-09-28 17:50:00 +0900'
mermaid: true
---

해당 프로젝트의 전체소스는 [여기](https://github.com/younghunkimm/sparta-spring-plus){:target="_blank"} 에서 확인하실 수 있습니다.

> 해당 포스팅에서는 유저 프로필 이미지 업로드/다운로드를 예시로 진행합니다.
{: .prompt-tip}

## 유저 프로필 이미지 업로드/다운로드
---

### 유저 도메인

#### User Entity

`profileImageUrl` 필드를 추가하고 `setter` 메서드를 정의합니다.

```java
@Getter
@Entity
@NoArgsConstructor
@Table(name = "users")
public class User extends Timestamped {

    // ...
    
    private String profileImageUrl;
    
    // ...
    
    public void updateProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
}
```

#### User Dto

##### Patch Request

`AWS S3 Bucket` 경로의 요청 데이터인 `fileKey` 필드를 추가합니다.

```java
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateProfileImageRequest {

    private String fileKey;
}
```

##### Get Response

`Presigned URL`을 반환할 `profileImageUrl` 필드를 추가합니다.

```java
@Getter
@Builder
public class UserGetProfileImageResponse {

    private final String profileImageUrl;

    public UserGetProfileImageResponse(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
}
```

#### User Controller

- `Patch`: 클라이언트가 보낸 프로필 이미지의 `fileKey` 값을 DB에 저장할 `updateProfileImage` 메서드를 추가합니다.
- `Get`: 로그인 된 유저의 ID 값을 사용해 프로필 이미지의 `Presigned URL`을 반환할 `getProfileImage` 메서드를 추가합니다.

```java
@RestController
@RequiredArgsConstructor
public class UserController {

    // ...
    
    private final UserService userService;

    // ...

    @PatchMapping("/users/profile")
    public void updateProfileImage(
        @AuthenticationPrincipal AuthUser authUser,
        @RequestBody UserUpdateProfileImageRequest request
    ) {

        userService.updateProfileImage(authUser.getId(), request.getFileKey());
    }

    @GetMapping("/users/profile")
    public ResponseEntity<UserGetProfileImageResponse> getProfileImage(
        @AuthenticationPrincipal AuthUser authUser
    ) {

        return ResponseEntity.ok(userService.getProfileImage(authUser.getId()));
    }
}
```

#### User Service

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    // ...
    
    private final FileService fileService;

    // ...

    @Transactional
    public void updateProfileImage(
        long userId,
        String fileKey
    ) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new InvalidRequestException("User not found"));

        String oldFileKey = user.getProfileImageUrl();

        user.updateProfileImageUrl(fileKey);
        userRepository.flush();

        // 데이터 정합성을 위해 DB에 먼저 반영 후 기존 파일을 삭제한다.
        if (StringUtils.hasText(oldFileKey)) {
            fileService.deleteFile(oldFileKey);
        }
    }

    public UserGetProfileImageResponse getProfileImage(
        long userId
    ) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new InvalidRequestException("User not found"));

        // 프로필 이미지가 없을 수도 있으므로 null 처리
        String presignedUrl = null;

        // 프로필 이미지가 있다면 Presigned URL 발급
        if (StringUtils.hasText(user.getProfileImageUrl())) {
            presignedUrl = fileService.getPresignedUrl(user.getProfileImageUrl());
        }

        return UserGetProfileImageResponse.builder()
            .profileImageUrl(presignedUrl)
            .build();
    }
}
```

<br><br><br>

## 트러블 슈팅
---

### 고아 파일 문제

`Presigned URL`을 사용해 파일을 미리 업로드(`Pre-upload`)하도록 구현하니,   
사용자가 파일을 올려놓고 최종 '저장'을 누르지 않고 페이지를 이탈하는 경우,   
S3에는 주인 없는 **고아 파일(Orphaned File)**이 쌓이는 문제가 발생할 수 있다고 생각했습니다.  

이를 해결하기 위해 다음과 같은 방법을 고려해볼 수 있었습니다.

1. **임시 경로 도입**  
   파일을 영구적인 경로가 아닌, `uploads/temp/`와 같은 임시 경로에 업로드합니다.
2. **파일 이동 로직**  
   사용자가 최종 '저장'을 하면, 서버는 이 임시 파일을 영구적인 경로로 이동시키고 DB에 경로를 저장합니다.
3. **정기적인 정리 작업**  
   주기적으로 임시 경로를 스캔하여 일정 기간(24시간) 이상 사용되지 않은 파일을 삭제하는 배치 작업을 설정합니다.

<br><br><br>

## 회고
---

### 복잡성 속에 숨겨진 서버와 사용자 경험 최적화

처음 구조를 접했을 때는 관리나 설정할 요소들이 너무 많다고 느껴져 괜히 더 복잡해진 게 아닌가 싶었습니다.   
"이렇게까지 해서 Presigned URL을 쓰는 게 맞을까?"라는 의문도 잠깐 들었습니다.   

사실 핵심은 서버가 어떤 일을 하느냐 그리고 제일 중요한 사용자 경험에 있었습니다.   

겉으로 보기에는 구조가 복잡해졌지만,   
서버 부하를 최소화해서 사용자가 '저장' 버튼을 누른 순간을 **최대한 가볍고 빠르게 만드는 설계**였습니다.   

이런 복잡한 구조 뒤에는 사용자가 느낄 작은 차이를 위해 설계자들이 얼마나 노력했을지 알 수 있는 경험이었습니다.
