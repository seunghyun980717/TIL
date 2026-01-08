# AI 쇼핑 어시스턴트 (app.py) 코드 상세 설명

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [전체 구조](#전체-구조)
3. [주요 라이브러리](#주요-라이브러리)
4. [전역 변수](#전역-변수)
5. [핵심 함수 설명](#핵심-함수-설명)
6. [실행 흐름](#실행-흐름)

---

## 프로젝트 개요

이 프로젝트는 이미지 기반 AI 쇼핑 어시스턴트입니다. 사용자가 패션 아이템 이미지를 업로드하면:
1. **YOLO**로 이미지 내 패션 아이템을 탐지
2. **CLIP**으로 이미지 특징을 추출
3. **네이버 쇼핑 API** 또는 **벡터 스토어**에서 유사 상품 검색
4. **LLM**(대화형 AI)을 통해 사용자와 대화하며 상품 추천

---

## 전체 구조

```
app.py
├── 모델 로딩 (load_models)
├── 이미지 처리
│   ├── 패션 아이템 탐지 (detect_fashion_objects)
│   └── CLIP 특징 추출 (extract_clip_features)
├── 상품 검색
│   ├── 네이버 쇼핑 API (search_products)
│   ├── 벡터 스토어 저장 (save_products_to_vectorstore)
│   └── 벡터 스토어 검색 (search_from_vectorstore)
├── LLM 대화
│   ├── 응답 생성 (generate_response_with_context)
│   └── 채팅 처리 (chat_response)
└── UI (Gradio)
    └── 인터페이스 생성 (create_interface)
```

---

## 주요 라이브러리

### 1. **이미지 처리**
```python
import torch
import numpy as np
from PIL import Image
import cv2
```
- `torch`: PyTorch (딥러닝 프레임워크)
- `numpy`: 배열 연산
- `PIL`: 이미지 처리
- `cv2`: OpenCV (바운딩 박스 그리기)

### 2. **AI 모델**
```python
from ultralytics import YOLO  # 객체 탐지
from transformers import CLIPProcessor, CLIPModel  # 이미지-텍스트 임베딩
from transformers import AutoTokenizer, AutoModelForCausalLM  # LLM
```

### 3. **LangChain (AI 대화 체인)**
```python
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.llms import HuggingFacePipeline
```
- 벡터 DB, 대화 메모리, RAG(검색 증강 생성) 구현

### 4. **UI**
```python
import gradio as gr  # 웹 인터페이스
```

---

## 전역 변수

```python
models = {}  # 로드된 AI 모델 저장
vector_store = None  # 상품 정보 벡터 DB
conversation_chain = None  # LangChain 대화 체인
search_count = 0  # API 호출 횟수 (제한 관리)
conversation_history = []  # 대화 히스토리
token_manager = None  # 토큰 관리 객체
```

---

## 핵심 함수 설명

### 1. `load_models()` - 모델 로딩 및 초기화

**위치**: [app.py:30-126](app.py#L30-L126)

모든 AI 모델을 메모리에 로드합니다.

```python
def load_models():
    global models, vector_store, conversation_chain, token_manager
```

#### 1.1 YOLO 모델 로드
```python
models['yolo'] = YOLO(YOLO_MODEL_PATH, task='segment')
```
- **역할**: 이미지에서 패션 아이템 탐지 (셔츠, 바지, 신발 등)
- **task='segment'**: 세그멘테이션 모드 (물체의 외곽선까지 탐지)

#### 1.2 CLIP 모델 로드
```python
clip_model_name = CLIP_MODEL_PATH
models['clip_processor'] = CLIPProcessor.from_pretrained(clip_model_name, use_fast=True)
models['clip_model'] = CLIPModel.from_pretrained(clip_model_name).to(device)
```
- **역할**: 이미지를 벡터로 변환 (이미지 유사도 검색용)
- **CLIP**: OpenAI의 이미지-텍스트 멀티모달 모델

#### 1.3 LLM 모델 로드
```python
tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    LLM_MODEL_PATH,
    torch_dtype=torch.float16,  # 메모리 절약을 위한 16비트 연산
    device_map="auto",  # GPU 자동 배치
    low_cpu_mem_usage=True
)
```
- **역할**: 사용자와 대화하며 상품 추천
- **float16**: GPU 메모리 사용량 절반으로 감소

#### 1.4 벡터 스토어 초기화
```python
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_PATH)
vector_store = Chroma(
    persist_directory=CHROMA_PERSIST_DIR,
    embedding_function=embeddings
)
```
- **ChromaDB**: 상품 정보를 벡터로 저장 (유사도 검색용)
- **임베딩**: 텍스트를 숫자 벡터로 변환

#### 1.5 대화 체인 설정
```python
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    output_key="answer"
)

conversation_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vector_store.as_retriever(search_kwargs={"k": VECTOR_SEARCH_K}),
    memory=memory,
    return_source_documents=True
)
```
- **ConversationBufferMemory**: 대화 내용 기억
- **ConversationalRetrievalChain**: 검색 결과 + 대화 메모리 결합

---

### 2. `detect_fashion_objects(image)` - 패션 아이템 탐지

**위치**: [app.py:128-212](app.py#L128-L212)

업로드된 이미지에서 패션 아이템을 탐지하고, 바운딩 박스를 그립니다.

```python
def detect_fashion_objects(image):
```

#### 2.1 YOLO 모델로 객체 탐지
```python
results = models['yolo'](image)
```
- YOLO가 이미지를 분석하여 객체(옷, 가방 등) 위치와 종류 반환

#### 2.2 탐지 결과 처리
```python
for r in results:
    boxes = r.boxes
    for box in boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()  # 바운딩 박스 좌표
        conf = box.conf[0].item()  # 신뢰도 (0~1)
        cls = int(box.cls[0].item())  # 클래스 ID
        class_name = models['yolo'].names[cls]  # 클래스 이름
```

**예시**:
- `x1, y1, x2, y2`: (100, 50, 300, 400) → 왼쪽 위(100,50)에서 오른쪽 아래(300,400)
- `conf`: 0.92 → 92% 확률로 해당 물체
- `class_name`: "shirt"

#### 2.3 바운딩 박스 그리기
```python
cv2.rectangle(img_with_boxes, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
cv2.putText(img_with_boxes, f"{class_name} {conf:.2f}", ...)
```
- 녹색 사각형으로 물체 표시
- "shirt 0.92" 라벨 추가

#### 2.4 상품 검색 및 저장
```python
products = search_products(' '.join(detected_items[:2]))
save_products_to_vectorstore(products)
```
- 탐지된 아이템(예: "shirt pants")으로 네이버 쇼핑 검색
- 결과를 벡터 DB에 저장

---

### 3. `extract_clip_features(image)` - CLIP 특징 추출

**위치**: [app.py:214-232](app.py#L214-L232)

이미지를 512차원 벡터로 변환합니다 (이미지 유사도 검색용).

```python
def extract_clip_features(image):
    inputs = models['clip_processor'](images=image, return_tensors="pt")
    inputs = {k: v.to(models['device']) for k, v in inputs.items()}

    with torch.no_grad():  # 학습 모드 OFF (속도 향상)
        image_features = models['clip_model'].get_image_features(**inputs)

    return image_features.cpu().numpy()
```

**예시**:
- 입력: 셔츠 이미지
- 출력: `[0.23, -0.45, 0.89, ..., 0.12]` (512개 숫자)

---

### 4. `search_products(query)` - 상품 검색

**위치**: [app.py:234-300](app.py#L234-L300)

네이버 쇼핑 API로 상품을 검색합니다.

#### 4.1 검색 횟수 제한 확인
```python
if search_count >= MAX_SEARCH_COUNT:
    return search_from_vectorstore(query)
```
- API 호출 제한 초과 시 벡터 DB에서 검색

#### 4.2 네이버 쇼핑 API 호출
```python
url = "https://openapi.naver.com/v1/search/shop.json"
headers = {
    "X-Naver-Client-Id": NAVER_CLIENT_ID,
    "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
}
params = {"query": query, "display": SEARCH_DISPLAY_COUNT, "sort": "sim"}

response = requests.get(url, headers=headers, params=params)
```

#### 4.3 데이터 정합성 처리
```python
for item in items:
    product_type = int(item.get('productType', 0))
    if product_type in [1, 2, 3]:  # 일반상품만
        # 이미지 없으면 플레이스홀더
        if 'image' not in item or not item['image']:
            item['image'] = 'https://placehold.co/150'

        # HTML 태그 제거 (<b>브랜드</b> → 브랜드)
        if 'title' in item:
            item['title'] = item['title'].replace('<b>', '').replace('</b>', '')
```

---

### 5. `save_products_to_vectorstore(products)` - 벡터 스토어에 저장

**위치**: [app.py:333-376](app.py#L333-L376)

검색된 상품을 벡터 DB에 저장합니다.

```python
def save_products_to_vectorstore(products):
    texts = []
    metadatas = []

    for product in products:
        # 상품 정보를 하나의 텍스트로 결합
        text_parts = [
            product.get('title', ''),
            product.get('mallName', ''),
            f"가격: {product.get('lprice', '0')}원",
            product.get('brand', ''),
            product.get('category1', '')
        ]
        text = ' '.join([part for part in text_parts if part])
        texts.append(text)

        # 메타데이터 저장 (나중에 복원용)
        metadatas.append({
            'title': product.get('title', ''),
            'price': product.get('lprice', '0'),
            ...
        })

    # 벡터 스토어에 추가
    vector_store.add_texts(texts=texts, metadatas=metadatas)
```

**예시**:
- `text`: "나이키 에어맥스 신발 나이키몰 가격: 129000원 나이키 스포츠/레저"
- 이 텍스트가 임베딩되어 벡터로 저장됨

---

### 6. `search_from_vectorstore(query)` - 벡터 스토어 검색

**위치**: [app.py:378-407](app.py#L378-L407)

저장된 벡터 DB에서 유사한 상품을 검색합니다.

```python
def search_from_vectorstore(query):
    docs = vector_store.similarity_search(query, k=SEARCH_DISPLAY_COUNT)
    products = []

    for doc in docs:
        products.append({
            'title': doc.metadata.get('title', ''),
            'lprice': doc.metadata.get('price', '0'),
            ...
        })

    return products
```

**동작 원리**:
1. `query = "빨간 운동화"` 입력
2. 쿼리를 벡터로 변환
3. 저장된 상품 벡터와 코사인 유사도 계산
4. 가장 유사한 상위 K개 반환

---

### 7. `generate_response_with_context()` - LLM 응답 생성

**위치**: [app.py:513-570](app.py#L513-L570)

LLM을 사용하여 사용자 질문에 대한 답변을 생성합니다.

#### 7.1 시스템 프롬프트 설정
```python
system_prompt = "당신은 친절한 AI 쇼핑 어시스턴트입니다. 패션 상품에 대한 정보를 제공하고 추천합니다."
```

#### 7.2 토큰 관리
```python
full_prompt, prompt_tokens = token_manager.prepare_prompt(
    system_prompt=system_prompt,
    conversation_history=conversation_history,
    current_query=user_input,
    context=search_results
)
```
- 대화 히스토리가 너무 길면 자동으로 오래된 메시지 제거

#### 7.3 LLM 텍스트 생성
```python
inputs = tokenizer(full_prompt, return_tensors="pt", truncation=True, max_length=2048)

with torch.no_grad():
    outputs = model.generate(
        inputs.input_ids.to(model.device),
        attention_mask=inputs.attention_mask.to(model.device),
        max_new_tokens=MAX_GENERATION_TOKENS,
        temperature=0.7,  # 창의성 조절 (0=결정적, 1=랜덤)
        do_sample=True,
        pad_token_id=tokenizer.pad_token_id
    )
```

#### 7.4 응답 정제
```python
generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
input_length = len(tokenizer.decode(inputs.input_ids[0], skip_special_tokens=True))
response = generated_text[input_length:].strip()  # 입력 제거, 생성된 부분만
```

---

### 8. `chat_response(message, history)` - 채팅 처리

**위치**: [app.py:572-697](app.py#L572-L697)

사용자 메시지를 처리하고 응답을 생성합니다.

#### 8.1 대화 히스토리 관리
```python
# Gradio 형식 → 내부 형식 변환
for h in history:
    user_msg = {"role": "user", "content": h[0]}
    assistant_msg = {"role": "assistant", "content": h[1]}
    conversation_history.append(user_msg)
    conversation_history.append(assistant_msg)
```

#### 8.2 웹 검색 필요 여부 판단
```python
def should_search_web(query):
    search_keywords = ['최신', '신상', '재고', '실시간', '현재', '오늘']
    return any(keyword in query for keyword in search_keywords)
```
- "최신 나이키 신발" → 웹 검색
- "빨간 신발 추천" → 벡터 DB 검색

#### 8.3 검색 및 응답 생성
```python
if should_search_web(message) and search_count < MAX_SEARCH_COUNT:
    # 웹에서 새로운 상품 검색
    products = search_products(message)
    save_products_to_vectorstore(products)
    search_results = format_product_list(products)
    response = generate_response_with_context(message, conversation_history, search_results)
else:
    # 벡터 DB에서 검색
    docs = vector_store.similarity_search(message, k=VECTOR_SEARCH_K)
    products = [doc.metadata for doc in docs]
    response = generate_response_with_context(message, conversation_history, search_results)
```

#### 8.4 토큰 통계 표시
```python
token_stats = token_manager.get_token_stats(conversation_history)
response += f"\n\n[검색: {search_count}/{MAX_SEARCH_COUNT}] [토큰: {token_stats['total']}/{MAX_CONTEXT_TOKENS}] [메시지: {token_stats['messages']}]"
```
- 예: `[검색: 3/10] [토큰: 512/2048] [메시지: 8]`

---

### 9. `create_interface()` - Gradio UI 생성

**위치**: [app.py:699-767](app.py#L699-L767)

웹 인터페이스를 생성합니다.

#### 9.1 레이아웃 구성
```python
with gr.Blocks(title="AI 쇼핑 어시스턴트") as demo:
    gr.Markdown("# AI 쇼핑 어시스턴트")

    with gr.Row():
        # 왼쪽: 이미지 업로드
        with gr.Column(scale=1):
            image_input = gr.Image(label="상품 이미지", type="pil")
            detect_btn = gr.Button("상품 탐지", variant="primary")
            output_image = gr.Image(label="탐지 결과")

        # 오른쪽: 채팅
        with gr.Column(scale=1):
            chatbot = gr.Chatbot(height=500)
            msg = gr.Textbox(label="메시지", ...)
            submit = gr.Button("전송", variant="primary")
            clear = gr.Button("초기화")

    # 아래: 상품 목록
    detection_info = gr.HTML(label="탐지 정보")
```

#### 9.2 이벤트 핸들러
```python
# 탐지 버튼 클릭 시
detect_btn.click(
    fn=handle_detection_and_chat,
    inputs=image_input,
    outputs=[output_image, detection_info, chatbot]
)

# 메시지 전송 시
msg.submit(fn=chat_response, inputs=[msg, chatbot], outputs=[chatbot, detection_info])

# 초기화 버튼
clear.click(clear_conversation, outputs=[chatbot, msg])
```

---

## 실행 흐름

### 1. 프로그램 시작
```python
if __name__ == "__main__":
    load_models()  # 모델 로딩
    demo = create_interface()  # UI 생성
    demo.launch(
        server_port=GRADIO_SERVER_PORT,
        server_name=GRADIO_SERVER_NAME,
        share=False
    )
```

### 2. 사용자 이미지 업로드 → "상품 탐지" 클릭
```
[사용자] 셔츠 이미지 업로드
    ↓
[YOLO] 이미지 분석 → "shirt", "pants" 탐지
    ↓
[검색] 네이버 API에 "shirt pants" 검색
    ↓
[벡터DB] 검색 결과 저장
    ↓
[LLM] "안녕하세요! 이미지에서 shirt, pants를 발견했습니다..." 메시지 생성
    ↓
[UI] 탐지 결과 + 상품 목록 + LLM 메시지 표시
```

### 3. 사용자 채팅
```
[사용자] "빨간색 셔츠 추천해줘"
    ↓
[분석] '최신', '신상' 키워드 없음 → 벡터 DB 검색
    ↓
[벡터DB] "빨간색 셔츠" 유사도 검색
    ↓
[LLM] 대화 히스토리 + 검색 결과 → 답변 생성
    ↓
[UI] 응답 + 상품 목록 표시
```

### 4. 웹 검색 트리거
```
[사용자] "최신 나이키 신발 보여줘"
    ↓
[분석] '최신' 키워드 감지 → 웹 검색
    ↓
[네이버 API] "최신 나이키 신발" 검색
    ↓
[벡터DB] 검색 결과 저장
    ↓
[LLM] 답변 생성
    ↓
[UI] 최신 상품 표시
```

---

## 주요 설정 파일 (config.py)

```python
# YOLO 모델 경로
YOLO_MODEL_PATH = "path/to/yolo_model.pt"

# CLIP 모델
CLIP_MODEL_PATH = "openai/clip-vit-base-patch32"

# LLM 모델
LLM_MODEL_PATH = "gpt2" 또는 다른 모델

# 네이버 API 키
NAVER_CLIENT_ID = "YOUR_CLIENT_ID"
NAVER_CLIENT_SECRET = "YOUR_CLIENT_SECRET"

# 검색 설정
MAX_SEARCH_COUNT = 10  # API 호출 제한
SEARCH_DISPLAY_COUNT = 6  # 표시할 상품 수
VECTOR_SEARCH_K = 3  # 벡터 검색 결과 수

# 토큰 설정
MAX_CONTEXT_TOKENS = 2048
MAX_GENERATION_TOKENS = 256

# 서버 설정
GRADIO_SERVER_PORT = 7860
GRADIO_SERVER_NAME = "0.0.0.0"
```

---

## 주요 개념 정리

### 1. **YOLO (You Only Look Once)**
- 실시간 객체 탐지 모델
- 이미지를 한 번만 보고(You Only Look Once) 모든 물체 탐지
- DeepFashion2: 패션 전용 학습 데이터

### 2. **CLIP (Contrastive Language-Image Pre-training)**
- 이미지와 텍스트를 같은 벡터 공간에 매핑
- "빨간 신발" 텍스트와 빨간 신발 이미지의 벡터가 유사함

### 3. **벡터 스토어 (ChromaDB)**
- 텍스트를 벡터로 변환하여 저장
- 유사도 검색: 코사인 유사도 계산

### 4. **LLM (Large Language Model)**
- GPT 계열 모델
- 대화 컨텍스트를 이해하고 자연스러운 응답 생성

### 5. **RAG (Retrieval Augmented Generation)**
```
검색 (Retrieval) + 생성 (Generation)
= 검색된 상품 정보를 LLM이 참고하여 답변 생성
```

---

## 성능 최적화 기법

1. **GPU 가속**
   ```python
   device = "cuda" if torch.cuda.is_available() else "cpu"
   model.to(device)
   ```

2. **메모리 절약 (FP16)**
   ```python
   torch_dtype=torch.float16  # 32비트 → 16비트
   ```

3. **토큰 관리**
   - 대화 히스토리가 길어지면 오래된 메시지 자동 제거
   - 토큰 수 제한으로 메모리 초과 방지

4. **API 호출 제한**
   - 무료 API는 일일 호출 제한이 있음
   - 초과 시 벡터 DB로 대체

---

## 문제 해결 팁

### 1. YOLO 탐지가 안 됨
```python
# 신뢰도 임계값 낮추기
results = models['yolo'](image, conf=0.3)  # 기본값 0.5
```

### 2. LLM 응답이 이상함
```python
# temperature 조절 (0~1)
temperature=0.5  # 더 보수적인 답변
temperature=0.9  # 더 창의적인 답변
```

### 3. 메모리 부족
```python
# 배치 크기 줄이기, FP16 사용, 모델 양자화
```

---

## 확장 가능 기능

1. **이미지 유사도 검색**
   - CLIP 특징 벡터로 비슷한 이미지 찾기

2. **가격 필터링**
   - "10만원 이하 신발" 검색

3. **브랜드 선호도 학습**
   - 사용자가 자주 보는 브랜드 기억

4. **멀티모달 검색**
   - "이 셔츠와 어울리는 바지" (이미지 + 텍스트)

---

## 참고 자료

- [YOLO 공식 문서](https://docs.ultralytics.com/)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [LangChain 문서](https://python.langchain.com/)
- [Gradio 문서](https://www.gradio.app/docs/)

