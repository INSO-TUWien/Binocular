'use strict';

import _ from 'lodash';
import debug from 'debug';

const log = debug('paginator');

function Paginator(
  getPage: (page: number, perPage: number) => Promise<any>,
  getItems: (resp: any) => any,
  getCount: (resp: any) => number,
  options: any
) {
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
  this.its = options?.its;
  this.defaultPageSize = options.defaultPageSize;
}

Paginator.prototype.addEventListener = Paginator.prototype.on = function (name: string, fn: any) {
  this.handlers[name].push(fn);
  return this;
};

Paginator.prototype.removeEventListener = Paginator.prototype.off = function (name: string, fn: any) {
  _.pull(this.handlers[name], fn);
  return this;
};

Paginator.prototype.once = function (name: string, fn: any) {
  const self = this;
  const handler = function () {
    self.off(name, handler);
    return fn(...arguments);
  };

  return this.on(name, handler);
};

Paginator.prototype.emit = function (name: string /*, rest... */) {
  const handlers = this.handlers[name];

  return Promise.all(handlers.map((handler: any) => handler(...Array.prototype.slice.call(arguments, 1))));
};

Paginator.prototype.execute = function (perPage = this.defaultPageSize) {
  const countHolder: any = { count: null };

  this.once('page', (firstPage: any) => {
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

Paginator.prototype.$depaginate = function (perPage: number, countHolder: { count: number }, page = 1, processed = 0, i = 0) {
  if (this.its && i === 0) {
    page--;
  }
  return this.getPage(page, perPage)
    .then((pageData: any) => {
      this.emit('page', pageData, page);
      return pageData;
    })
    .then((page: any) => this.getItems(page))
    .then((items: any[]) => {
      if (this.its === 'jira') {
        log(`Got ${items.length} items from start_at ${page}`);
      }
      if (items.length === 0) {
        if (this.its === 'jira') {
          log(`Reached premature end of data at start_at #${page}`);
        }
        return false;
      }

      return items.map((item: any) => {
        if (this.its === 'jira') {
          log(`Processing start_at[${processed}]`);
        }
        processed++;
        if (processed <= countHolder.count) {
          return this.emit('item', item);
        } else {
          return false;
        }
      });
    })
    .then((stop: boolean) => {
      if (this.its === 'jira') {
        log(`Finished start_at #${page}, total items processed: ${processed}/${countHolder.count}`);
      }
      if (stop !== false && processed < countHolder.count && !this.its) {
        return this.$depaginate(perPage, countHolder, page + 1, processed);
      } else if (stop !== false && this.its) {
        i++;
        return this.$depaginate(perPage, countHolder, this.defaultPageSize * i, processed, i);
      }
      return stop;
    });
};

Paginator.prototype.pageSize = function (pageSize: number) {
  this.defaultPageSize = pageSize;
  return this;
};

Paginator.prototype.collect = function (fn: any) {
  const items: any[] = [];
  const collector = (item: any) => items.push(item);

  this.on('item', collector);

  return this.execute().then(() => {
    this.off('item', collector);
    return fn(items);
  });
};

Paginator.prototype.then = function (fn: any) {
  return this.execute().then(fn);
};

Paginator.prototype.map = function (fn: any) {
  return this.collect((items: any) => items).map(fn);
};

Paginator.prototype.each = function (fn: any) {
  this.on('item', fn);

  return new Promise((resolve) =>
    this.execute().then((resp: any) => {
      this.off('item', fn);
      resolve(resp);
    })
  );
};

Paginator.prototype.reduce = function (fn: any, initial: any) {
  let sum = initial;
  return this.each((item: any) => {
    return Promise.resolve(() => {
      return fn(sum, item);
    }).then((newSum) => {
      sum = newSum();
    });
  }).then(() => sum);
};

export default Paginator;
