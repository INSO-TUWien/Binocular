'use strict';

import Connection from '../Connection.ts';
import Issue, { IssueDataType } from '../models/Issue.ts';
import Note, { NoteDataType } from '../models/Note.ts';

export interface IssueNoteConnectionDataType {}

class IssueNoteConnection extends Connection<IssueNoteConnectionDataType, IssueDataType, NoteDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Issue, Note);
  }
}
export default new IssueNoteConnection();
