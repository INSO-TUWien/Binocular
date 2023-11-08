'use strict';

import _ from 'lodash';
import { createEnum } from '../../utils/Enum';

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

  init(date, attribute, name, shas = [], buildStat = 0, buildWeight = 1, additions = 0, deletions = 0, buildSuccessRate = 0.0) {
    this.data = Object.freeze({
      date,
      shas,
      attribute,
      name,
      additions,
      deletions,
      buildStat: BuildStat.valueOf(buildStat),
      buildWeight,
    });
    this.buildSuccessRate = buildSuccessRate;
    this._trend = 0;
  }

  copyCtor(data) {
    this.data = Object.freeze(Object.assign({}, data.data, { buildStat: BuildStat.valueOf(data.data.buildStat) }));
    this.buildSuccessRate = data._buildSuccessRate;
    this.trend = data._trend;
  }

  get date() {
    return this.data.date;
  }

  get name() {
    return this.data.name;
  }

  get shas() {
    return this.data.shas;
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
 */
export const BuildStat = createEnum(['None', 'Skipped', 'Cancelled', 'Failed', 'Errored', 'Success']);
