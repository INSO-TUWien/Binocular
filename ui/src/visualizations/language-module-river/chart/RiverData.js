'use strict';

/**
 * represents the unchangeable river associated data
 */
export class RiverData {
  constructor() {
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
      this.copyCtor(arguments[0]);
    } else if (arguments.length >= 2) {
      this.init.apply(this, arguments);
    } else {
      throw new Error('invalid arguments!');
    }
  }

  init(sha, attribute, name = '', buildStat = 0, additions = 0, deletions = 0) {
    this.data = Object.freeze({
      sha,
      attribute,
      name,
      additions,
      deletions,
      buildStat: BuildStat.valueOf(buildStat)
    });
  }

  copyCtor(data) {
    this.data = Object.freeze(Object.assign({}, data.data, { buildStat: BuildStat.valueOf(data.buildStat) }));
  }

  get name() {
    return this.data.name;
  }

  get sha() {
    return this.data.sha;
  }

  get buildStat() {
    return this.data.buildStat;
  }

  get additions() {
    return this.data.additions;
  }

  get deletions() {
    return this.data.deletions;
  }

  get attribute() {
    return this.data.attribute;
  }
}

/**
 * represents a build state enum
 *
 * @type {unknown[]}
 */
export const BuildStat = Object.freeze(
  (() => {
    const plainEnum = {
      None: 0,
      Abort: 1,
      Failed: 2,
      Success: 4,
      Skipped: 8
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
