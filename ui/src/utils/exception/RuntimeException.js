export class RuntimeException extends Error {
  constructor(message, name, code) {
    super(message);
    this.code = code;
    this.name = name || RuntimeException.name || this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}
