'use strict';

import Connection from './Connection';
import MergeRequest from './MergeRequest';
import Comment from './Comment';

class MergeRequestCommentConnection extends Connection {
  constructor() {
    super(MergeRequest, Comment);
  }
}
export default new MergeRequestCommentConnection();
