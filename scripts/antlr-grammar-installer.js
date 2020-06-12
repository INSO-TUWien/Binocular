#!/usr/bin/env node
'use strict';

const request = require('request-promise');
const { Readable } = require('stream');
const unzipper = require('unzipper');
const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const antlrTools = require('antlr4-tool');

class AntlrGrammarInstaller {
  constructor() {
    this.zipUrl = 'https://codeload.github.com/antlr/grammars-v4/zip/master';
    this.root = path.resolve('node_modules', 'antlr4-grammars');
    this.grammarsDir = path.resolve(this.root, 'grammars-v4-master');
    this.generationDir = path.resolve('lib', 'languages');
  }

  /**
   * download all predefined antlr grammars from the given repository and store the extracted grammars into the node_modules folder
   *
   * @returns {Promise<*>}
   */
  async downloadGrammars() {
    const optionsStart = {
      uri: this.zipUrl,
      method: 'GET',
      encoding: null,
      headers: {
        'Content-type': 'application/zip'
      }
    };
    const response = await request(optionsStart);

    // clear grammar folder
    rimraf.sync(this.grammarsDir);

    return new Promise((resolve, reject) =>
      new Readable({
        read() {
          this.push(response);
        }
      })
        .pipe(unzipper.Extract({ path: this.root }))
        .promise()
        .then(resolve, reject)
    );
  }

  /**
   * generate all grammars that can be found in the defined grammar root directory
   *
   * @returns {Promise<*>}
   */
  async generate() {
    const grammars = await getFiles(this.grammarsDir, /.*\.g4/, /.*?(examples|test)[\\\/].*/);

    // generating all found grammars
    return generate(
      grammars,
      (structure, files) => {
        console.log(`Generating ${structure}...`);
        files.map(file => {
          try {
            antlrTools.compile({
              language: 'JavaScript',
              grammarFiles: [file],
              outputDirectory: path.resolve(this.generationDir, structure)
            });
          } catch (err) {
            console.error(structure, err.message);
            process.exitCode = 1;
          }
        });
      },
      this.grammarsDir
    );
  }
}

/**
 * generate all defined languages into the given path
 * 
 * @param grammar contains the defined grammars that has to be generated
 * @param callback called if it holds files in the grammar object
 * @param rootPath path to generate the relative path from
 * @param i contains the depth of the given recursive call
 * @returns {Promise<*>}
 */
async function generate(grammar, callback, rootPath = '.', i = 0) {
  const structure = path.relative(rootPath, grammar.path);
  const grammarsGenerator = await Promise.all(grammar.subDir.map(async grammar => generate(grammar, callback, rootPath, i + 1)));

  if (typeof callback === 'function' && grammar.files.length) {
    grammarsGenerator.push(callback(structure, grammar.files));
  }

  // flat the recursive calls
  return grammarsGenerator.reduce((generators, generator) => generators.concat(generator), []);
}

/**
 * get all files that matches the corresponding regex and excludes the particular regex
 *
 * @param dir root path
 * @param regex import matcher
 * @param exclude exclude path
 * @param i indexing depth
 * @returns {Promise<{path: *, files: *}>}
 */
async function getFiles(dir, regex = /(.*)/, exclude, i = 0) {
  const subDirs = await readdir(dir);
  const structure = await Promise.all(
    subDirs.map(async subDir => {
      const res = path.resolve(dir, subDir);
      if (!exclude || !exclude.test(res)) {
        return (await stat(res)).isDirectory() ? getFiles(res, regex, exclude, i + 1) : regex.test(res) ? res : '';
      }
      return '';
    })
  );
  return {
    path: dir,
    subDir: structure.reduce(
      (reduction, file) =>
        file && ((file.files && file.files.length) || (file.subDir && file.subDir.length)) ? reduction.concat(file) : reduction,
      []
    ),
    files: structure.reduce((reduction, file) => (file && typeof file === 'string' ? reduction.concat(file) : reduction), [])
  };
}

module.exports = AntlrGrammarInstaller;

// entrypoint
const argv = require('yargs')
  .option('antlr-download', {
    default: false,
    alias: 'antlr-dl'
  })
  .option('antlr-generate', {
    default: false,
    alias: 'antlr-gen'
  })
  .help('h')
  .alias('help', 'h').argv;

// cli handling
(async args => {
  if (!args['antlr-dl'] && !args['antlr-gen']) {
    return;
  }

  const antlrInstaller = new AntlrGrammarInstaller();
  if (args['antlr-dl']) {
    await antlrInstaller.downloadGrammars().then(() => console.log('Antlr Grammar download finished!'));
  }
  if (args['antlr-gen']) {
    await antlrInstaller.generate().then(() => console.log('Antlr Grammar generation finished!'));
  }
})(argv);
