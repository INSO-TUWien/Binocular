'use strict';

import { findAll } from './utils';

export default class Comments {
  static getIssueData(db, relations, issueSpan, significantSpan) {
    return findAll(db, 'comments').then((res) => {
      res.docs = res.docs
        .sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((c) => new Date(c.createdAt) >= new Date(significantSpan[0]) && new Date(c.createdAt) <= new Date(significantSpan[1]));
      return res.docs;
    });
  }
}
