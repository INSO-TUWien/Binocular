'use strict';

const _ = require('lodash');
const archiver = require('archiver');
const stream = require('stream');
const ctx = require('./context');

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

  getDbExport: async function () {
    const exportJson = {};

    exportJson.branches = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'branches' })).all();
    exportJson.branches_files = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'branches-files' })).all();
    exportJson.branches_files_files = await (
      await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'branches-files-files' })
    ).all();
    exportJson.builds = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'builds' })).all();
    exportJson.commits_commits = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-commits' })).all();
    exportJson.commits_files = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-files' })).all();
    exportJson.commits_languages = await (
      await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-languages' })
    ).all();
    exportJson.commits_modules = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-modules' })).all();
    exportJson.commits_stakeholders = await (
      await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-stakeholders' })
    ).all();
    exportJson.commits = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits' })).all();
    exportJson.files = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'files' })).all();
    exportJson.issues_commits = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'issues-commits' })).all();
    exportJson.issues_stakeholders = await (
      await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'issues-stakeholders' })
    ).all();
    exportJson.issues = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'issues' })).all();
    exportJson.languages_files = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'languages-files' })).all();
    exportJson.languages = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'languages' })).all();
    exportJson.modules_files = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'modules-files' })).all();
    exportJson.modules_modules = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'modules-modules' })).all();
    exportJson.modules = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'modules' })).all();
    exportJson.stakeholders = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'stakeholders' })).all();
    exportJson.mergeRequests = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'mergeRequests' })).all();

    return exportJson;
  },
};
