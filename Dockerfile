FROM node:10

WORKDIR /opt/app

COPY . /opt/app

RUN npm install --only=production
