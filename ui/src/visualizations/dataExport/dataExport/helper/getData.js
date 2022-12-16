import BluebirdPromise from 'bluebird';
import Database from '../../../../database/database';

export default class GetData {
  static getDatabase() {
    return BluebirdPromise.resolve(Database.getDatabase()).then((resp) => resp);
  }
}
