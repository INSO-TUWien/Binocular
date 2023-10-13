'use strict';

import _ from 'lodash';
import debug from 'debug';

const log = debug('paginator');

function Paginator(getPage, getItems, getCount, options) {
  options = _.defaults({}, options, { defaultPageSize: 100 });
  this.handlers = {
    count: [],
    page: [],
    item: [],
    end: [],
  };

  this.getPage = getPage;
  this.getItems = getItems;
  this.getCount = getCount;
  this.defaultPageSize = options.defaultPageSize;
}

Paginator.prototype.addEventListener = Paginator.prototype.on = function (name, fn) {
  this.handlers[name].push(fn);
  return this;
};

Paginator.prototype.removeEventListener = Paginator.prototype.off = function (name, fn) {
  _.pull(this.handlers[name], fn);
  return this;
};

Paginator.prototype.once = function (name, fn) {
  const self = this;
  const handler = function () {
    self.off(name, handler);
    return fn(...arguments);
  };

  return this.on(name, handler);
};

Paginator.prototype.emit = function (name /*, rest... */) {
  const handlers = this.handlers[name];

  return Promise.all(handlers.map((handler) => handler(...Array.prototype.slice.call(arguments, 1))));
};

Paginator.prototype.execute = function (perPage = this.defaultPageSize) {
  const countHolder = { count: null };

  this.once('page', (firstPage) => {
    try {
      return Promise.resolve(this.getCount(firstPage)).then((count) => {
        countHolder.count = count;
        log(`Determined total item count: ${count}`);
        return this.emit('count', count);
      });
    } catch (e) {
      return this.emit('count', 0);
    }
  });

  return this.$depaginate(perPage, countHolder);
};

Paginator.prototype.$depaginate = function (perPage, countHolder, page = 1, processed = 0) {
  log(`Getting page ${page}`);
  return this.getPage(page, perPage)
    .then((pageData) => {
      this.emit('page', pageData, page);
      return pageData;
    })
    .then((page) => this.getItems(page))
    .then((items) => {
      log(`Got ${items.length} items from page ${page}`);

      if (items.length === 0) {
        log(`Reached premature end of data at empty page #${page}`);
        return false;
      }

      return items.map((item) => {
        log(`Processing page[${processed}]`);
        processed++;
        if (processed <= countHolder.count) {
          return this.emit('item', item);
        } else {
          return false;
        }
      });
    })
    .then((stop) => {
      log(`Finished page #${page}, total items processed: ${processed}/${countHolder.count}`);
      if (stop !== false && processed < countHolder.count) {
        return this.$depaginate(perPage, countHolder, page + 1, processed);
      }
      return stop;
    });
};

Paginator.prototype.pageSize = function (pageSize) {
  this.defaultPageSize = pageSize;
  return this;
};

Paginator.prototype.collect = function (fn) {
  const items = [];
  const collector = (item) => items.push(item);

  this.on('item', collector);

  return this.execute().then(() => {
    this.off('item', collector);
    return fn(items);
  });
};

Paginator.prototype.then = function (fn) {
  return this.execute().then(fn);
};

Paginator.prototype.map = function (fn) {
  return this.collect((items) => items).map(fn);
};

Paginator.prototype.each = function (fn) {
  this.on('item', fn);

  return new Promise((resolve) =>
    this.execute().then((resp) => {
      this.off('item', fn);
      resolve(resp);
    })
  );
};

Paginator.prototype.reduce = function (fn, initial) {
  let sum = initial;
  return this.each((item) => {
    return Promise.resolve(() => {
      return fn(sum, item);
    }).then((newSum) => {
      sum = newSum();
    });
  }).then(() => sum);
};

export default Paginator;
