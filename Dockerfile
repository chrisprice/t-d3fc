FROM node:slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY server server
COPY public public

RUN npm run build

ENV database=localhost

EXPOSE 3000

ENTRYPOINT node server/index.js
