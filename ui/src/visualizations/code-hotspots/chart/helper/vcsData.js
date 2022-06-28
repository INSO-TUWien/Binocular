import { graphQl } from '../../../../utils';
import BluebirdPromise from 'bluebird';

export default class vcsData {
  static getChangeData(path) {
    return BluebirdPromise.resolve(
      graphQl.query(
        `
        query($file: String!) {
          file(path: $file){
              path
              maxLength
              commits{
                  data{
                      message
                      sha
                      signature
                      branch
                      parents
                      date
                      stats{
                          additions
                          deletions
                      }
                      file(path: $file){
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
      `,
        { file: path }
      )
    ).then(resp => resp.file.commits);
  }

  static async getIssueData(path) {
    return BluebirdPromise.resolve(
      graphQl.query(
        `
        query($file: String!) {
          issues{
            data{
              title
              description
              iid
              commits{
                data{
                  message
                  sha
                  signature
                  branch
                  date
                  parents
                  stats{
                    additions
                    deletions
                  }
                  file(path: $file){
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
        { file: path }
      )
    ).then(resp => resp.issues);
  }
}
