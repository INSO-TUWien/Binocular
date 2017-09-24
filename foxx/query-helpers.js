'use strict';

const qb = require('aqb');

module.exports = {
  addDateFilter: function(dateField, cmp, comparedValue, q) {
    if (comparedValue) {
      let queryDate = qb.DATE_TIMESTAMP(
        qb.str(comparedValue instanceof Date ? comparedValue.toISOString() : comparedValue)
      );
      const instanceDate = qb.DATE_TIMESTAMP(dateField);
      return q.filter(qb[cmp](instanceDate, queryDate));
    }

    return q;
  }
};
