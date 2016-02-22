'use strict';

const winston = require('winston');
const twitter = require('./twitter');
const db = require('./db');
const parse = require('./parse');

module.exports = () => {
  winston.info('Updating random status');
  db.latest((error, statuses) => {
    if (error) {
      // ignore errors, we'll recover next time round
      return winston.warn('Failed to get statuses for random pick', error);
    }
    const randomId = statuses[Math.floor(Math.random() * statuses.length)].id_str;
    winston.info('Attempting to update', randomId);
    twitter.get(
      'statuses/show/',
      { id: randomId },
      (error, status, response) => {
        if (error) {
          // ignore errors, we'll recover next time round
          winston.warn('Failed to get update for', randomId, error);
          return;
        }
        db.status(status, (error) => {
          if (error) {
            // ignore errors, we'll recover next time round
            winston.warn('Failed to apply update for', randomId, error);
            return;
          }
          winston.info('Updated', randomId);
        });
      }
    );
  });
};
