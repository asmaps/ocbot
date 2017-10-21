FROM node:alpine
MAINTAINER Arne Schauf <docker@asw.io>

RUN mkdir /opt/code
RUN chown 1000:1000 /opt/code

USER 1000
COPY package.json /opt/code/
WORKDIR /opt/code
RUN npm install
COPY . /opt/code

CMD ["npm", "start"]
