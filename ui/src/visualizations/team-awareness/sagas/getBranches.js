import { graphQl, traversePages } from '../../../utils';

/**
 * Fetches branch data via GraphQL API from the data source.
 */
export default () => {
  const buildList = [];
  return traversePages(getBranches, build => buildList.push(build)).then(() => buildList);
};

const getBranches = (page, perPage) => {
  return graphQl
    .query(
      `
      query($page:Int, $perPage:Int) {
        branches(sort: "ASC", page:$page, perPage:$perPage) {
          data {
            id
            branch
          }
        }
      }`,
      page,
      perPage
    )
    .then(result => result.branches);
};
