FROM python:3.11.1

# /app 폴더 만들기
WORKDIR /app

# 프로젝트파일들을 /app 디렉토리로 복사
COPY . /app

# requirements.txt 를 보고 모듈 전체 설치(-r)
RUN pip install --no-cache-dir -r /app/requirements.txt


# 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]