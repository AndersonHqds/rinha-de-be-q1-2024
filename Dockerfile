FROM node:20.11.0-slim

WORKDIR /home/node/app

COPY package.json tsconfig.json global.d.ts package-lock.json ./

RUN npm install

COPY src ./

RUN npm run tsc

CMD ["node", "./build/index.js"]
