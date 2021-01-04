'use strict';

export default class IssueStream {
  constructor() {
    if (arguments.length === 1 && arguments[0] instanceof IssueStream) {
      this.copyCtor(arguments[0]);
    } else if (arguments.length >= 1) {
      this.init.apply(this, arguments);
    } else {
      throw new Error('invalid arguments!');
    }
  }

  init(ticketId, webUrl) {
    this.data = Object.freeze({
      ticketId,
      webUrl
    });
    this.__values = [];
  }

  copyCtor(data) {
    this.data = Object.freeze(Object.assign({}, data.data));
    this.__values = data.values;
  }

  prependCommit(sha) {
    this.__values = [this.createTicket(sha), ...this.__values];
    return this;
  }

  pushCommit(sha) {
    this.__values.push(this.createTicket(sha));
    return this;
  }

  pushCommits(shas) {
    shas.forEach(sha => this.__values.push(this.createTicket(sha)));
    return this;
  }

  setStart(date) {
    this.__start = this.createTicket(null, IssueStat.Open, date);
    return this;
  }

  setEnd(date) {
    this.__end = this.createTicket(null, IssueStat.Close, date);
    return this;
  }

  get values() {
    return this.__values.slice(0);
  }

  forEach(fn) {
    this.__values.forEach(fn);
  }

  find(fn) {
    return this.__values.find(fn);
  }

  map(fn) {
    return this.__values.map(fn);
  }

  get start() {
    return Object.assign({}, this.__start);
  }
  get end() {
    return Object.assign({}, this.__end);
  }

  createTicket(sha, status = IssueStat.None, date = null) {
    return {
      sha,
      status,
      date,
      values: []
    };
  }
}

/**
 * represents a build state enum
 *
 * @type {Readonly<{}>}
 */
export const IssueStat = Object.freeze(
  (() => {
    const plainEnum = {
      None: 0,
      Open: 1,
      Close: 2
    };
    const data = Object.keys(plainEnum).reduce((item, key) => {
      item[key] = { value: plainEnum[key], name: key };
      return item;
    }, {});

    data.valueOf = value => {
      const foundKey = Object.keys(data).find(item => data[item] === value || data[item].name === value || data[item].value === value);
      return foundKey ? data[foundKey] : data.None;
    };

    return data;
  })()
);
