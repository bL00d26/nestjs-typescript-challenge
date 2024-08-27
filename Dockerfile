FROM node:18-alpine as base

WORKDIR /app

RUN npm install -g @nestjs/cli

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

CMD npm run start:prod

EXPOSE 3000