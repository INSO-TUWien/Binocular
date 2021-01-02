'use strict';

/**
 * represents the unchangeable river associated data
 */
export class RiverData {
  constructor() {
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
      this.copyCtor(arguments[0]);
    } else if (arguments.length >= 3) {
      this.init.apply(this, arguments);
    } else {
      throw new Error('invalid arguments!');
    }
  }

  init(date, attribute, name, sha = null, buildStat = 0, buildWeight = 1, additions = 0, deletions = 0, buildSuccessRate = 0.0) {
    this.data = Object.freeze({
      date,
      sha,
      attribute,
      name,
      additions,
      deletions,
      buildStat: BuildStat.valueOf(buildStat),
      buildWeight
    });
    this.buildSuccessRate = buildSuccessRate;
    this._trend = 0;
  }

  copyCtor(data) {
    this.data = Object.freeze(Object.assign({}, data.data, { buildStat: BuildStat.valueOf(data.buildStat) }));
    this.buildSuccessRate = data._buildSuccessRate;
  }

  get date() {
    return this.data.date;
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

  get buildWeight() {
    return this.data.buildWeight;
  }

  get additions() {
    return this.data.additions;
  }

  get deletions() {
    return this.data.deletions;
  }

  get totalDiff() {
    return this.data.additions + this.data.deletions;
  }

  get attribute() {
    return this.data.attribute;
  }

  get buildSuccessRate() {
    return this._buildSuccessRate;
  }

  set buildSuccessRate(buildSuccessRate) {
    this._buildSuccessRate = Number.isNaN(+buildSuccessRate) || isNaN(+buildSuccessRate) ? 0.0 : +buildSuccessRate;
  }

  get trend() {
    return this._trend;
  }

  set trend(value) {
    this._trend = Number.isNaN(+value) || isNaN(+value) ? 0.0 : +value;
  }

  equal(data) {
    return _.isEqual(this.data, data) || _.isEqual(this.data, (data || {}).data);
  }
}

/**
 * represents a build state enum
 *
 * @type {Readonly<{}>}
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
