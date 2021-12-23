#!/usr/bin/env node

'use strict';

const serverCoverage = require('../coverage/server/coverage-final.json');
const uiCoverage = require('../coverage/ui/coverage-final.json');
const _ = require('lodash');

const stats = {
  s: { total: 0, covered: 0 },
  b: { total: 0, covered: 0 },
  f: { total: 0, covered: 0 }
};

_.each([serverCoverage, uiCoverage], function(coverage) {
  _.each(coverage, function(info) {
    collect('s', info);
    collect('b', info);
    collect('f', info);
  });
});

console.log('Overall coverage:');
console.log('Statements:', format(stats.s));
console.log('Branches:', format(stats.b));
console.log('Functions:', format(stats.f));

function format(stats) {
  return Math.round(stats.covered / stats.total * 10000) / 100 + '%';
}

function collect(type, info) {
  _.each(info[type], function(v) {
    if (Array.isArray(v)) {
      _.each(v, function(v) {
        inc(type, v);
      });
    } else {
      inc(type, v);
    }
  });
}

function inc(type, v) {
  stats[type].total++;
  if (v > 0) {
    stats[type].covered++;
  }
}
