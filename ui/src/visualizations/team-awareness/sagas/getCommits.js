import { graphQl, traversePages } from '../../../utils';

/**
 * Fetches commit data via GraphQL API from the data source.
 */
export default () => {
  const buildList = [];
  return traversePages(getCommits, build => buildList.push(build)).then(() => buildList);
};

const getCommits = (page, perPage) => {
  return graphQl
    .query(
      `
    query($page:Int, $perPage:Int) {
        commits(page:$page, perPage:$perPage) {
          data {
            date
            branch
            stakeholder {
              id
              gitSignature
            }
            stats {
              additions
              deletions
            }
          }
        }
      }`,
      page,
      perPage
    )
    .then(result => result.commits);
};
