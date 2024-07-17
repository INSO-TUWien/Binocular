'use strict';

import { findAll } from './utils';

export default class ReviewThreads {
  static getReviewThreadData(db, relations) {
    return findAll(db, 'reviewThreads').then((res) => {
      res.docs = res.docs.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      return res.docs;
    });
  }
}
