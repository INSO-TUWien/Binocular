'use strict';

const gql = require('graphql-sync');
const qb = require('aqb');

module.exports = new gql.GraphQLEnumType({
  name: 'DateGranularity',
  values: {
    dayOfWeek: {
      value: (fieldName) => `DATE_DAYOFWEEK(${fieldName})`,
    },
    dayOfMonth: {
      value: (fieldName) => `DATE_DAY(${fieldName})`,
    },
    month: {
      value: (fieldName) => `DATE_MONTH(${fieldName})`,
    },
    hour: {
      value: (fieldName) => `DATE_HOUR(${fieldName})`,
    },
  },
});
