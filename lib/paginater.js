'use strict';

const _ = require('lodash');

function Paginator(getPage, getItems, getCount) {
  this.handlers = {
    count: [],
    page: [],
    item: [],
    end: []
  };

  this.getPage = getPage;
  this.getItems = getItems;
  this.getCount = getCount;
}

Paginator.prototype.addEventListener = Paginator.prototype.on = function(name, fn) {
  this.handlers[name].push(fn);
};

Paginator.prototype.removeEventListener = Paginator.prototype.off = function(name, fn) {
  _.remove(this.handlers[name], h => h === fn);
};

Paginator.prototype.once = function(name, fn) {
  const self = this;
  const handler = function() {
    self.off(handler);
    return fn(...arguments);
  };

  return this.on(name, handler);
};

Paginator.prototype.emit = function(name, data) {
  const handlers = this.handlers[name];

  return Promise.map(handlers, handler => handler(data));
};

Paginator.prototype.execute = function(perPage = 100) {
  let count;

  this.once('page', firstPage => {
    return Promise.try(() => this.getCount(firstPage)).then(_count => {
      count = _count;
      return this.emit('count', count);
    });
  });

  return this.$depaginate(perPage, count);
};

Paginator.prototype.$depaginate = function(perPage, count, page = 1, processed = 0) {
  return Promise.try(() => this.getPage(page, perPage))
    .tap(page => this.emit('page', page))
    .then(page => this.getItems(page))
    .then(items => {
      return each(items, (item, i) => {
        if (processed + i < count) {
          processed++;
          return this.emit('item', item);
        } else {
          return false;
        }
      });
    })
    .then(() => {
      if (processed < count) {
        return this.$depaginate(perPage, count, page + 1, processed);
      }
    });
};

function each(array, fn, i = 0) {
  if (i >= array.length) {
    return Promise.resolve(array);
  } else {
    const item = array[i];
    return Promise.try(() => fn(item, i)).then(ret => {
      if (ret !== false) {
        return each(array, fn, i + 1);
      }
    });
  }
}
