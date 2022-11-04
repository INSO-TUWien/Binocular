import BluebirdPromise from 'bluebird';
import Database from '../../../../database/database';

export default class GetData {
  static getBounds() {
    return BluebirdPromise.resolve(Database.getBounds()).then((resp) => resp);
  }

  static getCommitData(significantSpan) {
    return BluebirdPromise.resolve(Database.getCommitData(significantSpan, significantSpan)).then((resp) => resp);
  }

  static getIssueData(significantSpan) {
    return BluebirdPromise.resolve(Database.getIssueData(significantSpan, significantSpan)).then((resp) => resp);
  }

  static getBuildData(significantSpan) {
    return BluebirdPromise.resolve(Database.getBuildData(significantSpan, significantSpan)).then((resp) => resp);
  }

  static getFileData() {
    return BluebirdPromise.resolve(Database.requestFileStructure()).then((resp) => resp.files.data);
  }

  static getBranchData() {
    return BluebirdPromise.resolve(Database.getAllBranches()).then((resp) => resp.branches.data);
  }

  static getLanguageData() {
    return BluebirdPromise.resolve(Database.getAllLanguages()).then((resp) => resp.languages.data);
  }

  static getModuleData() {
    return BluebirdPromise.resolve(Database.getAllModules()).then((resp) => resp.modules.data);
  }

  static getStakeholderData() {
    return BluebirdPromise.resolve(Database.getAllStakeholders()).then((resp) => resp.stakeholders.data);
  }
}
