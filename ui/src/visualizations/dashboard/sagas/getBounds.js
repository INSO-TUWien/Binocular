'use strict';

import { findAll } from '../../../database';

/**
 * Get first and last commit, as well as first and last issue
 * @returns {*} (see below)
 */
export default function getBounds() {
  return Promise.all([findAll('stakeholders'), findAll('commits'), findAll('issues')]).then(res => {
    const response = { committers: [] };

    // all committers
    res[0].docs.forEach(doc => response.committers.push(doc.gitSignature));

    // first and last commit
    res[1].docs = res[1].docs.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    response.firstCommit = res[1].docs[0];
    response.lastCommit = res[1].docs[res[1].docs.length - 1];

    // first and last issue
    res[2].docs = res[2].docs.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    response.firstIssue = res[2].docs[0];
    response.lastIssue = res[2].docs[res[2].docs.length - 1];

    return response;
  });
}
