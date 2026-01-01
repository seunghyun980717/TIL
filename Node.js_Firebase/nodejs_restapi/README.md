Node.js & REST API 학습 요약

1. Express.js (Node.js 웹 프레임워크)

정의: Node.js 환경에서 웹 서버를 구축할 때 사용하는 대표적인 웹 프레임워크입니다.

가볍고 유연하게 웹 애플리케이션을 구성할 수 있습니다.

2. NPM (Node Package Manager) 설정

패키지 생성 및 설치

초기화: package.json 파일을 생성합니다.

$ npm init


주요 모듈 설치: Express, 로깅(morgan), DB드라이버(mysql2) 등을 설치합니다.

$ npm i express morgan mysql2


주요 개념

dependencies: 현재 패키지가 의존하고 있는 외부 패키지 목록입니다.

package.json: 프로젝트의 요약 명세서 (버전, 스크립트, 의존성 요약).

package-lock.json: 프로젝트의 상세 명세서 (설치된 패키지의 정확한 버전 트리 및 의존성).

node_modules: 실제 설치된 라이브러리 파일들이 저장되는 폴더입니다.

3. 개발 편의 도구 (Nodemon)

역할: 서버 코드가 수정될 때마다 수동으로 재부팅해야 하는 번거로움을 해결합니다. 코드가 저장되면 자동으로 서버를 재시작해줍니다.

설치 (전역 설치)

$ npm i -g nodemon


실행

$ nodemon index.js


4. 데이터베이스 (MySQL)

연동 과정

MySQL 데이터베이스(워크벤치 등)에서 스키마(Schema) 생성.

Node.js 프로젝트에서 mysql2 모듈을 사용하여 해당 스키마와 연동.

5. REST API

정의: REpresentational State Transfer. 자원(Resource)의 표현(Representation)에 의한 상태 전달을 의미합니다.

RESTful API: REST 아키텍처의 제약 조건과 규칙을 잘 지켜서 설계된 API를 의미합니다.

HTTP Method

자원에 대한 행위를 명시합니다.

GET: 조회

POST: 생성

PUT: 전체 수정

PATCH: 일부 수정

DELETE: 삭제

6. HTTP Response Status Code (상태 코드)

클라이언트의 요청에 대한 서버의 응답 상태를 나타내는 3자리 숫자입니다.

범위

의미

상세 설명 및 주요 코드

100번대

정보 (Information)

요청을 받았으며 프로세스를 계속 진행 중인 상태



- 100: Continue (요청 후 대기 중)

200번대

성공 (Success)

요청을 성공적으로 받았으며 인식했고 처리한 상태



- 200: OK (요청 성공)



- 201: Created (리소스 생성 완료)

300번대

리다이렉션 (Redirection)

요청 완료를 위해 추가 동작이 필요한 상태



- 301: Moved Permanently (새 위치로 영구 이동)



- 302: Found (임시 이동)

400번대

클라이언트 오류 (Client Error)

클라이언트의 잘못된 요청으로 인한 오류 (보통 내 잘못)



- 400: Bad Request (잘못된 요청)



- 401: Unauthorized (권한 없음/인증 필요)



- 404: Not Found (요청한 자원을 찾을 수 없음)

500번대

서버 오류 (Server Error)

서버 측에서 처리를 못 한 경우 (보통 서버 잘못)



- 500: Internal Server Error (내부 서버 오류)



- 503: Service Unavailable (서버 과부하/점검으로 사용 불가)



- 504: Gateway Timeout (시간 초과)