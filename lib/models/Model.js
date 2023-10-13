/* eslint-disable no-setter-return */
'use strict';

import _ from 'lodash';
import debug from 'debug';
import inflection from 'inflection';

import * as IllegalArgumentError from '../errors/IllegalArgumentError.js';
import ctx from '../context.js';
import ModelCursor from './ModelCursor.js';

class Model {}

Model.define = function (name, options) {
  options = _.defaults({}, options, { attributes: [], keyAttribute: '_key' });

  const attributes = options.attributes;

  const ModelClass = class extends Model {
    constructor(data, options) {
      super(arguments);
      this.data = _.defaults({}, data);
      this.ModelClass = ModelClass;
      options = _.defaults({}, options, { isNew: true, ignoreUnknownAttributes: false });

      this.isNew = options.isNew;

      _.each(_.keys(data), function (key) {
        if (!_.includes(attributes, key)) {
          ModelClass.log(`${key} is not a valid data property for model ${name}`);

          if (!options.ignoreUnknownAttributes) {
            throw new IllegalArgumentError(`${key} is not a valid data property for model ${name}`);
          }
        }
      });
    }

    static get name() {
      return name;
    }

    static findById(id) {
      this.log('findById %o', id);
      return Promise.resolve(this.collection.lookupByKeys([id.toString()])).then(function (docs) {
        if (docs.length > 0) {
          return ModelClass.parse(docs[0]);
        }

        return null;
      });
    }

    static ensureCollection() {
      return this.db.ensureCollection(this.collectionName);
    }

    static create(data, options) {
      const instance = new ModelClass(data, options);
      return instance.save();
    }

    static bulkCreate(datas) {
      ModelClass.log('bulkCreate %o items', datas.length);
      return ModelClass.collection.import(datas).then(function () {
        return datas.map((data) => ModelClass.parse(data));
      });
    }

    static ensure(data) {
      const instance = new ModelClass(data);
      return instance.ensure();
    }

    static parse(data) {
      if (data === null) {
        return null;
      }

      const instance = new ModelClass(_.pick(data, ...attributes), { isNew: false });
      instance._id = data._id;
      instance._key = data._key;

      return instance;
    }

    static wrapCursor(rawCursor) {
      return new ModelCursor(ModelClass, rawCursor);
    }

    static cursor(query) {
      if (!query) {
        return Promise.resolve(ModelClass.collection.all()).then((rawCursor) => ModelClass.wrapCursor(rawCursor));
      } else {
        return Promise.resolve(ModelClass.rawDb.query(query)).then((rawCursor) => ModelClass.wrapCursor(rawCursor));
      }
    }

    static findAll() {
      return Promise.resolve(ModelClass.collection.all())
        .then((cursor) => cursor.all())
        .then((ds) => ds.map((d) => ModelClass.parse(d)));
    }

    save() {
      ModelClass.log('save %o', this.data);
      const self = this;

      if (this.isNew) {
        self.justCreated = true;
        return Promise.resolve(ModelClass.collection.save(_.defaults({ _key: this._key }, this.data)))
          .catch(() => {
            self.justCreated = false;
            self.justUpdated = false;
            return this.ensure();
          })
          .then(function (resp) {
            self._key = resp._key;
            self._id = resp._id;
            self.isNew = false;

            return self;
          });
      } else {
        self.justUpdated = true;
        return Promise.resolve(ModelClass.collection.update(this._key, this.data))
          .catch(() => {
            self.justCreated = false;
            self.justUpdated = false;
            return this.ensure();
          })
          .then(function (resp) {
            self._key = resp._key;
            self._id = resp._id;
            self.isNew = false;

            return self;
          });
      }
    }

    ensure() {
      return ModelClass.findById(this._key).then((instance) => {
        if (instance) {
          instance.isStored = true;
          return instance;
        } else {
          return this.save();
        }
      });
    }

    connect(target, data) {
      return connectionHandling.bind(this)(ModelClass, target, data, (ConnectionClass, data, fromTo) =>
        ConnectionClass.create(data, fromTo)
      );
    }

    ensureConnection(target, data) {
      return connectionHandling.bind(this)(ModelClass, target, data, (ConnectionClass, data, fromTo) =>
        ConnectionClass.ensure(data, fromTo)
      );
    }

    storeConnection(target, data) {
      return connectionHandling.bind(this)(ModelClass, target, data, (ConnectionClass, data, fromTo) =>
        ConnectionClass.store(data, fromTo)
      );
    }
  };

  ModelClass.attributes = attributes;
  ModelClass.collectionName = inflection.pluralize(_.lowerFirst(name));
  ModelClass.connections = {};
  ModelClass.log = debug(`db:${name}`);

  ctx.on('ensure:db', function (db) {
    ModelClass.db = db;
    ModelClass.rawDb = db.arango;
    ModelClass.collection = db.arango.collection(ModelClass.collectionName);
  });

  _.each(attributes, function (attribute) {
    Object.defineProperty(ModelClass.prototype, attribute, {
      get: function () {
        return this.data[attribute];
      },
      set: function (value) {
        return (this.data[attribute] = value);
      },
    });

    const Attr = _.upperFirst(attribute);

    ModelClass[`findAllBy${Attr}`] = function (value) {
      ModelClass.log(`findAllBy${Attr}`, value);
      return Promise.resolve(ModelClass.collection.all({ [attribute]: value }));
    };

    ModelClass.firstExample = function (data) {
      ModelClass.log('firstExample %o', data);
      return Promise.resolve(ModelClass.collection.firstExample(data))
        .catch(() => null)
        .then((d) => ModelClass.parse(d));
    };

    ModelClass[`findOneBy${Attr}`] = function (value) {
      return ModelClass.firstExample({ [attribute]: value });
    };

    ModelClass[`ensureBy${Attr}`] = function (value, data, options) {
      return ModelClass[`findOneBy${Attr}`](value).then(function (resp) {
        if (resp) {
          return [ModelClass.parse(resp), false];
        } else {
          const inst = new ModelClass(data, options);
          inst[attribute] = value;

          return inst.save().then((i) => [i, true]);
        }
      });
    };
  });

  Object.defineProperty(ModelClass.prototype, '_key', {
    get: function () {
      return this.data[options.keyAttribute];
    },

    set: function (value) {
      return (this.data[options.keyAttribute] = value);
    },
  });

  return ModelClass;
};

function connectionHandling(ModelClass, target, data, cb) {
  if (!(target instanceof Model)) {
    throw new IllegalArgumentError('${target} is not an instance of Model');
  }

  const ConnectionClass = ModelClass.connections[target.ModelClass.name];

  if (!ConnectionClass) {
    throw new IllegalArgumentError(`${ModelClass.name} is not connected to ${target.ModelClass.name}`);
  }

  let from, to;

  if (ConnectionClass.fromModel === ModelClass) {
    from = this;
    to = target;
  } else {
    from = target;
    to = this;
  }

  return cb(ConnectionClass, data, { from: from, to: to });
}

export default Model;
