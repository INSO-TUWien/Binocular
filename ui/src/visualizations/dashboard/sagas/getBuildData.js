'use strict';

import { findAll } from '../../../database';

export default function getBuildData() {
  return findAll('builds').then(res => {
    // add stats object to each build
    let stats = { success: 0, failed: 0, pending: 0, canceled: 0 };

    return res.docs.map(build => {
      if (build.status === 'success') {
        stats.success++;
      } else if (build.status === 'errored') {
        stats.failed++;
      }

      build.stats = Object.assign({}, stats);

      return build;
    });
  });
}
