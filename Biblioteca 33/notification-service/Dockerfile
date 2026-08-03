# Colocar en: Biblioteca 33/notification-service/Dockerfile (reemplaza el existente)
# En Railway: Root Directory = "Biblioteca 33", Dockerfile Path = "notification-service/Dockerfile"
FROM node:20-slim
WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install --omit=dev

COPY notification-service ./notification-service
RUN cd notification-service && npm install --omit=dev

WORKDIR /app/notification-service
EXPOSE 3005
CMD ["node", "index.js"]
