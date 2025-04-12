# Python image
FROM python:3.10-slim

# Workdir
WORKDIR /app

# Requirements varsa yüklə
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Layihə fayllarını konteynerə köçür
COPY . .

# Port müəyyən et (opsional - info məqsədi ilə)
EXPOSE 8000

# Başlanğıc komanda (docker-compose verirsə, bu sətir ignore olunur)
CMD ["python", "auth.py"]
