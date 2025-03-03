ARG PORT

FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]

