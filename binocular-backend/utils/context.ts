'use strict';

import express from 'express';
import cors from 'cors';
import _ from 'lodash';
import { Server, Socket } from 'socket.io';
import http from 'http';
import bodyParser from 'body-parser';
import ee from 'event-emitter';
import debug from 'debug';
const log = debug('context');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { path: '/wsapi' });

const sockets: Socket[] = [];

io.on('connection', function (socket) {
  sockets.push(socket);
  socket.on('close', function () {
    _.remove(sockets, (s) => s === socket);
  });
});

app.use(cors());
app.use(bodyParser.json());
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const context = ee();

let quitRequested = false;

function setOptions(options: {
  backend: boolean;
  frontend: boolean;
  open: boolean;
  clean: boolean;
  its: boolean;
  ci: boolean;
  export: boolean;
  server: boolean;
}) {
  this.argv = options;
}
function setTargetPath(path: string) {
  this.targetPath = path;
}

const fields = {
  app,
  argv: undefined,
  httpServer,
  targetPath: undefined,
  models: {},
  io,
  setOptions,
  setTargetPath,
  isStopping: () => quitRequested,
  quit: () => {
    httpServer.close();
    _.each(sockets, (s) => s.disconnect());
    io.close();

    quitRequested = true;
  },
};

context.on('bound', (e: string) => log('Bound:', e));

_.merge(context, fields);

export default new Proxy(context, {
  set: function (obj: any, prop: string, value) {
    if (!_.includes(_.keys(ee.prototype), prop)) {
      obj[prop] = value;
      process.nextTick(function () {
        context.emit('bound', { property: prop, value: value });
        context.emit(`bound:${prop}`, value);
      });
    }

    return true;
  },
});
