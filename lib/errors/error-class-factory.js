import _ from 'lodash';
import util from 'util';

export default function errorClassFactory(name) {
  const ErrorClass = function (message, additionalProps) {
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;

    _.merge(this, additionalProps);
  };

  Object.defineProperty(ErrorClass, 'name', { value: name });
  util.inherits(ErrorClass, Error);

  return ErrorClass;
}
