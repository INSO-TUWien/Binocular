import { graphQl } from '../../../utils';

const getFileHunks = async filePath => {
  return graphQl
    .query(
      `
      query($path:String!) {
        file(path: $path) {
          id
          commits {
            data {
              branch
              sha
              stakeholder {
                id
                gitSignature
              }        
              file(path:$path) {
                hunks {
                  newStart
                  newLines
                  oldStart
                  oldLines
                  webUrl
                }
              }
            }
          }
        }
      }`,
      { path: filePath }
    )
    .then(result => result);
};

export { getFileHunks };
