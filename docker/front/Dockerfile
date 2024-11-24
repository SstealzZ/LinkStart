# Étape de construction
FROM node:18 as build-stage

# Définir le répertoire de travail
WORKDIR /app

# Copier tous les fichiers du frontend
COPY ./front_linkstart ./

# Définir les arguments de construction
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_AUTH_LOGIN_ENDPOINT
ARG REACT_APP_AUTH_REGISTER_ENDPOINT
ARG REACT_APP_AUTH_ME_ENDPOINT
ARG REACT_APP_AUTH_REFRESH_ENDPOINT
ARG REACT_APP_SERVICES_ENDPOINT
ARG REACT_APP_PING_ENDPOINT
ARG REACT_APP_TITLE
ARG REACT_APP_DESCRIPTION

# Définir les variables d'environnement pour le build
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_AUTH_LOGIN_ENDPOINT=${REACT_APP_AUTH_LOGIN_ENDPOINT}
ENV REACT_APP_AUTH_REGISTER_ENDPOINT=${REACT_APP_AUTH_REGISTER_ENDPOINT}
ENV REACT_APP_AUTH_ME_ENDPOINT=${REACT_APP_AUTH_ME_ENDPOINT}
ENV REACT_APP_AUTH_REFRESH_ENDPOINT=${REACT_APP_AUTH_REFRESH_ENDPOINT}
ENV REACT_APP_SERVICES_ENDPOINT=${REACT_APP_SERVICES_ENDPOINT}
ENV REACT_APP_PING_ENDPOINT=${REACT_APP_PING_ENDPOINT}
ENV REACT_APP_TITLE=${REACT_APP_TITLE}
ENV REACT_APP_DESCRIPTION=${REACT_APP_DESCRIPTION}

# Installer les dépendances
RUN npm install

# Construire l'application React
RUN npm run build

# Étape de production
FROM node:18-alpine

# Définir le répertoire de travail pour la production
WORKDIR /app

# Copier les fichiers construits depuis l'étape de build
COPY --from=build-stage /app/build /app/build

# Installer `serve` globalement
RUN npm install -g serve

# Exposer le port 3000
EXPOSE 3000

# Lancer l'application avec `serve`
CMD ["serve", "-s", "build", "-l", "3000"]
