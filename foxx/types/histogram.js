'use strict';

const gql = require('graphql-sync');

const bucketTypes = {};

module.exports = function(categoryType) {
  let Bucket = bucketTypes[categoryType.name];

  if (!Bucket) {
    bucketTypes[categoryType.name] = Bucket = new gql.GraphQLObjectType({
      name: categoryType.name + 'Bucket',
      description: 'Histogram bucket',
      fields() {
        return {
          category: {
            type: categoryType,
            description: 'Category for this bucket'
          },
          count: {
            type: gql.GraphQLInt,
            description: 'Number of elements in this bucket'
          }
        };
      }
    });
  }

  return new gql.GraphQLList(Bucket);
};
