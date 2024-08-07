'use strict';

import Connection from '../Connection.ts';
import Note, { NoteDataType } from '../models/Note.ts';
import Account, { AccountDataType } from '../models/Account.ts';

export interface NoteAccountConnectionDataType {}

class NoteAccountConnection extends Connection<NoteAccountConnectionDataType, NoteDataType, AccountDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Note, Account);
  }
}
export default new NoteAccountConnection();
