'use strict';

import Model from '../Model';

export interface NoteDataType {
  id: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  system: true;
  resolvable: false;
  confidential: false;
  internal: false;
  imported: false;
  importedFrom: string;
}

class Note extends Model<NoteDataType> {
  constructor() {
    super({
      name: 'Note',
    });
  }
}

export default new Note();
