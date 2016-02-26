'use strict';

const winston = require('winston');
const twitter = require('./twitter');
const db = require('./db');
const parse = require('./parse');
const querystring = require('querystring');
const sinbin = require('./sinbin');

const searchTerm = 't.d3fc.io';

const fetch = (sinceId, maxId) => {
  winston.info('fetch', sinceId, maxId);
  return twitter.get('search/tweets', {
      q: searchTerm,
      count: 100,
      since_id: sinceId,
      max_id: maxId
    })
    .then((tweets, response) => {
      winston.info('fetch response', tweets.statuses.length);
      const statuses = tweets.statuses;
      const nextResults = tweets.search_metadata.next_results;
      if (nextResults == null) {
        return statuses;
      }
      const params = querystring.parse(nextResults.substr(1));
      return fetch(sinceId, params.max_id)
        .then((olderStatuses) => statuses.concat(olderStatuses));
    });
};


module.exports = () => {
  winston.info('Updating search results');
  return db.latest()
    .then((statuses) => {
      const latestId = statuses.length > 0 ? statuses[0].id_str : undefined;
      return fetch(latestId);
    })
    .then((statuses) => {
      winston.info('Search completed', statuses.length);
      const promises = statuses.filter((status) => !status.retweeted_status)
        .filter(sinbin)
        .map(parse)
        .filter((status) => status.es6.trim())
        .filter((status) => status.es5)
        .map((status) => db.status(status));
      winston.info('Valid statuses', promises.length);
      return Promise.all(promises);
    })
    .catch((e) => winston.warn('Failed to fetch', e));;
};
