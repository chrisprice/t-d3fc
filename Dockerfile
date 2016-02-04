FROM node:slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY public src views index.js ./

ENV database=postgres

EXPOSE 3000

ENTRYPOINT node index.js
