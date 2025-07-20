# Alap image: Python
FROM python:3.10-slim

# Node.js + build toolchain
RUN apt-get update && apt-get install -y \
    curl \
    pkg-config \
    libmariadb-dev \
    libpq-dev \
    build-essential \
    nodejs \
    npm \
    && apt-get clean

# Környezet
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Alkalmazás gyökérkönyvtára
WORKDIR /app

# Függőségek telepítése
COPY requirements.txt ./
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Frontend buildelése
WORKDIR /app/ui
COPY ui/ ./
RUN npm install --legacy-peer-deps
RUN npm run build

# A build fájlokat átmásoljuk a Django által használt mappába
WORKDIR /app
COPY . ./

# Másoljuk át a frontend build fájlokat a Django static mappába
RUN mkdir -p /app/static && cp -r /app/ui/static/* /app/static/

# Statikus fájlok gyűjtése
RUN python manage.py collectstatic --noinput

# Port
EXPOSE 8000

# Futás Gunicorn-nal
CMD ["gunicorn", "Quanti.wsgi:application", "--bind", "0.0.0.0:8000"]
