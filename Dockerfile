FROM private.docker.fylr.io/fylr/fylr-server-docker-dependencies:latest

LABEL maintainer="Leon Steinhäuser <leon.steinhaeuser@fylr.io>"

RUN mkdir -p /srv/fylr-plugins

ADD . /srv/fylr-plugins

WORKDIR /srv/fylr-plugins