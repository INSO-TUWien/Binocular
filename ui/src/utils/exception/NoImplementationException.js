import { RuntimeException } from './RuntimeException';

export class NoImplementationException extends RuntimeException {
  constructor(message, code) {
    super(message, NoImplementationException.name, code);
  }
}
