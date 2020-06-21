'use strict';

const FallbackLanguageDetector = require('language-detect');
const path = require('path');
const log = require('debug')('language-provider');
const Antlr = require('antlr4');

class LanguageProvider {
  constructor(file) {
    this.path = path.resolve(file);
    //Antlr.Utils.
  }

  async languageDetection(content) {
    if (this.language) {
      return this.language;
    }
    log('call Fallback language detection!');
    return (this.language = await fallBackLanguageDetection.bind(this)(content));
  }
}

/**
 * call this function if linguist is not available
 * linguist is recommended to detect various programming languages easily
 *
 * @param content contains the content of the file
 * @returns {Promise<*>}
 */
async function fallBackLanguageDetection(content) {
  return new Promise(resolve => {
    return FallbackLanguageDetector(this.path, (err, lang) => {
      lang = lang || FallbackLanguageDetector.contents(this.path, content ? content : '');
      if (lang) {
        return resolve(lang);
      }
      return resolve('UNKNOWN');
    });
  });
}

module.exports = LanguageProvider;
