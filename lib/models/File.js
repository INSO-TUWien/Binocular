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

  let language = await this.getLanguage();

  // make sure that this file has not been processed already
  if (language) {
    languageContainer.language = Language.parse(language);
    log(`"${this.path}" holds already the language "${languageContainer.language.name}"!`);
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
  log(`Processing the following path "${this.path}" to detect its language!`);

  // process file to receive the corresponding programming language
  try {
    language =
      (await new Promise((resolve, reject) =>
        languageDetector.comm.detectLanguages(
          languageRequest,
          { deadline: Date.now() + 30000 },
          (error, response) => (error ? reject(error) : resolve(response))
        )
      )) || {};
    language.id = language.id || language.id === 0 ? language.id.toString() : '';
    languageContainer.language = language.id && language.id.toString().length > 0 ? await Language.persist(this.path, language) : null;
  } catch (error) {
    // exception can be thrown during shutdown because service cannot fulfill the task
    log(`the path "${this.path}" of type ${languageDetector.type} failed: ${error.toString()}`);
    return languageContainer;
  }

  const languageName = languageContainer.language ? languageContainer.language.name : 'UNKNOWN';
  log(`The following path "${this.path}" has been processed and holds the following language: ${languageName}!`);
  if (!languageContainer.language) {
    return languageContainer;
  }

  // set edge for file-language
  languageContainer.connector = await this.connect(languageContainer.language);
  log(
    `The following path "${this.path}" with the id "${this
      ._id}" has been processed and connected to the Language "${languageName}" with the id "${languageContainer.language._id}"!`
  );

  return languageContainer;
};

File.prototype.getLanguage = async function() {
  if (!LanguageFileConnection) {
    LanguageFileConnection = require('./LanguageFileConnection');
  }
  return ((await File.rawDb
    .query(
      aql`
      FOR language
      IN
      INBOUND ${this._id} ${LanguageFileConnection.collection}
      LIMIT 1
      RETURN language
      `
    )
    .then(cursor => cursor.all())) || [])[0];
};

module.exports = File;

// lazy loading
let LanguageFileConnection = null;
