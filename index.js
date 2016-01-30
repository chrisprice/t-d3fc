'use strict';

const winston = require('winston');
const Twitter = require('twitter');
const express = require('express');
const cors = require('cors');
const LRU = require('lru-cache');
const babel = require('babel-core');
const ms = require('ms');
const AllHtmlEntities = require('html-entities').AllHtmlEntities;

const htlmEntities = new AllHtmlEntities();

const searchTerm = 't.d3fc.io';
const babelOptions = { presets: ['es2015', 'stage-2'] };

const example = 'T().a({transform:d=>sc(4+s(d/1e3)),x:d=>mo[0]*10,y:d=>mo[1]*10}).t("Hello World")';

const app = express();

app.set('view engine', 'jade');

const client = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

const cache = LRU({
  length: 1000
});

app.use(express.static('public', { maxAge: '1h' }));
app.use('/lazyload', express.static('node_modules/lazyloadjs/build', { maxAge: '1d' }));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist', { maxAge: '1d' }));
app.use('/babel-standalone.min.js', express.static('node_modules/babel-standalone/babel.min.js'));

app.get('/', (req, res) => {
  winston.info('Request', req.ip);
  const statuses = cache.get('statuses');
  if (statuses == null) {
    winston.warn('Results cache miss');
    return res.status(503).render('error');
  }
  res.set({ 'Cache-Control': 'public, max-age=' + ms('1m') });
  res.render('index', {
    statuses: statuses
  });
});

app.get('/playground', (req, res) => {
  res.set({ 'Cache-Control': 'public, max-age=' + ms('1h') });
  res.render('playground');
});

app.get('/loading', (req, res) => {
  res.set({ 'Cache-Control': 'public, max-age=' + ms('1h') });
  res.render('loading');
});

app.get('/item/:id_str', (req, res) => {
  const status = cache.get(req.params.id_str);
  if (status == null) {
    winston.warn('Item cache miss');
    return res.status(404).render('error');
  }
  res.set({ 'Cache-Control': 'public, max-age=' + ms('1h') });
  res.render('item', status);
});

const updateSearchResults = () => {
  winston.info('Updating search results');
  client.get('search/tweets', {q: searchTerm}, (error, tweets, response) => {
    if (error) {
      return winston.warn(error);
    }
    console.log(JSON.stringify(tweets, null, 2));
    winston.info('Search completed', tweets.statuses.length);
    const statuses = tweets.statuses.filter((status) => !status.retweeted_status)
      .map((status) => {
        const cached = cache.get(status.id_str);
        if (cached != null) {
          return cached;
        }
        const entities = [].concat(
          status.entities.urls,
          status.entities.hashtags,
          status.entities.user_mentions
        );
        const es6 = htlmEntities.decode(
          entities.reduce(
            (text, entity) =>
              text.substring(0, entity.indices[0]) +
              text.substring(entity.indices[1]),
            status.text)
        );
        // const es6 = example;
        let es5 = null;
        try {
           es5 = babel.transform(es6, babelOptions).code;
        } catch (e) {
          winston.info('Failed to transform', status.id_str, e);
        }
        const processed = Object.assign({}, status, {
          es5: es5,
          es6: es6
        });
        cache.set(status.id_str, processed);
        return processed;
      });
    const validStatuses = statuses.filter((status) => status.es5);
    cache.set('statuses', validStatuses);
    winston.info('Search results updated', validStatuses.length);
  });
}
updateSearchResults();
setInterval(updateSearchResults, ms('30s'));

app.listen(3000);
