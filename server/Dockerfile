FROM node:slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./
RUN npm run build

ENV NODE_ENV=production
ENV database=localhost
EXPOSE 3000

ENTRYPOINT node index.js
