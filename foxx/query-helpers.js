'use strict';

const arangodb = require('@arangodb');
const aql = arangodb.aql;

module.exports = {
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
