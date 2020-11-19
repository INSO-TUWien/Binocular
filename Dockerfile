FROM node:14

RUN npm config -g set user root

ENV BUILD_DIR=/build
COPY .whalify $BUILD_DIR
WORKDIR $BUILD_DIR
RUN ./install.sh

EXPOSE 48763
