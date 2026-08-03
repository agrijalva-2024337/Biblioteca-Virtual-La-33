# Colocar en: Biblioteca 33/moderation-service/Dockerfile
# En Railway: Root Directory = "Biblioteca 33", Dockerfile Path = "moderation-service/Dockerfile"
FROM node:20-slim
WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install --omit=dev

COPY moderation-service ./moderation-service
RUN cd moderation-service && npm install --omit=dev

WORKDIR /app/moderation-service
EXPOSE 3000
# Con Dockerfile ya no hace falta el script "start" del package.json
CMD ["node", "index.js"]
