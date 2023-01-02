'use strict';

const astJava = require('../ast/astJava');
const astJavascript = require('../ast/astJavascript');

module.exports = function(req, res) {
    switch (req.body.type) {
        case 'java': {
          let data = astJava.ast_java(req.body.content);
          res.send(data);
        }
          break;
        case 'js': {
          let data = astJavascript.ast_javascript(req.body.content);
          res.send(data);
        }
          break;
        default: break;
      }
};
