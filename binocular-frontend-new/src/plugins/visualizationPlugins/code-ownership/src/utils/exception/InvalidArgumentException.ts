import { RuntimeException } from './RuntimeException.ts';

export class InvalidArgumentException extends RuntimeException {
  constructor(message: string, code?: number) {
    super(message, InvalidArgumentException.name, code);
  }
}
