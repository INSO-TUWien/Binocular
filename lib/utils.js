'use strict';

const _ = require('lodash');
const archiver = require('archiver');
const stream = require('stream');
const { fixUTF8 } = require('./utils');

module.exports = {
  createZipStream: function (directory) {
    const zip = archiver('zip');

    const pass = new stream.PassThrough();
    zip.pipe(pass);

    zip.directory(directory, false);
    zip.finalize();

    return pass;
  },

  renamer: function (mappings) {
    return function (obj) {
      const ret = {};
      _.each(mappings, function (to, from) {
        if (from in obj) {
          ret[to] = obj[from];
        }
      });

      return ret;
    };
  },

  getDbExport: async function (db) {
    const exportJson = {};
    const collections = await db.collections();
    for (const collection of collections) {
      const name = collection._name;
      exportJson[name] = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': name })).all();
    }

    return exportJson;
  },

  parseBlameOutput: function (output) {
    //this function parses git blame output with the -p flag (porcelain).
    //it extracts how many lines of code each stakeholder owns.
    //How it works:
    //  - git blame porcelain output outputs the commit sha followed by one or multiple lines of code (each prepended by a \t).
    //  - This means that these lines were added/modified by that commit.
    //  - when a commit appears the first time, additional data (like author) are provided

    const ownershipData = {};

    //stores who the author for each commit is
    const commitAuthors = {};

    //stores which commit we are currently looking at
    let currentSha = '';

    //if we are currently parsing the additional commit information (like author, email, etc.)
    let currentlyReadingCommitData = false;

    //get lines of output
    const lines = output.split('\n');

    const hunks = {};

    let currHunk = {};

    let currLineNumber = 0;

    for (const line of lines) {
      //if this is prepended by a tab, it is a line of code
      if (line[0] === '\t') {
        currLineNumber++;
        //currentSha should have already been set and author should have been stored for the commit
        const author = commitAuthors[currentSha];
        const signature = this.fixUTF8(author['author'] + ' ' + author['author-mail']);

        if (signature in hunks) {
          if (this.fixUTF8(currHunk.signature) === signature) {
            currHunk.linesChanged += 1;
            currHunk.endLine = currLineNumber;
          } else {
            hunks[this.fixUTF8(currHunk.signature)].push(currHunk);
            currHunk = { signature: signature, linesChanged: 1, startLine: currLineNumber, endLine: currLineNumber };
          }
        } else {
          if (currHunk.signature !== undefined) {
            hunks[this.fixUTF8(currHunk.signature)].push(currHunk);
          }
          hunks[signature] = [];
          currHunk = { signature: signature, linesChanged: 1, startLine: currLineNumber, endLine: currLineNumber };
        }

        if (signature in ownershipData) {
          ownershipData[signature] += 1;
        } else {
          ownershipData[signature] = 1;
        }
        //if we see a line of code, we have stopped looking at additional commit data
        currentlyReadingCommitData = false;
      } else {
        //if the line does not begin with a tab, we are either looking at a commit hash or at additional data
        if (!currentlyReadingCommitData) {
          //in this case, it must be a commit hash
          currentSha = line.split(' ')[0];

          //if not already set, set the commitAuthors entry for this commit to an empty object so name and email can be added later on
          //also, this means that we have to parse additional data
          if (!(currentSha in commitAuthors)) {
            currentlyReadingCommitData = true;
            commitAuthors[currentSha] = {};
          }
        } else {
          //in this case, we are currently parsing additional commit information
          //get first word and rest
          const [type, content] = line.split(/ (.*)/s, 2);

          if (type === 'author' || type === 'author-mail') {
            commitAuthors[currentSha][type] = content;
          }
        }
      }
    }
    if (currHunk.signature !== undefined) {
      hunks[currHunk.signature].push(currHunk);
    }
    return { ownershipData: ownershipData, hunks: hunks };
  },
  fixUTF8: function (text) {
    // fix ä,ö,ü utf8 chars
    return text.replace('\u0061\u0308', '\u00e4').replace('\u0075\u0308', '\u00f6').replace('\u0061\u0308', '\u00fc');
  },
};
