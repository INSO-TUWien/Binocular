import { graphQl } from '../../../../../utils';
import Database from '../../../../../database/database';

export default class vcsData {
  static getChangeData(path) {
    return Promise.resolve(Database.getCodeHotspotsChangeData(path)).then((resp) => resp.file.commits);
  }

  static async getIssueData(path) {
    return Promise.resolve(Database.getCodeHotspotsIssueData(path)).then((resp) => resp.issues);
  }
}
