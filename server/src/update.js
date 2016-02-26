'use strict';

const winston = require('winston');
const twitter = require('./twitter');
const db = require('./db');
const parse = require('./parse');
const pick = require('./pick');

module.exports = () => {
  winston.info('Updating random status');
  return db.latest()
    .then((statuses) => {
      const randomId = pick.random(statuses).id_str;
      winston.info('Attempting to update', randomId);
      return twitter.get('statuses/show/', { id: randomId })
        .then((status) => db.status(status))
        .then(() => winston.info('Updated', randomId));
    })
    .catch((e) => winston.warn('Failed to update', e));
};
