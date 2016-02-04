FROM node:slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY public public
COPY src src
COPY views views
COPY index.js ./

ENV database=localhost

EXPOSE 3000

ENTRYPOINT node index.js
