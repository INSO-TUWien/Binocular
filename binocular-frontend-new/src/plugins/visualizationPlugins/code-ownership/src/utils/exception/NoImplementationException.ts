import { RuntimeException } from './RuntimeException.ts';

export class NoImplementationException extends RuntimeException {
  constructor(message: string, code?: number) {
    super(message, NoImplementationException.name, code);
  }
}
