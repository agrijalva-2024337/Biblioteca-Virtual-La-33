# Colocar en: Biblioteca 33/ai-service/Dockerfile
# En Railway: Root Directory = "Biblioteca 33", Dockerfile Path = "ai-service/Dockerfile"
FROM node:20-slim
WORKDIR /app

# shared/ se copia primero: varios servicios la usan vía import relativo (../../shared/...)
COPY shared ./shared
RUN cd shared && npm install --omit=dev

# código propio del servicio
COPY ai-service ./ai-service
RUN cd ai-service && npm install --omit=dev

WORKDIR /app/ai-service
EXPOSE 3001
CMD ["node", "index.js"]
