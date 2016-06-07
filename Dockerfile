FROM debian:jessie-backports
RUN apt-get update && apt-get install -y nodejs npm wget
RUN sed -i 's/jessie main/jessie main contrib non-free/g' /etc/apt/sources.list
RUN apt-get update && apt-get install -y ffmpeg libfaac0

RUN npm install -g n
RUN n stable

RUN mkdir /source
WORKDIR /source
COPY build .
COPY out/* ./
COPY package.json ./package.json
RUN npm install

CMD ["node", "server.js"]
