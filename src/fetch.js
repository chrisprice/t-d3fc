'use strict';

const winston = require('winston');
const Twitter = require('twitter');
const db = require('./db');
const parse = require('./parse');
const querystring = require('querystring');

const searchTerm = 't.d3fc.io';

const bannedUserIds = [
  'BackwardSpy',
];

const bannedStatusIdStrs = [
  '695016836237172737'
];

const twitter = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

const fetch = (sinceId, maxId, cb) => {
  winston.info('fetch', sinceId, maxId);
  twitter.get(
    'search/tweets',
    {
      q: searchTerm,
      count: 100,
      since_id: sinceId,
      max_id: maxId
    },
    (error, tweets, response) => {
      if (error) {
        winston.warn(error);
        return cb(error, []);
      }
      winston.info('fetch response', tweets.statuses.length);
      const statuses = tweets.statuses;
      const nextResults = tweets.search_metadata.next_results;
      if (nextResults == null) {
        return cb(null, statuses);
      }
      const params = querystring.parse(nextResults.substr(1));
      fetch(sinceId, params.max_id, (error, olderStatuses) => {
        cb(error, statuses.concat(olderStatuses));
      });
    }
  );
};


module.exports = () => {
  winston.info('Updating search results');
  db.latest((error, statuses) => {
    if (error) {
      // ignore errors, we'll recover next time round
      return winston.warn('Failed to get maxId for update', error);
    }
    const sinceId = statuses[0].id_str, maxId = undefined;
    fetch(
      sinceId,
      maxId,
      (error, statuses) => {
        if (error) {
          // ignore errors, we'll recover next time round
          return winston.warn('Failed fetch all statuses', error);
        }
        winston.info('Search completed', statuses.length);
        const validStatuses = statuses.filter((status) => !status.retweeted_status)
          .filter((status) => bannedStatusIdStrs.indexOf(status.id_str) === -1)
          .filter((status) => bannedUserIds.indexOf(status.user.screen_name) === -1)
          .map(parse)
          .filter((status) => status.es6.trim())
          .filter((status) => status.es5);
        validStatuses.forEach((status) => db.status(status, (error) => {
          if (error) {
            // ignore errors, we'll recover next time round
            return winston.warn('Failed to update status', status.id_str, error);
          }
        }));
        winston.info('Valid statuses', validStatuses.length);
      }
    );
  });
};
