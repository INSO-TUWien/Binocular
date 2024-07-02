'use strict';

import { findAll } from './utils';

export default class ReviewThreads {
  static getIssueData(db, relations, issueSpan, significantSpan) {
    return findAll(db, 'reviewThreads').then((res) => {
      res.docs = res.docs
        .sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((rt) => new Date(rt.createdAt) >= new Date(significantSpan[0]) && new Date(rt.createdAt) <= new Date(significantSpan[1]));
      return res.docs;
    });
  }
}
