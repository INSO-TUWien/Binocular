'use strict';

const qb = require('aqb');

module.exports = {
  addDateFilter: function(dateField, cmp, comparedValue, q) {
    if (comparedValue) {
      if (typeof comparedValue === 'number') {
        comparedValue = new Date(comparedValue);
      }

      let val;
      if (comparedValue instanceof Date) {
        val = qb.str(comparedValue.toISOString());
      } else {
        val = qb.str(comparedValue);
      }

      let queryDate = qb.DATE_TIMESTAMP(val);
      const instanceDate = qb.DATE_TIMESTAMP(dateField);
      return q.filter(qb[cmp](instanceDate, queryDate));
    }

    return q;
  },
  addRevisionFilter: function(revision, cmp, comparedValue, q) {
    if (comparedValue) {
      let queryRevision = qb.str(comparedValue);

      const instanceRevision = qb.NUMBER(revision);
      return q.filter(qb[cmp](instanceRevision, queryRevision));
    }

    return q;
  }
};
