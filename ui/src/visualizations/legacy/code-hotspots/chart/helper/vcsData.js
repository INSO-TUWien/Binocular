import { graphQl } from '../../../../../utils';
import BluebirdPromise from 'bluebird';
import Database from '../../../../../database/database';

export default class vcsData {
  static getChangeData(path) {
    return BluebirdPromise.resolve(Database.getCodeHotspotsChangeData(path)).then((resp) => resp.file.commits);
  }

  static async getIssueData(path) {
    return BluebirdPromise.resolve(Database.getCodeHotspotsIssueData(path)).then((resp) => resp.issues);
  }
}
