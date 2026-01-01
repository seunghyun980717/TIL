# ☁️ 네트워크 기초 & AWS EC2 실습 정리

## 1. 네트워크 기초 이론

### 🔹 클라이언트(Client) & 서버(Server)
* **Client**: 요청(Request)을 보내는 주체 (예: 웹 브라우저)
* **Server**: 요청에 대한 응답(Response)을 제공하는 주체 (데이터 보관, 가공 후 전달)

### 🔹 IP와 Port
* **IP (Internet Protocol)**: 인터넷상에서 컴퓨터끼리 통신하기 위한 주소 규칙
* **IP의 한계**:
    * **비연결성**: 받을 대상이 없거나 서비스 불능 상태여도 패킷을 그냥 전송함.
    * **비신뢰성**: 전송 중 패킷이 사라지거나, 순서가 뒤바뀔 수 있음.
    * **구분 불가**: 하나의 IP에서 여러 애플리케이션을 사용할 때 구분이 안 됨.

### 🔹 TCP/IP
* IP의 한계를 보완하기 위한 프로토콜.
* **출발지 PORT, 목적지 PORT, 전송 제어 순서, 검증 정보**를 포함하여 신뢰성 있는 전송을 보장.

---

## 2. AWS EC2 (Elastic Compute Cloud) 구축

### 🔹 EC2 개요
* **EC2**: AWS에서 제공하는 가상 컴퓨터 서비스.
* **인스턴스(Instance)**: 가상 컴퓨터 1대를 지칭하는 단위.

### 🔹 인스턴스 생성 설정 (Ubuntu 22.04 LTS)
1.  **AMI**: Ubuntu Server 22.04 LTS 선택
2.  **인스턴스 유형**: `t3.micro` (프리티어 가능)
3.  **키 페어**: `.pem` 파일 생성 및 다운로드 (보안 중요)
4.  **스토리지**: 30GiB (프리티어 최대)
5.  **보안 그룹(인바운드 규칙) 설정**:
    * `SSH` (22): 내 IP 혹은 Anywhere (보안 주의)
    * `사용자 지정 TCP` (8080): 웹 서비스용
    * `HTTP` (80): 웹 브라우저 접속용
    * `MYSQL / Aurora` (3306): DB 접속용
    * `모든 ICMP - IPv4`: Ping 테스트용

---

## 3. 리눅스(Linux) & MobaXterm 접속

### 🔹 MobaXterm 접속 설정
* **Session** → **SSH**
* **Remote host**: AWS 인스턴스의 퍼블릭 IPv4 주소
* **Specify username**: `ubuntu`
* **Use private key**: 다운로드 받은 `.pem` 파일 선택

### 🔹 필수 리눅스 명령어
| 명령어 | 설명 |
| :--- | :--- |
| `ls` | 현재 디렉토리의 파일 목록 보기 |
| `ls -al` | 숨김 파일(.으로 시작)을 포함한 상세 리스트 보기 |
| `pwd` | 현재 경로(디렉토리) 확인 |
| `clear` | 터미널 화면 지우기 |
| `cd ~` | 홈 디렉토리로 이동 |
| `mv [파일] [경로]` | 파일 이동 |
| `mv [파일] [새이름]` | 파일 이름 변경 |
| `cp [파일] [경로]` | 파일 복사 |
| `cp -r [폴더] [경로]` | 디렉토리(폴더) 통째로 복사 |
| `Ctrl + Insert` | 복사 (Windows 공통) |
| `Shift + Insert` | 붙여넣기 (Windows 공통) |

---

## 4. 사용자 계정 및 권한 설정 (Sudo)

> ⚠️ AWS 인증 이슈로 실습 불가 시, 키 파일 없이 아이디/비밀번호로 로그인 가능하도록 설정하는 과정입니다.

