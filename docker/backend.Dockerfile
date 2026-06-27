FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Seed data on startup and run server
CMD ["sh", "-c", "python -m app.db.init_db && python -m app.db.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
