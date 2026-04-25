---
title: "[Redis] Redis 멱등성 락으로 중복 알림 방지"
categories: [Redis, Redis/Trouble Shooting]
tags: [spring, 트러블슈팅, Trouble Shooting, TTL, Redis, 멱등성, Idempotence, FCM, 알림]
date: '2025-11-17 19:19:00 +0900'
---

최종 프로젝트를 진행하면서 겪은 트러블슈팅의 과정들에 대한 기록입니다.   
해당 프로젝트의 전체소스는 [여기](https://github.com/CouponPop){:target="_blank"} 에서 확인하실 수 있습니다.

## 트러블슈팅

---

### ⭐️ 주제

Redis 기반 멱등성 락을 이용해 FCM 알림 중복 발송 문제를 해결한 과정

### 🔥 발생

FCM 알림이 특정 상황에서 **중복 발송**되는 문제가 발생했다.  
재시도 로직이 개입되거나 동일 이벤트가 여러 번 발행되면 같은 알림이 여러 번 사용자에게 전달됐다.

### 🔍 원인

문제의 핵심은 각 알림 이벤트를 고유하게 식별할 수 있는 값이 없다는 점이었다.

- 발행 측에서 알림마다 고유한 식별자를 생성하지 않음
- 수신 측에서는 `incoming` 이벤트가 중복인지 확인할 방법이 없음
- 결국 재시도나 중복 발행이 모두 **중복 알림 발송**으로 이어짐

### ✅ 해결

#### 1️⃣ 이벤트 발행 측에 고유 ID 생성 로직 추가

알림을 식별할 수 있도록 "고유한 조합값 → `UUID` 변환 → `traceId`" 로 사용

```java
String traceId = NotificationTraceIdGenerator
            .generate(item.aggregatedAt(), memberId, token, topDong, topHour);

CouponUsageStatsFcmSendMessage couponUsageStatsFcmSendMessage =
        CouponUsageStatsFcmSendMessage.of(traceId, memberId, token, topDong, topHour, activeEventCount);

couponUsageStatsFcmSendPublisher.publish(couponUsageStatsFcmSendMessage);
```

- 동일한 입력 조합 → 항상 동일 UUID
- 이벤트 객체에 `traceId` 포함 후 발행

#### 2️⃣ 이벤트 수신 측에 Redis 멱등성 락 적용

알림 처리 여부를 `Redis SET NX` 로 판단

```java
public boolean acquireProcessingKey(String traceId) {

    String key = KEY_PATTERN.formatted(traceId);
    // 키가 없을 때만 설정 (멱등성 보장)
    Boolean success = stringRedisTemplate.opsForValue().setIfAbsent(key, PROCESSING_VALUE, PROCESSION_TTL);

    return Boolean.TRUE.equals(success);
}
```

- 존재하는 `traceId` → `false` → 즉시 종료
- 존재하지 않는 `traceId` → `true` → 알림 발송 진행

#### 3️⃣ 정상 발송 시 TTL 연장

최근 7일간은 중복 발송을 확실하게 차단

```java
public void markAsDone(String traceId) {

    String key = KEY_PATTERN.formatted(traceId);
    stringRedisTemplate.opsForValue().set(key, DONE_VALUE, DONE_TTL);
}
```

#### 4️⃣ 실패 시 제거

재시도 가능하도록 즉시 삭제

```java
public void release(String traceId) {

    stringRedisTemplate.delete(KEY_PATTERN.formatted(traceId));
}
```

### 💡 결론

Redis 기반 멱등성 락을 적용해 중복 발송 이슈를 안정적으로 해결했다.  

정리하면

1. **`traceId` 생성**: 유니크 조합 + UUID
2. **중복 감지**: Redis `SET NX`
3. **정상 처리**: TTL 7일로 연장
4. **실패 처리**: 키 삭제로 재시도 보장

유지 비용이 낮고 확장성도 좋기 때문에, 이벤트 기반 알림 시스템에서 **단순하고 효과적으로 멱등성 락을 적용**시킬 수 있었다.
