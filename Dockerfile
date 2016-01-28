FROM node:slim
WORKDIR /app
COPY * /app/
EXPOSE 8080
ENTRYPOINT node index.js
