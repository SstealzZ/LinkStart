# Image de base Python
FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances nécessaires
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && apt-get clean

# Copier les fichiers de l'API
COPY ./api ./

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Exposer le port 8000
EXPOSE 8000

# Lancer l'application avec uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
