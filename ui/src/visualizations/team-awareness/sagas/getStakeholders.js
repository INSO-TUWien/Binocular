import { graphQl, traversePages } from '../../../utils';

/**
 * Fetches stakeholder data via GraphQL API from the data source.
 */
export default () => {
  const buildList = [];
  return traversePages(getStakeholders, build => buildList.push(build)).then(() => buildList);
};

/**
 * Fetches paginated stakeholder data via GraphQL API from the data source.
 * 
 * @param {Number} page The page number to fetch.
 * @param {Number} perPage The number of items per page.
 * @returns {[]} An array of stakeholder data.
 */
const getStakeholders = (page, perPage) => {
  return graphQl
    .query(
      `
    query($page:Int, $perPage:Int){
        stakeholders(page:$page, perPage: $perPage) {
              data {
                id
                gitSignature
              }
        }
      }`,
      page,
      perPage
    )
    .then(result => result.stakeholders);
};
