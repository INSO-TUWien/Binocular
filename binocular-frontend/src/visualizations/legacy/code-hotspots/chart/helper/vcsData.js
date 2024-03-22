import { graphQl } from '../../../../../utils';
import Database from '../../../../../database/database';

export default class vcsData {
  static async getChangeData(path) {
    const resp = await Promise.resolve(Database.getCodeHotspotsChangeData(path));
    return resp.file.commits;
  }

  static async getIssueData(path) {
    return Promise.resolve(Database.getCodeHotspotsIssueData(path)).then((resp) => resp.issues);
  }
}
