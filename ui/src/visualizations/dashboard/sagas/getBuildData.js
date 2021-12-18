'use strict';

import { findAll } from '../../../database';

export default function getBuildData() {
  // add stats object to each build
  return findAll('builds').then(res => {
    const emptyStats = { success: 0, failed: 0, pending: 0, canceled: 0 };

    return res.docs.map(build => {
      let stats = Object.assign({}, emptyStats);

      if (build.status === 'success') {
        stats.success = 1;
      } else if (build.status === 'failed' || build.status === 'errored') {
        stats.failed = 1;
      }

      build.stats = stats;

      return build;
    });
  });
}
