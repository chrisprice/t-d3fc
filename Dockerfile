FROM node:slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY public src views index.js ./

ENV database=localhost

EXPOSE 3000

ENTRYPOINT node index.js
