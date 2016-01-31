'use strict';

const winston = require('winston');
const babel = require('babel-core');
const AllHtmlEntities = require('html-entities').AllHtmlEntities;
const htmlEntities = new AllHtmlEntities();
const cache = require('./cache');

const babelOptions = { presets: ['es2015', 'stage-2'] };

const stripTwitterEntities = (status) => {
  const entities = [].concat(
      status.entities.urls,
      status.entities.hashtags,
      status.entities.user_mentions
    );
  return entities.reduce(
    (text, entity) =>
      text.substring(0, entity.indices[0]) +
      text.substring(entity.indices[1]),
    status.text);
};

const transpile = (es6, id_str) => {
  try {
     return babel.transform(es6, babelOptions).code;
  } catch (e) {
    winston.info('Failed to transform', id_str, e);
  }
};

const parse = (status) => {
  const cached = cache.status(status.id_str);
  if (cached != null) {
    return cached;
  }
  const es6 = htmlEntities.decode(stripTwitterEntities(status));
  const processed = Object.assign({}, status, {
    es5: transpile(es6, status.id_str),
    es6
  });
  cache.status(status.id_str, processed);
  return processed;
};

module.exports = parse;
module.exports.stripTwitterEntities = stripTwitterEntities;
