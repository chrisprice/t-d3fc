FROM node:slim
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY public public
COPY src src
COPY views views
COPY index.js index.js
EXPOSE 3000
ENTRYPOINT node index.js
