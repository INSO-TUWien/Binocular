'use strict';

import { createEnum } from '../../utils/Enum';

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
      webUrl,
    });
    this.__values = [];
  }

  copyCtor(data) {
    this.data = Object.freeze(Object.assign({}, data.data));
    this.__values = data.__values.map((issue) => new IssueData(issue));
    this.__start = data.start;
    delete this.__start.__values;
    this.__end = data.end;
    delete this.__end.__values;
  }

  prependCommit(sha) {
    this.__values = [new IssueData(sha), ...this.__values];
    return this;
  }

  pushCommit(sha) {
    this.__values.push(new IssueData(sha, IssueStat.InProcess));
    return this;
  }

  pushCommits(commits) {
    commits.forEach((commit) => this.__values.push(new IssueData(commit.sha, IssueStat.InProgress, commit.webUrl)));
    return this;
  }

  setStart(dateValue) {
    if (!dateValue) {
      return;
    }
    const date = dateValue instanceof Date ? dateValue : Date.parse(dateValue);
    this.__start = new IssueData(null, IssueStat.Open, this.webUrl, isNaN(date) ? new Date(dateValue) : date);
    delete this.__start.__values;
    return this;
  }

  setEnd(dateValue) {
    if (!dateValue) {
      return;
    }
    const date = dateValue instanceof Date ? dateValue : Date.parse(dateValue);
    this.__end = new IssueData(null, IssueStat.Close, this.webUrl, isNaN(date) ? new Date(dateValue) : date);
    delete this.__end.__values;
    return this;
  }

  get isClosed() {
    return this.__end && this.__end.status !== IssueStat.None;
  }

  get ticketId() {
    return this.data.ticketId;
  }

  get webUrl() {
    return this.data.webUrl;
  }

  get start() {
    return new IssueData(this.__start);
  }

  get end() {
    return new IssueData(this.__end);
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
}

export class IssueData {
  constructor() {
    if (arguments.length === 1 && arguments[0] instanceof IssueData) {
      this.copyCtor(arguments[0]);
    } else if (arguments.length >= 1) {
      this.init.apply(this, arguments);
    } else {
      throw new Error('invalid arguments!');
    }
  }

  init(sha, status = IssueStat.None, webUrl = '#', date = null) {
    this.data = Object.freeze({
      sha,
      status,
      webUrl,
      date,
    });
    this.values = [];
  }

  copyCtor(data) {
    this.data = Object.freeze(Object.assign({}, data.data));
    this.values = data.values.slice(0);
  }

  get sha() {
    return this.data.sha;
  }

  get status() {
    return this.data.status;
  }

  get date() {
    return this.data.date;
  }

  get webUrl() {
    return this.data.webUrl;
  }
}

export class IssueColor {
  constructor(ticket) {
    this.data = Object.freeze(Object.assign({ ticket }, arguments));

    const create = (name, key) =>
      Object.defineProperty(this, name, {
        get: function () {
          return this.data[key];
        },
      });

    create('ticket', 0);
    Object.keys(IssueStat).map((key, i) => i && create(IssueStat[key].name, i));
  }
}

/**
 * represents a build state enum
 */
export const IssueStat = createEnum(['None', 'Open', 'In Progress', 'Close']);
