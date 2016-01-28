'use strict';

const Twitter = require('twitter');
const express = require('express');
const cors = require('cors');
const LRU = require('lru-cache');
const babel = require('babel-core');

const searchTerm = 't.d3fc.io';

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

app.use(express.static('public'));
app.use('/lazyload.min.js', express.static('node_modules/lazyloadjs/build/lazyload.min.js'));

app.get('/', function (req, res) {
  console.log('Request', req.ip);
  const statuses = cache.get('statuses');
  if (statuses == null) {
    console.warn('Results cache miss');
    return res.status(503).render('error');
  }
  res.render('index', {
    statuses: statuses
  });
});

app.get('/loading', function (req, res) {
  res.render('loading');
});

app.get('/:id_str', function (req, res) {
  const status = cache.get(req.params.id_str);
  if (status == null) {
    console.warn('Item cache miss');
    return res.status(404).render('error');
  }
  res.render('item', status);
});

const updateSearchResults = () => {
  console.log('Updating search results');
  client.get('search/tweets', {q: searchTerm}, function(error, tweets, response) {
    if (error) {
      return console.warn(error);
    }
    console.log('Search completed', tweets.statuses.length);
    const statuses = tweets.statuses.map(function(status) {
        return Object.assign({}, status, {
          es6: status.entities.urls.reduce(function(text, url) {
            return text.substring(0, url.indices[0]) + text.substring(url.indices[1]);
          }, status.text)
        });
      })
      .map(function(status) {
        try {
          return Object.assign({}, status, {
            es5: babel.transform(status.es6, { }).code
          });
        } catch (e) {
          console.log('Failed to transform', e);
          return status;
        }
      })
      .filter(function(status, i) {
        return status.es5;
      });
    statuses.forEach(function(status) {
      cache.set(status.id_str, status);
    });
    cache.set('statuses', statuses);
    console.log('Search results updated', statuses.length);
  });
}
updateSearchResults();
setInterval(updateSearchResults, 10 * 1000);

app.listen(3000);
