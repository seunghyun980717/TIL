# 🛠️ Build System & Linux Command 학습 정리

## 1. Build System 개요

### 🔹 빌드(Build)란?
* **정의**: 소스코드(`.c`, `.cpp`)를 실행 가능한 소프트웨어(`.elf`, `.exe`)로 변환하는 과정 또는 결과물.
* **Build System**: 빌드에 필요한 여러 작업을 도와주는 프로그램 (예: `make`, `cmake`).

### 🔹 GCC 기준 빌드 과정 (2단계)
1.  **Compile & Assemble**
    * 소스코드 파일을 0과 1로 구성된 **Object 파일**(`.o`)로 변환.
    * 명령어: `gcc -c ./main.c` (➔ `main.o` 생성)
2.  **Linking**
    * 생성된 Object 파일들과 Library들을 모아 하나로 합침.
    * 명령어: `gcc ./main.o ./yellow.o -o ./go` (➔ 실행 파일 `go` 생성)

### 🔹 빌드 자동화의 필요성
* **Bash Shell Script (`.sh`)**:
    * `source 파일명.sh`로 빌드 가능.
    * **단점**: 파일 하나만 수정해도 전체를 다시 빌드해야 함 (시간 소요 큼).
* **Make Build System**:
    * 파일 간의 **의존성(Dependency)**을 추적하여, **변경된 파일만 컴파일**함 (속도 최적화).

---

## 2. Make (소프트웨어 빌드 자동화 도구)

### 🔹 특징
* `Makefile`이라는 특별한 형식의 파일을 사용.
* **설치**: `sudo apt install make -y`
* **실행**: `make`

### 🔹 Makefile 문법
* **Target (타겟)**: 빌드하려는 최종 결과물 (1개 이상 필수).
* **Dependency (의존성)**: Target을 만들기 위해 필요한 파일 목록.
* **Command (명령어)**: 실행할 명령어 (**반드시 Tab으로 들여쓰기**).

### 🔹 변수 (Variable)
* **사용**: `$(변수명)` 또는 `${변수명}`. 가독성을 위해 상단에 정의.
* **할당 연산자**:
    * `=`: 코드 전체 기준 최종값 (지연 할당).
    * `:=`: 현재 위치 기준 값 (즉시 할당).
    * `+=`: 기존 값에 추가.
* **특수 변수 (Automatic Variables)**:
    * `$@`: Target 이름.
    * `$^`: Dependency 목록 전체.
    * `$<`: Dependency 목록 중 첫 번째 파일.

### 🔹 주요 기능 및 옵션
* **컴파일 옵션**:
    * `-g`: 디버깅 정보 포함.
    * `-Wall`: 모든 경고(Warning)를 에러처럼 표시.
    * `-O2`: 최적화 2단계.
* **Wildcard 함수**: `*.c` (현재 디렉토리의 모든 .c 파일).
* **확장자 치환**: `OBJS = $(SRCS:.c=.o)` (.c를 .o로 변경).

### 🔹 Makedepend 유틸리티
입력한 소스파일을 분석해 헤더파일 의존성을 자동으로 등록해주는 도구.
* **설치**: `sudo apt install wutils-dev -y` (또는 `xutils-dev`)
* **사용**: `makedepend main.c func1.c -Y`
* **특징**: Makefile 하단에 의존성 추가, `Makefile.bak` 백업 생성.

---

## 3. CMake (Cross Platform Build System)

### 🔹 특징
* 운영체제에 상관없이 빌드 가능한 **크로스 플랫폼** 도구.
* Makefile을 자동으로 생성해주는 상위 빌드 시스템.
* **설치**: `sudo apt install g++ cmake -y`

### 🔹 사용 흐름
1. `CMakeLists.txt` 파일 작성.
2. `cmake .` 실행 → Makefile 자동 생성.
3. `make` 실행 → 빌드 완료.

---

## 4. 리눅스 파일 관리 명령어

### 🔹 파일 내용 및 검색
* `cat [파일]`: 파일 내용 출력.
* `>`: 내용 쓰기 (덮어쓰기).
* `>>`: 내용 이어 쓰기 (Append).
* `grep [텍스트] [경로]`: 문자열 검색.
    * 예: `ls -al | grep test*`

### 🔹 파일 찾기 및 정보
* `find [경로] -name [이름] -type [f/d]`: 파일(f) 또는 디렉토리(d) 찾기.
* `file [파일]`: 파일 종류 확인 (ASCII text, executable 등).
* `which [명령어]`: 명령어 실행 파일의 위치 확인.

### 🔹 용량 확인
* `du -sh [파일/디렉토리]`: Disk Usage 확인.
    * `-s`: 총 사용량만 출력 (Summary).
    * `-h`: 사람이 보기 편한 단위로 출력 (Human-readable).

---

## 5. Shell 명령어 & 기타

### 🔹 시스템 정보 및 로그
* `echo [텍스트]`: 화면 출력.
* `date`: 현재 시간 확인.
* `uptime`: 시스템 부팅 후 경과 시간 및 부하 확인.
* `dmesg`: 커널 부팅 로그 및 하드웨어 메시지 출력.
* `history`: 사용한 명령어 기록 확인 (`!번호`로 재실행).

### 🔹 C언어 연동
* `system("명령어")`: C 코드 내에서 쉘 명령어를 실행 (`#include <stdlib.h>`).

### 🔹 심볼릭 링크 (Symbolic Link)
* **정의**: 윈도우의 '바로가기'와 같은 링크 파일. 원본을 가리킴.
* **명령어**: `ln -s [원본] [링크명]`
    * 예: `ln -s ./bts ./bbq` (bbq가 bts를 가리킴).
* **확인**: `ls -al`로 확인 시 `->` 화살표로 연결 표시됨.