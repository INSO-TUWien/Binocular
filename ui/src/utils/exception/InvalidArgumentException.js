import { RuntimeException } from './RuntimeException';

export class InvalidArgumentException extends RuntimeException {
  constructor(message, code) {
    super(message, InvalidArgumentException.name, code);
  }
}
