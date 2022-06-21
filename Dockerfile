FROM docker.fylr.io/fylr-priv/fylr-server-docker-dependencies:latest

LABEL maintainer="Leon Steinhäuser <leon.steinhaeuser@fylr.io>"

RUN apk update && \
    apk upgrade && \
    apk --no-cache add --update nodejs nodejs-npm make && \
    npm install -g coffee-script@1.12.7

RUN mkdir -p /srv/fylr-plugin-build

ADD . /srv/fylr-plugin-build

WORKDIR /srv/fylr-plugin-build

RUN make build && cp -r build/ /srv/fylr-plugins