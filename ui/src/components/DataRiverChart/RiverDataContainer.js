'use strict';

/**
 * represents the processed river associated data
 */
export class RiverDataContainer {
  constructor() {
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
      this.copyCtor(arguments[0]);
    } else if (arguments.length >= 1) {
      this.init.apply(this, arguments);
    } else {
      throw new Error('invalid arguments!');
    }
  }

  init(key) {
    // leaf xor values
    this.data = {
      key,
      values: [],
      leaf: undefined,
    };
  }

  copyCtor(data) {
    this.data = Object.freeze(Object.assign({}, data.data));
  }

  get name() {
    return this.data.key;
  }

  get values() {
    return this.data.values;
  }

  set values(values) {
    this.data.values = values;
  }

  find(key) {
    return (this.data.values || []).find((item) => item.name === key);
  }

  indexOf(key) {
    return (this.data.values || []).map((item) => item.name).indexOf(key);
  }

  getValue(key) {
    let value = this.find(key);
    if (!this.data.leaf && !value) {
      value = new RiverDataContainer(key);
      this.values.push(value);
      delete this.data.leaf;
    }
    return value;
  }

  set value(data) {
    if ((this.values || []).length) {
      return;
    }
    delete this.data.values;
    this.data.leaf = data;
  }

  get value() {
    return this.data.leaf;
  }

  get grouped() {
    if (!this.values) {
      return this.value;
    }
    return this.values.map((container) => container.grouped);
  }

  forEach(cb) {
    this.values.forEach(cb);
  }

  get length() {
    return this.data.leaf ? 1 : this.values.length;
  }
}
