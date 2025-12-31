# 📚 Firebase & Cloud Functions 학습 정리

## 1. Firebase 개요
### 🔹 개념
* **BaaS (Backend as a Service)**: 백엔드 기능을 서비스 형태로 제공
* 기존의 복잡한 서버 구축(AWS, Spring, MySQL 등) 없이 **Firebase만으로 API 서비스 구현 가능**
* **주요 기능**: 인증(Auth), 파일 업로드(Storage), 데이터베이스(DB), 커스텀 함수(Functions) 등

### 🔹 Firestore (Cloud Firestore)
* **NoSQL 기반**: 비관계형 데이터베이스
* **특징**:
    * 스키마 변동이 자유로움 (유연한 데이터 구조)
    * **용도**: 채팅, 로그 저장, IoT 센서 데이터 수집 등에 매우 적합
* **관리 콘솔**: [Firebase Console](https://console.firebase.google.com/?hl=ko)

---

## 2. 프로젝트 설정 및 SDK 연동

### 🛠️ 초기 설정 (Web)
1.  **Firebase Console**: 프로젝트 생성
2.  **VSCode**: 프로젝트 폴더 생성 및 파일 구성
    * `index.html`: 메인 페이지
    * `firebase.js`: Firebase 설정 및 초기화 코드

### 💻 코드 구성 (`firebase.js`)
* **SDK 설정**: Firebase 버전 `11.7.3` 기준
* **firebaseConfig**: 콘솔에서 발급받은 구성 객체 입력
* **DB 객체 초기화**: CRUD 작업을 위한 Firestore 인스턴스 생성

### 📡 데이터 읽기/쓰기 (DOM 조작)
* **실시간 데이터 동기화 (`onSnapshot`)**
    ```javascript
    import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

    // 쿼리 생성: 특정 컬렉션 선택 및 정렬
    const q = query(collection(db, "컬렉션이름"), orderBy("필드명"));

    // 실시간 리스너 (새로고침 없이 데이터 갱신)
    onSnapshot(q, (snapshot) => {
        // 데이터 변경 시 콜백 함수 실행
    });
    ```
* **데이터 추가**: `addEventListener`를 활용하여 클릭 이벤트 발생 시 온도/습도 값을 Firestore 문서로 추가

---

## 3. Cloud Functions (Serverless)

### ☁️ 개념
* **Serverless Platform**: 별도의 서버 구축 없이 백엔드 로직 수행
* **트리거(Trigger) 방식**: 특정 이벤트 발생 시 함수 자동 실행
    * HTTP 요청, DB 문서 생성/수정/삭제, 파일 업로드 등
* **기반 환경**: Node.js (실습 버전: `v22.19.0 LTS`)

### ⚡️ 활용 예시 (IoT 데이터 처리)
* **중간 처리(Intercept)**: 센서가 DB에 데이터를 업로드(`sensor_logs`)하는 시점을 감지하여 로직 수행
* **이상 감지 시나리오**:
    * 데이터: 온도 90도, 습도 100% 등 이상 수치 입력
    * 동작: 이메일 전송, 에러 로그 기록, 특정 필드(`abnormal: true`) 추가 등

---

## 4. Cloud Functions 개발 환경 구축

### 📦 설치 및 설정
1.  **Node.js 설치**: 설치 후 터미널에서 버전 확인
    ```bash
    node -v
    npm -v
    ```
2.  **Firebase Tools 설치** (Global)
    ```bash
    npm install -g firebase-tools
    # 설치 후 터미널 재시작 권장
    firebase --version
    ```
3.  **로그인 및 초기화**
    ```bash
    firebase login  # 로그인 (이미 되어있다면 firebase logout 후 재로그인)
    firebase init functions
    ```
    * *Existing project* 선택
    * *Javascript* 선택
    * *EsLint* → **No**
    * *npm install now* → **Yes**

---

## 5. Functions 개발 및 배포

### 📝 코드 작성 (`functions/index.js`)
* **초기화**: 기존 예제 코드 삭제 후 로직 작성
* **트리거 함수**: `onDocumentCreated` (문서 생성 시 실행)
* **로깅**: `logger`를 사용하여 Firebase Console 내 로그 기록 (console.log 대신 사용)

### 🚀 배포 (Deploy)
```bash
# functions 폴더가 아닌 프로젝트 루트 경로에서 실행
firebase deploy --only functions

// 예시 로직 개념
exports.detectAbnormal = onDocumentCreated("sensor_logs/{docId}", (event) => {
    const data = event.data.data();
    if (data.temperature > 40) {
        logger.log("이상 고온 감지!", data);
        // 여기에 abnormal 필드 업데이트 로직 추가
    }
});