'use strict';

export default class IssueStream {
  constructor() {
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
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
      date
    };
  }
}

/**
 * represents a build state enum
 *
 * @type {Readonly<{}>}
 */
const IssueStat = Object.freeze(
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
