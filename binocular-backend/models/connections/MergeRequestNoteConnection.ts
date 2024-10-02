'use strict';

import Connection from '../Connection.ts';
import MergeRequest, { MergeRequestDataType } from '../models/MergeRequest.ts';
import Note, { NoteDataType } from '../models/Note.ts';

export interface MergeRequestNoteConnectionDataType {}

class MergeRequestNoteConnection extends Connection<MergeRequestNoteConnectionDataType, MergeRequestDataType, NoteDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(MergeRequest, Note);
  }
}
export default new MergeRequestNoteConnection();
