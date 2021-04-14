import { graphQl } from '../../../../utils';
import Promise from 'bluebird';

export default class vcsData {
  static async getChangeData(path) {
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
        { file: path }
      )
    ).then(resp => resp.file.commits);
  }

  static async getIssueData(path) {
    return Promise.resolve(
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
