'use strict';

import { hash } from '../../utils/crypto-utils';

export default class StreamKey {
  constructor(node) {
    this.data = Object.freeze(Object.assign({}, node && node.data ? node.data : node));
    this.direction = node.direction || '';
  }

  get name() {
    return this.data.name;
  }

  get attribute() {
    return this.data.attribute;
  }

  set direction(value) {
    if (value) {
      this._direction = value;
    }
  }

  get direction() {
    return this._direction;
  }

  equal(item) {
    return (
      this === item ||
      !Object.keys(this)
        .filter((key) => typeof this[key] === 'function')
        .find((key) => this[key] !== item[key])
    );
  }
  eqPrimKey(item) {
    return this === item || (this.name === item.name && this.attribute === item.attribute);
  }
  toString() {
    return `${this.direction}-${this.attribute}-${this.name}`;
  }
  async toId() {
    return await hash(this.toString());
  }
}
