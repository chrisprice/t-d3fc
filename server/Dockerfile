FROM node:slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./
RUN npm run build

ENV NODE_ENV=production
ENV database=localhost
ENV gif_target=http://web/
ENV gif_service=http://gif/
ENV gif_dir=/app/gifs
VOLUME /app/gifs
EXPOSE 3000

ENTRYPOINT node index.js
