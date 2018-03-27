'use strict';

const Promise = require('bluebird');
const IllegalArgumentError = require('../errors/IllegalArgumentError.js');

module.exports = class ModelCursor {
  constructor(Model, cursor) {
    this.Model = Model;
    this.cursor = cursor;
  }

  count() {
    return this.cursor.count(...arguments);
  }

  all() {
    return Promise.resolve(this.cursor.all(...arguments)).map(d => this.Model.parse(d));
  }

  next() {
    return Promise.resolve(this.cursor.next(...arguments)).then(data => {
      if (data) {
        return this.Model.parse(data);
      }
    });
  }

  hasNext() {
    return this.cursor.hasNext(...arguments);
  }

  each(fn) {
    const next = cur => {
      if (cur.hasNext()) {
        return cur.next().then(m => fn(m)).then(() => next(cur));
      }
    };

    return next(this);
  }

  every(/*fn*/) {
    throw IllegalArgumentError('Not yet supported!');
  }

  some(/*fn*/) {
    throw IllegalArgumentError('Not yet supported!');
  }

  map(/*fn*/) {
    throw IllegalArgumentError('Not yet supported!');
  }

  reduce(/*fn, accu*/) {
    throw IllegalArgumentError('Not yet supported!');
  }
};
