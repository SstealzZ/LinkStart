# Image de base Node.js
FROM node:latest

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers du frontend
COPY ./front_linkstart ./

# Installer les dépendances
RUN npm install

# Construire l'application React
RUN npm run build

# Installer serve globalement pour servir l'application build
RUN npm install -g serve

# Exposer le port 3000
EXPOSE 3000

# Lancer l'application
CMD ["serve", "-s", "build", "-l", "3000"]
