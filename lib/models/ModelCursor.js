'use strict';

const Promise = require('bluebird');

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
    return Promise.resolve(this.cursor.next(...arguments)).then(function(data) {
      if (data) {
        return this.Model.parse(data);
      }
    });
  }

  hasNext() {
    return this.cursor.hasNext(...arguments);
  }

  each(fn) {
    return Promise.resolve(this.cursor.each(this.wrapIterator(fn)));
  }

  every(fn) {
    return Promise.resolve(this.cursor.every(this.wrapIterator(fn)));
  }

  some(fn) {
    return Promise.resolve(this.cursor.some(this.wrapIterator(fn)));
  }

  map(fn) {
    return Promise.all(this.cursor.map(this.wrapIterator(fn)));
  }

  reduce(fn, accu) {
    const wrappedFn = (accu, raw, index) => fn(accu, this.Model.parse(raw), index, this);
    return Promise.resolve(this.cursor.reduce(wrappedFn, accu));
  }

  wrapIterator(fn) {
    return (raw, index) => fn(this.Model.parse(raw), index, this);
  }
};
