# Colocar en: Biblioteca 33/files-service/Dockerfile (reemplaza el existente)
# En Railway: Root Directory = "Biblioteca 33", Dockerfile Path = "files-service/Dockerfile"
FROM node:20-slim
WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install --omit=dev

COPY files-service ./files-service
RUN cd files-service && npm install --omit=dev

WORKDIR /app/files-service
EXPOSE 3003
CMD ["node", "src/app.js"]
