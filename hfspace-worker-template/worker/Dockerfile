FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN apt-get update && apt-get install -y git build-essential
RUN pip install --no-cache-dir -r worker/requirements.txt
ENV PORT=8080
EXPOSE 8080
CMD uvicorn worker.main:app --host 0.0.0.0 --port ${PORT}        