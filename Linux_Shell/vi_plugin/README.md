# 🐧 리눅스 텍스트 에디터(Vim) & GCC 학습 정리

## 1. Text Editor vs IDE

### 🔹 개념 비교
* **Text Editor**: 텍스트 작성 및 편집 기능에 집중한 도구.
    * **구성**: 텍스트 작성 + 편집 기능 + 파일 저장 관리.
    * **예시**: `vscode` (Extension으로 개발환경 구축 가능), `gedit` (GUI), `vi/vim` (CLI).
* **IDE (Integrated Development Environment)**: 통합 개발 환경.
    * **구성**: Text Editor + 빌드 도구(컴파일러/링커) + 디버깅 도구 + 성능 분석기 등.

### 🔹 왜 임베디드 개발자는 'vi'를 써야 하는가?
* 임베디드 리눅스 환경에는 GUI 없이 **vi만 설치되어 있는 경우가 많기 때문**에 필수적으로 숙련해야 함.

---

## 2. Vim (Vi IMproved) 기초

### 🛠️ 설치 및 실행
* **버전 확인**: `$ vi --version`
* **설치 (Huge version)**: `$ sudo apt install vim -y` (기본 vi보다 기능 확장)
* **실행**: `$ vi [파일명]` (예: `vi ./abc.txt`)

### 🔄 3가지 핵심 모드 (Mode)
1.  **Command Mode (명령 모드)**: 초기 진입 상태. 저장, 커서 이동, 삭제, 복사/붙여넣기 등 수행.
2.  **Insert Mode (입력 모드)**: 실제 코드 작성이 가능한 상태.
3.  **Visual Mode (비주얼 모드)**: 텍스트 영역을 선택(드래그)하는 상태.

### 🔀 모드 전환 방법
* **Command → Insert**: `i` (커서 앞), `a` (커서 뒤), `o` (아래 줄), `O` (윗 줄).
* **Insert → Command**: `ESC` 키.
* **Command → Visual**: `v` 키.

---

## 3. Vim 주요 명령어 (Command Mode)

### 💾 저장 및 종료
* `:w`: 저장 (Write)
* `:q`: 종료 (Quit)
* `:wq`: 저장 후 종료
* `:q!`: 저장하지 않고 강제 종료
* `:w [파일명]`: 다른 이름으로 저장

### ✂️ 편집 (복사/붙여넣기/삭제)
* **복사**:
    * `yy`: 한 줄 복사 (Visual 모드에서는 `y`)
    * **마우스 더블클릭**: 복사
* **붙여넣기**:
    * `p`: 커서 뒤(아래)에 붙여넣기
    * `Shift + p` (`P`): 커서 앞(위)에 붙여넣기
    * **마우스 휠 클릭**: 붙여넣기
* **삭제(잘라내기)**:
    * `dd`: 한 줄 삭제
    * `[숫자]dd`: n줄 삭제 (예: `3dd`)
    * `cc`: 해당 라인 지우고 Insert 모드 전환

### 🔍 탐색 및 검색
* **이동**: `gg` (문서 맨 위), `Shift + g` (`G`, 문서 맨 아래).
* **검색**: `/[검색어]`
    * `n`: 다음 검색 결과 이동
    * `Shift + n` (`N`): 이전 검색 결과 이동
* **실행 취소/다시 실행**: `u` (Undo), `Ctrl + r` (Redo)

### 🔄 치환 (Replace)
* **전체 바꾸기**: `:%s/[검색어]/[변경어]/g`
* **선택 바꾸기**: `:%s/[검색어]/[변경어]/c` (확인하며 변경)

### 📹 기타
* **매크로 녹화**: `q` 두 번 눌러 시작 → 작업 수행 → `q` 눌러 종료.

---

## 4. Vim 환경 설정 (.vimrc)

사용자 홈 디렉토리에 설정 파일을 만들어 영구적으로 설정을 적용할 수 있습니다.

* **파일 생성**: `vi ~/.vimrc`
* **주요 설정 내용**:
    ```vim
    set ts=4      " Tab 크기를 4칸으로 설정
    set sw=4      " 자동 들여쓰기(Indent) 크기를 4칸으로 설정
    set ls=2      " 하단에 파일 상태바 표시
    set nu        " 줄 번호(Line Numbering) 표시
    set nonu      " 줄 번호 해제
    ```

---

## 5. GCC 컴파일러 및 패키지 관리

### 📦 패키지 저장소(Archive) 변경
기본 우분투 저장소(`kr.archive.ubuntu.com`)는 느리기 때문에 **카카오 미러(`mirror.kakao.com`)**로 변경하여 속도 향상.

1.  **설정 파일 열기**:
    ```bash
    sudo vi /etc/apt/sources.list.d/ubuntu.sources
    ```
2.  **주소 일괄 변경 (Vim 명령어)**:
    ```vim
    :%s/[kr.archive.ubuntu.com/mirror.kakao.com/g](https://kr.archive.ubuntu.com/mirror.kakao.com/g)
    ```
3.  **적용**:
    ```bash
    :wq  # 저장 후 종료
    sudo apt update
    ```

### 🔨 GCC 설치 및 빌드
* **설치**: `sudo apt install gcc -y`
* **빌드 (Build)**: 소스코드(.c)를 실행 가능한 바이너리 파일로 변환.
    ```bash
    # 문법: gcc [소스파일] -o [결과파일명]
    gcc ./bts.c -o gogo
    ```
* **실행**: `./gogo`

---

## 6. Vim 심화 (Extension & Theme)

### 🆚 코드 비교 (Vimdiff)
* **명령어**: `vimdiff ./file1.c ./file2.c`
* **특징**: 차이점은 음영 처리, 같으면 해제.
* **창 이동**: `Ctrl + w` + 방향키.

### 🎨 Color Scheme 변경
* **내장 스킴 변경**: `:colorscheme desert`
* **스킴 경로**: `/usr/share/vim/vim91/colors`
* **외부 스킴 다운로드 (예: Molokai)**:
    1.  `vim.org` 등에서 다운로드 링크 복사.
    2.  `wget`으로 해당 경로에 다운로드.
    ```bash
    cd /usr/share/vim/vim91/colors
    sudo wget -O molokai.vim [다운로드 URL]
    ```
* **영구 적용**: `.vimrc` 파일에 `colorscheme molokai` 추가.