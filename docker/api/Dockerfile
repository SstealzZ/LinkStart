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


# Configurer les variables d'environnement
ENV MONGO_URI=${MONGO_URI}
ENV DB_NAME=${DB_NAME}
ENV JWT_SECRET_KEY=${JWT_SECRET_KEY}
ENV JWT_ALGORITHM=${JWT_ALGORITHM}
ENV JWT_ACCESS_TOKEN_EXPIRE_MINUTES=${JWT_ACCESS_TOKEN_EXPIRE_MINUTES}
ENV FRONTEND_URL=${FRONTEND_URL}

# Exposer le port 8000
EXPOSE 8000

# Lancer l'application avec uvicorn
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
