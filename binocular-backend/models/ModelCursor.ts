'use strict';

import IllegalArgumentError from '../errors/IllegalArgumentError.js';
import Model from './Model';
import Connection from './Connection';

export default class ModelCursor {
  private Model: any;
  private cursor: any;
  constructor(Model: Model | Connection, cursor: any) {
    this.Model = Model;
    this.cursor = cursor;
  }

  count() {
    return this.cursor.count(...arguments);
  }

  async all() {
    const ds = await Promise.resolve(this.cursor.all(...arguments));
    return await ds.map((d) => this.Model.parse(d));
  }

  async next() {
    const data = await Promise.resolve(this.cursor.next(...arguments));
    if (data) {
      return this.Model.parse(data);
    }
  }

  hasNext() {
    return this.cursor.hasNext(...arguments);
  }

  each(fn: (m: any) => any) {
    const next = (cur: ModelCursor) => {
      if (cur.hasNext()) {
        return cur
          .next()
          .then((m) => fn(m))
          .then(() => next(cur));
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
}