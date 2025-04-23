export class RuntimeException extends Error {

  code?: number;
  constructor(message: string, name: string, code?: number) {
    super(message);
    this.code = code;
    this.name = name || RuntimeException.name || this.constructor.name;
    this.stack = new Error(this.message).stack;
  }
}
