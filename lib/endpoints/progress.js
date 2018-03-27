'use strict';

module.exports = function(ws /*, req*/) {
  ws.on('message', function(msg) {
    ws.send(msg);
  });
};
