'use strict';

const qb = require('aqb');
const arangodb = require('@arangodb');
const aql = arangodb.aql;

module.exports = {
  addDateFilter: function (dateField, cmp, comparedValue, q) {
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

      const queryDate = qb.DATE_TIMESTAMP(val);
      const instanceDate = qb.DATE_TIMESTAMP(dateField);
      return q.filter(qb[cmp](instanceDate, queryDate));
    }

    return q;
  },

  addDateFilterAQL: function (dateField, cmp, comparedValue) {
    if (comparedValue) {
      if (typeof comparedValue === 'number') {
        comparedValue = new Date(comparedValue);
      }

      let val;
      if (comparedValue instanceof Date) {
        val = comparedValue.toISOString();
      } else {
        val = comparedValue;
      }

      const queryDate = aql.literal(`DATE_TIMESTAMP("${val}")`);
      const instanceDate = aql.literal(`DATE_TIMESTAMP(${dateField})`);
      const comp = aql.literal(cmp);

      return aql`FILTER (${instanceDate} ${comp} ${queryDate})`;
    }

    return aql``;
  },
};
