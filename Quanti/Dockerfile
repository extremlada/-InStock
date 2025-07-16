# Alap image: Python 3.10-slim
FROM python:3.10-slim

# Node.js és szükséges rendszerkönyvtárak telepítése
RUN apt-get update && apt-get install -y \
    curl \
    pkg-config \
    libmariadb-dev \
    libpq-dev \
    build-essential \
    nodejs \
    && apt-get clean

# Környezetváltozók beállítása
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Munkakönyvtár létrehozása
WORKDIR /app

# Pip frissítése
RUN pip install --upgrade pip

# Python függőségek telepítése
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Frontend buildelése
WORKDIR /app/ui
COPY ui/package.json ui/package-lock.json ./
RUN npm install --legacy-peer-deps
RUN npm run build

# Visszaállás a Python munkakönyvtárba
WORKDIR /app

# Statikus fájlok gyűjtése
COPY . /app/
RUN python manage.py collectstatic --noinput

# Port beállítása
EXPOSE 8000

# Django alkalmazás futtatása
CMD ["gunicorn", "Quanti.wsgi:application", "--bind", "0.0.0.0:8000"]