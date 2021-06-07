'use strict';

import { findAll } from '../../../database';

export default function getIssueData(issueSpan, significantSpan) {
  // return all issues, filtering according to parameters can be added in the future
  return findAll('issues').then(res => {
    res.docs = res.docs.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return res.docs;
  });
}

