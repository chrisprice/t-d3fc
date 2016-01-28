FROM node:slim
WORKDIR /app
COPY * /app/
EXPOSE 3000
ENTRYPOINT node index.js
