# Usa una imagen base oficial de Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copia los archivos de dependencias
COPY package.json package-lock.json* ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Construye el cliente y el servidor
RUN npm run build

# Usa una imagen más ligera para producción
FROM node:20-alpine AS runner

WORKDIR /app

# Copia solo los archivos necesarios desde el builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared

# Expone el puerto (ajusta si usas otro)
EXPOSE 5000

# Variable de entorno para producción
ENV NODE_ENV=production

# Comando para iniciar la app
CMD ["node", "dist/index.js"]