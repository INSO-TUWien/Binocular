'use strict';

const _ = require('lodash');
const config = require('../config.js');
const ctx = require('../context.js');
const { aql } = require('arangojs');

module.exports = async function (req, res) {
  const cfg = {};

  cfg.branches = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'branches' })).all();
  cfg.builds = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'builds' })).all();
  cfg.commits_commits = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-commits' })).all();
  cfg.commits_files = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-files' })).all();
  cfg.commits_languages = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-languages' })).all();
  cfg.commits_modules = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-modules' })).all();
  cfg.commits_stakeholders = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits-stakeholders' })).all();
  cfg.commits = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'commits' })).all();
  cfg.files = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'files' })).all();
  cfg.issues_commits = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'issues-commits' })).all();
  cfg.issues_stakeholders = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'issues-stakeholders' })).all();
  cfg.issues = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'issues' })).all();
  cfg.languages_files = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'languages-files' })).all();
  cfg.languages = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'languages' })).all();
  cfg.modules_files = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'modules-files' })).all();
  cfg.modules_modules = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'modules-modules' })).all();
  cfg.modules = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'modules' })).all();
  cfg.stakeholders = await (await ctx.db.query('FOR i IN @@collection RETURN i', { '@collection': 'stakeholders' })).all();

  res.json(cfg);
};
