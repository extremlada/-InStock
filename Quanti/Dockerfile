# Alap image: Python 3.10 és Node.js 18
FROM python:3.10-slim AS python-base
FROM node:18 AS node-base

# Környezetváltozók beállítása
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Munkakönyvtár létrehozása
WORKDIR /app

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