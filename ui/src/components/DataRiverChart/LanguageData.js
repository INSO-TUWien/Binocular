'use strict';

export default class LanguageData {
  constructor() {
    if (arguments.length === 1 && arguments[0] instanceof LanguageData) {
      this.copyCtor(arguments[0]);
    } else if (arguments.length >= 3) {
      this.init.apply(this, arguments);
    } else {
      throw new Error('invalid arguments!');
    }
  }

  init(name, alias, color, containsPopular) {
    this.data = Object.freeze({
      name,
      color
    });
    this.__alias = [];
    this.__containsPopular = containsPopular;
  }

  copyCtor(data) {
    this.data = Object.freeze(Object.assign({}, data.data));
  }

  stack(language) {
    if (language instanceof LanguageData) {
      this.__containsPopular = this.__containsPopular || language.containsPopular;
      this.__alias.push(language.name);
    } else {
      this.__alias.push(language);
    }
  }

  get containsPopular() {
    return this.__containsPopular;
  }
}
