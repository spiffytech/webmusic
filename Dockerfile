FROM risingstack/alpine:3.3-v6.2.0-3.6.0

RUN apk update && apk add ffmpeg python-dev make g++

RUN mkdir /app

COPY . /app
WORKDIR /app
ENV NODE_ENV=dev
RUN npm install
RUN npm run prepublish
RUN npm prune --production

ENV NODE_ENV=production
CMD ["sh", "-c", "node out/server.js"]
