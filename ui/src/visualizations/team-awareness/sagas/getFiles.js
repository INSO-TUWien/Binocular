import { graphQl, traversePages } from '../../../utils';

/**
 * Fetches commit data via GraphQL API from the data source.
 */
export default () => {
  const buildList = [];
  return traversePages(getFiles, build => buildList.push(build)).then(() => buildList);
};

const getFiles = (page, perPage) => {
  return graphQl
    .query(
      `
    query($page:Int,$perPage:Int) {
        files(page:$page, perPage:$perPage) {
          data {
            id
            webUrl
            path
            commits {
              data {
                date
                branch
                sha
              }
            }
          }
        }
      }`,
      page,
      perPage
    )
    .then(result => result.files);
};
