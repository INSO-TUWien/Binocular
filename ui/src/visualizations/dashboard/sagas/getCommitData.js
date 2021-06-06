'use strict';

import { findAll } from '../../../db';
import commitList from '../../../../arango_export/commits.json';

/**
 * Get commit data from the database.
 * @param commitSpan Array of two time values (ms), first commit and last commit.
 * @param significantSpan Array of two time values (ms), first significant and last significant commit
 * (only these will actually be returned, used for zooming, the rest of the time will be empty data).
 * @returns {*}
 */
export default function getCommitData(commitSpan, significantSpan) {
  // return all commits, filtering according to parameters can be added in the future
  return findAll('commits').then(res => {
    res.docs = res.docs.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    return res.docs;
  });
}
