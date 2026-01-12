# 🐚 리눅스 Shell Script & 패키지 관리 완벽 정리

## 1. Shell & Script 기초

### 🔹 Shell의 종류
* **Bash (Bourne Again SHell)**: 우분투 기본 CLI 쉘, 리눅스 사용자에게 가장 인기 있음.
* **Dash (Debian Almquist SHell)**: 임베디드 리눅스에서 주로 사용 (작은 용량).
    * **확인 방법**:
        ```bash
        cat /etc/passwd | grep ssafy   # 사용 중인 쉘 확인
        cat /etc/shells                # 설치된 모든 쉘 확인
        du -h /bin/bash /bin/dash      # 용량 비교
        ```
    * **쉘 변경 (실습)**: `sudo chsh [계정명] -s /bin/dash` 후 재부팅.

### 🔹 Shell Script 개요
* **목적**: 반복적인 작업을 자동화하기 위함 (예: 백업, 초기 세팅 등).
* **확장자**: `.sh`
* **기본 구조**:
    ```bash
    #!/bin/bash    # (Shebang) 스크립트를 실행할 쉘 지정
    # 내용 작성
    ```
* **실행 방법**:
    * `source test.sh`: 현재 쉘 환경에서 실행 (가장 많이 사용).
    * `./test.sh`: 실행 권한 필요 (`chmod +x`), 별도 프로세스로 실행.

### 🔹 문법 핵심
1.  **변수**:
    * 선언: `NAME=value` (띄어쓰기 금지, 모든 값은 문자열 취급).
    * 사용: `$NAME`
    * 산술 연산: `$(( 1 + 2 ))`
2.  **조건문 (if)**:
    * `if [ 조건 ]; then ... fi` (대괄호 안쪽 띄어쓰기 필수).
    * **비교 연산자**:
        * `-lt` (<), `-gt` (>), `-eq` (==), `-ne` (!=), `-ge` (>=), `-le` (<=)
        * `-f`: 파일 존재 여부 (Regular file)
        * `-x`: 실행 권한 여부
3.  **배열**: `ARR=(1 2 3)` / 출력: `${ARR[0]}`
4.  **환경변수**:
    * `export NAME=value`: 현재 세션에 변수 등록 (재부팅 시 사라짐).
    * `~/.bashrc`에 등록: 영구 등록 (터미널 실행 시 자동 적용).
    * 확인: `printenv | grep NAME`

---

## 2. Crontab (스케줄링 자동화)

### 🔹 Cron Daemon
* **역할**: 백그라운드에서 주기적인 작업을 관리 및 수행.
* **상태 확인**: `service cron status` / **재시작**: `service cron restart`

### 🔹 Crontab 설정
* **편집**: `sudo vi /etc/crontab`
* **시간 설정 문법 (5자리)**:
    > `분` `시` `일` `월` `요일` `사용자` `명령어`
    * `* * * * *`: 매 분마다 수행.
    * `*/3 * * * *`: 3분마다 수행.
    * `0 7 * * *`: 매일 아침 7시에 수행.

* **실습 예제 (매 분 스크립트 실행)**:
    ```bash
    # 1. 스크립트 권한 부여
    sudo chmod a+x /home/ssafy/test.sh
    
    # 2. crontab 등록
    * * * * * ssafy /home/ssafy/test.sh
    ```

---

## 3. 리눅스 파일 압축 및 해제

### 🔹 압축 방식 비교
* **압축률**: `zip` < `gz` < `bz2` < `xz` (xz가 압축률 가장 높음, 속도 느림).

### 🔹 명령어 정리
| 형식 | 압축하기 | 풀기 | 특징 |
| :--- | :--- | :--- | :--- |
| **zip** | `zip -r [파일.zip] [대상]` | `unzip [파일.zip] -d [경로]` | 널리 쓰임, 원본 유지 |
| **gzip** | `gzip [파일]` | `gunzip [파일.gz]` | 단일 파일 압축, 원본 삭제 |
| **xz** | `xz [파일]` | `xz -d [파일.xz]` | 높은 압축률, 원본 삭제 |
| **tar** | `tar -cvf [파일.tar] [대상]` | `tar -xvf [파일.tar] -C [경로]` | 파일 묶기 (압축 아님) |
| **tar.xz** | `tar -Jcvf [파일.tar.xz] [대상]` | `tar -Jxvf [파일.tar.xz] -C [경로]` | 묶기+압축 (가장 많이 씀) |

---

## 4. 소프트웨어 설치 및 배포 방법

### 🔹 1. Binary 파일 설치 (Node.js 예시)
* **특징**: 컴파일된 실행 파일을 다운로드하여 배치.
* **과정**:
    1.  `wget`으로 파일 다운로드 (`tar.xz`).
    2.  압축 해제: `sudo tar -Jxvf node-v20...tar.xz -C /usr/local/lib/nodejs/`
    3.  **심볼릭 링크** 생성 (어디서든 실행 가능하게):
        `sudo ln -s /usr/local/lib/nodejs/.../bin/node /usr/bin/node`
    4.  확인: `node -v`

### 🔹 2. dpkg (Debian Package) 설치
* **특징**: `.deb` 확장자 파일 설치. **의존성 문제를 해결해주지 않음** (단점).
* **명령어**:
    * 설치: `sudo dpkg -i [파일.deb]`
    * 삭제: `sudo dpkg -P [패키지명]`
* **보완**: 의존성 오류 발생 시 `apt`를 사용하여 해결하거나 설치.

### 🔹 3. Source Code 설치 (빌드)
* **특징**: 소스코드를 직접 다운받아 내 컴퓨터 환경에 맞춰 컴파일. (시간 오래 걸림, 커스터마이징 가능).
* **과정 (Unix 표준)**:
    1.  필수 도구 설치: `gcc`, `g++`, `make`, `python3` 등.
    2.  압축 해제 및 디렉토리 이동.
    3.  **설정**: `./configure` (환경 설정).
    4.  **빌드**: `make -j4` (컴파일, 4코어 사용).
    5.  **설치**: `sudo make install` (시스템에 복사).
    6.  **삭제**: `sudo make uninstall`