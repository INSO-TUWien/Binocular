import { graphQl } from '../../../../utils';
import Promise from 'bluebird';


export default class vcsData{

  static async getChangeData(path){
    return Promise.resolve(
      graphQl.query(
        `
      query($file: String!) {
        file(path: $file){
          path
          commits{
            data{
              message
              sha
              signature
              stats{
                additions
                deletions
              }
              files{
                data{
                  file{
                    path
                  }
                  lineCount
                  hunks{
                    newStart
                    newLines
                    oldStart
                    oldLines
                  }
                }
              }
            }
          }
        }
      }
      `,
        {file:path}
      ))
      .then(resp => resp.file.commits);

  }
}
