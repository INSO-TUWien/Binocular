'use strict';

const arangodb = require('arangojs');
const aql = arangodb.aql;
const Model = require('./Model.js');
const Promise = require('bluebird');
const File = Model.define('File', { attributes: ['path', 'webUrl'] });
const Language = require('./Language');
const log = require('debug')('idx:vcs:git:file');

File.deduceMaxLengths = function() {
  const Hunk = require('./Hunk.js');
  return Promise.resolve(
    File.rawDb.query(
      aql`
      FOR file in ${File.collection}
      UPDATE file WITH {
        maxLength: MAX(
          FOR commit, edge
          IN OUTBOUND file ${Hunk.collection}
          RETURN edge.lineCount
        )
      } IN ${File.collection}
      `
    )
  );
};

File.prototype.detectLanguage = async function(commit, gateway) {
  const languageContainer = { enabled: false, language: null, connector: null };
  if (!gateway) {
    return languageContainer;
  }

  // language services
  const serviceProvider = gateway.getServiceByType('LanguageDetection');

  if (!serviceProvider) {
    return languageContainer;
  }

  const service = serviceProvider.next();

  if (service.done) {
    return languageContainer;
  }

  const languageDetector = service.value;

  if (!languageDetector || !gateway.isIndexing()) {
    return languageContainer;
  }

  // language service is connected
  languageContainer.enabled = true;

  const languages = await this.getLanguage().then(cursor => cursor.all());

  // make sure that this file has not been processed already
  if (languages && languages.length > 0) {
    languageContainer.language = languages[0];
    return languageContainer;
  }

  // get whole content of the corresponding file during the given commit
  const blob = await Promise.resolve(commit.getEntry(this.path))
    .then(e => e.getBlob())
    .catch(/the path '.*' does not exist in the given tree/, () => {
      return undefined;
    });

  // skip tree miss-matching files and binary files
  if (!blob || blob.isBinary()) {
    return languageContainer;
  }

  const content = blob.toString();

  // if communicator has not been set
  if (!languageDetector.comm) {
    return languageContainer;
  }

  const languageRequest = { token: languageDetector.token, path: this.path, content };

  // process file to receive the corresponding programming language
  try {
    languageContainer.language = await Language.ensure(
      await new Promise((resolve, reject) =>
        languageDetector.comm.detectLanguages(languageRequest, (error, response) => (error ? reject(error) : resolve(response)))
      )
    );
  } catch (error) {
    // exception can be thrown during shutdown because service cannot fulfill the task
    log(`${languageDetector.type} failed: ${error.toString()}`);
    return languageContainer;
  }

  // set edge for file-language
  languageContainer.connector = await this.connect(languageContainer.language);

  return languageContainer;
};

File.prototype.getLanguage = async function() {
  if (!LanguageFileConnection) {
    LanguageFileConnection = require('./LanguageFileConnection');
  }
  return File.rawDb.query(
    aql`
      FOR language
      IN
      INBOUND ${this.data} ${LanguageFileConnection.collection}
      RETURN language
      `
  );
};

module.exports = File;

// lazy loading
let LanguageFileConnection = null;
