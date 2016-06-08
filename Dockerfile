FROM risingstack/alpine:3.3-v6.2.0-3.6.0

RUN apk update && apk add ffmpeg python-dev make g++

RUN mkdir /source
RUN mkdir /build

COPY . /build
WORKDIR /build
ENV NODE_ENV=dev
RUN npm install; true
RUN npm run prepublish
RUN ls
RUN cp -R package.json build out/* /source

WORKDIR /source
ENV NODE_ENV=production
RUN npm install --production

CMD ["node", "server.js"]
