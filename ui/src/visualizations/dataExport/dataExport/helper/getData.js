import Database from '../../../../database/database';

export default class GetData {
  static getDatabase() {
    return Promise.resolve(Database.getDatabase()).then((resp) => resp);
  }
}
