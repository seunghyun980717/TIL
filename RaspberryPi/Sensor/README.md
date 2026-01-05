# 📝 [TIL] 라즈베리파이 신호 처리 및 센서(Sense HAT) 심화 학습

## 1. 신호 처리 기초 (Analog vs Digital)

### 🔹 아날로그 신호의 처리
* **문제점**: 라즈베리파이에는 아날로그 신호를 디지털로 변환하는 **ADC(Analog-to-Digital Converter)** 하드웨어가 내장되어 있지 않음.
* **해결책 (PWM)**:
    * **PWM (Pulse Width Modulation)**: 펄스 폭 변조.
    * 디지털 신호를 빠르게 스위칭(On/Off)하여 마치 아날로그 신호인 것처럼 보이게 하는 기술.

### 🔹 주파수와 주기
* **공식**: $f(Hz) = 1 / T(s)$ (주파수는 주기에 반비례)
* **CPU 속도 예시**:
    * **일반 CPU (5GHz)**: 1초에 50억 회 진동 (1회 진동 시 0.2ns 소요)
    * **라즈베리파이 5 (ARM Cortex-A76 2.4GHz)**: 1초에 24억 회 진동 (1회 진동 시 약 417μs 소요)

---

## 2. 센서(Sensor)와 MEMS

### 🔹 센서 개요
* **Sense HAT**: 라즈베리파이 공식 센서 키트 (Add-on Board).
* **센서(Sensor)**: 정보를 수집하여 수치 값으로 만들어내는 장치.
    * 예: 오감(시각, 청각) 외 초음파, 압력, 자기, 온도, 가스, 가속도 등.

### 🔹 MEMS (Micro Electro Mechanical Systems)
* **정의**: 반도체 제조 공정을 응용하여 만든 초소형 정밀 기계 시스템.
* **활용 분야**: 자동차, 정보 통신 등 다양한 분야.
    * **에어백**: 가속도 센서 활용.
    * **차체 제어**: 자이로 센서 활용.
    * **타이어**: 공기압 센서 활용.

---

## 3. MCU와 드라이버 (Driver)

### 🔹 드라이버의 필요성
* **MCU의 한계**: GPIO 핀 부족, 직접 제어 시 프로그래밍의 복잡함 등으로 모든 모듈을 직접 제어하기 어려움.
* **드라이버(Driver)의 역할**:
    * **H/W Interface**: 모듈을 제어할 수 있는 인터페이스 역할.
    * **동작 원리**: MCU는 드라이버에게 명령을 내리고, 드라이버가 실제 모듈(LED, 모터 등)을 제어함.
    * **종류**: FND 드라이버, 모터 드라이버, LCD 드라이버, LED 드라이버 등.

---

## 4. 라즈베리파이 Sense HAT 실습

### 🔹 개요 및 구성
* **구성**: 다양한 센서 집합(자이로, 가속도, 기압, 지자기, 온습도) + 8x8 LED Matrix + 조이스틱.
* **주의사항**: 하드웨어 연결 시 반드시 **라즈베리파이 전원을 끄고** 연결할 것.

### 🔹 Sense HAT Emulator (가상 시뮬레이터)
* 하드웨어가 없거나 불량 테스트 용도로 사용 (실제 코드와 호환됨).
* **설치 명령어**:
    ```bash
    git clone https://github.com/astro-pi/python-sense-emu
    cd ./python-sense-emu
    sudo python3 setup.py install
    ```

### 🔹 API 테스트 코드 (Python)
```python
from sense_hat import SenseHat
sense = SenseHat()
sense.show_message("HELLO")
```

### 🔹 트러블 슈팅 (OSError 발생 시)
* **원인**: 설정 파일에 Sense HAT 오버레이가 누락된 경우.
* **해결 방법**:
    1. `/boot/firmware/config.txt` 파일 열기 (`sudo vi ...`)
    2. `dtoverlay=rpi-sense` 내용 추가 후 저장.
    3. `sudo reboot` (재부팅).

### 🔹 회로도 확인
* **공식 사이트**: [Raspberry Pi Datasheets](https://datasheets.raspberrypi.com/)
* **확인 방법**: 'sense-hat' 검색 → Schematic(회로도) 클릭 → 부품 실크 번호(ex: U3, U4)로 상세 부품 확인 및 PDF 조회.

---

## 5. IMU (Inertial Measurement Unit, 관성 측정 장치)

### 🔹 개요
* 물체의 기울기, 위치, 방향 등 정보를 측정하는 장치 (드론, 자동차, 선박 등 활용).
* **센서 축(Axis) 구성**:
    * **3축**: 가속도 or 자이로 or 지자기 중 택 1 (X, Y, Z).
    * **6축**: 자이로스코프 + 가속도 센서.
    * **9축**: 자이로스코프 + 가속도 센서 + 지자기 센서.
* **Sense HAT 스펙**: **9축 센서** 탑재 (회로도 실크: U4).
    * 자이로스코프 (Pitch, Roll, Yaw)
    * 가속도 센서 (X, Y, Z)
    * 지자기 센서 (X, Y, Z)

### 🔹 데이터 보정 (필터링)
* **필요성**: 자이로스코프 등의 Raw data는 오차가 있을 수 있어 보정이 필수.
* **주요 필터**:
    * **상보 필터 (Complementary Filter)**
    * **칼만 필터 (Kalman Filter)**
* **참고**: 정확한 각도를 구하기 위해 사용되며, 최근에는 관련 라이브러리가 잘 구축되어 있음.

### 🔹 가속도 센서 활용 원리
1.  가속도 적분 → **속도** 산출.
2.  속도 적분 → **이동 경로** 산출.
3.  진동 분석 → 장비 **고장 여부** 판단.
4.  **기울기** 측정 → 모터 제어 등에 활용 (예: MPU6050).

---

## 6. 기타 구성 요소 상세

### 🔹 LED Matrix
* Sense HAT에 내장된 디스플레이.
* 공식 문서: [Sense HAT API - LED Matrix](https://pythonhosted.org/sense-hat/api/#led-matrix)

### 🔹 조이스틱 (Joystick)
* **특징**: 라즈베리파이에는 **ADC가 없음**.
* **구조**: 명칭은 조이스틱이지만 실제로는 아날로그 스틱이 아닌 **5개의 디지털 버튼**(좌, 우, 위, 아래, 클릭)으로 구성됨.
* **회로도 실크**: J2