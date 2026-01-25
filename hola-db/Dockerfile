FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY index.js ./

# Crear carpeta donde irá la BD
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["npm", "start"]
