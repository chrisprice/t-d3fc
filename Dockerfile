FROM node:slim
WORKDIR /app
COPY node_modules node_modules
COPY public public
COPY views views
COPY index.js index.js
EXPOSE 3000
ENTRYPOINT node index.js