### 🔹 새 유저 생성 및 권한 부여
```bash
# 1. 새 유저(ssafy) 생성 (비밀번호 설정 포함)
sudo adduser ssafy

# 2. sudo 권한 설정 파일 열기
sudo visudo

visudo 편집기 내용 추가:

ssafy ALL=NOPASSWD: ALL 입력

(ssafy 유저는 비밀번호 없이 모든 관리자 명령 실행 가능)

저장: Ctrl + O → 엔터 / 나가기: Ctrl + X

# 1. 설정 폴더 이동 및 편집
cd /etc/ssh/sshd_config.d
sudo nano 60-cloudimg-settings.conf # (파일명은 환경마다 다를 수 있음, 보통 *.conf)

# 2. 내용 수정
# PasswordAuthentication no  → yes 로 변경

접속 허용 유저 추가: AllowUsers ssafy ubuntu

SSH 서비스 재시작: sudo systemctl restart ssh

💡 [보충 설명] SUDO란 무엇인가?
정의: SuperUser DO의 약자입니다. 리눅스에서 최고 관리자(root)의 권한을 잠시 빌려 명령을 실행하게 해주는 명령어입니다.

왜 쓰는가?: 리눅스는 보안상 평소에는 일반 유저로 로그인하여 사용합니다. 하지만 프로그램 설치(apt install)나 시스템 설정 변경(visudo) 등 중요한 작업은 관리자 권한이 필요합니다. 이때 로그아웃 없이 sudo를 앞에 붙여 관리자 권한으로 실행합니다.

visudo: sudo 권한을 가진 사용자 목록을 관리하는 /etc/sudoers 파일을 안전하게 편집하는 도구입니다. 문법 오류가 있으면 시스템 접속이 막힐 수 있어 반드시 visudo를 통해 편집해야 합니다.

---

## 5. 웹 서버 구축 (NGINX)
🔹 설치 및 확인
Bash

# 1. 패키지 리스트 업데이트
sudo apt update

# 2. NGINX 설치
sudo apt install nginx -y

# 3. 설치 확인
# 브라우저 주소창에 AWS 인스턴스 Public IP 입력 -> "Welcome to nginx!" 화면 확인
💡 [보충 설명] NGINX란 무엇인가?
정의: 가볍고 성능이 뛰어난 웹 서버(Web Server) 소프트웨어입니다.

역할:

정적 파일 전송: HTML, CSS, 이미지 같은 파일을 클라이언트(브라우저)에게 빠르게 전달합니다. (오늘 실습에서 IP로 접속했을 때 뜬 화면이 이것입니다.)

리버스 프록시(Reverse Proxy): 클라이언트의 요청을 받아 뒤에 있는 애플리케이션 서버(Node.js, Spring 등)로 전달해주는 '중계자' 역할을 합니다.

왜 쓰는가?: Node.js나 Python 같은 언어로 만든 서버보다, 단순한 파일 전송이나 보안 처리는 NGINX가 훨씬 빠르고 효율적이기 때문에 보통 앞단에 NGINX를 둡니다.

## 6. 기타 (DNS & 관리)
🔹 DNS (Domain Name System)
역할: 사람이 외우기 힘든 IP 주소(예: 3.34.12.11)를 이해하기 쉬운 도메인 이름(예: https://www.google.com/search?q=google.com)으로 변환해주는 시스템.

실습: 내도메인.한국 등의 서비스를 이용해 AWS IP에 무료 도메인 연결 가능.

🔹 EC2 관리 (정지 vs 종료)
정지 (Stop): 컴퓨터 전원 끄기. 데이터 유지됨. (저장 공간 비용은 발생하나 컴퓨팅 비용은 과금 중지)

종료 (Terminate): 완전 삭제. 인스턴스와 데이터가 모두 사라짐. 복구 불가.


***

**Tip:** `sudo`와 `NGINX`는 서버 개발에서 가장 기본이 되는 중요한 개념들입니다.
* **Sudo**: "관리자 권한으로 실행하시겠습니까?" 라고 이해하면 가장 빠릅니다.
* **NGINX**: "우리 집(서버)의 대문이자 안내원"이라고 생각하면 됩니다. 손님이 오면 적절한 방(Node.js 등)으로 안내해 주는 역할을 합니다.
