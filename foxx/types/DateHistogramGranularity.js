'use strict';

const gql = require('graphql-sync');
const qb = require('aqb');

module.exports = new gql.GraphQLEnumType({
  name: 'DateGranularity',
  values: {
    dayOfWeek: {
      value: fieldName => qb.DATE_DAYOFWEEK(fieldName)
    },
    dayOfMonth: {
      value: fieldName => qb.DATE_DAY(fieldName)
    },
    dayOfYear: {
      value: fieldName => qb.fn('DATE_DAYOFYEAR')(fieldName)
    },
    month: {
      value: fieldName => qb.DATE_MONTH(fieldName)
    },
    hour: {
      value: fieldName => qb.DATE_HOUR(fieldName)
    },
    halfHour: {
      value: fieldName =>
        qb.add(qb.mul(qb.DATE_HOUR(fieldName), 2), qb.FLOOR(qb.div(qb.DATE_MINUTE(fieldName), 30)))
    },
    quarterHour: {
      value: fieldName =>
        qb.add(qb.mul(qb.DATE_HOUR(fieldName), 4), qb.FLOOR(qb.div(qb.DATE_MINUTE(fieldName), 15)))
    }
  }
});
