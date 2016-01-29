'use strict';

const Twitter = require('twitter');
const express = require('express');
const cors = require('cors');
const LRU = require('lru-cache');
const babel = require('babel-core');
const ms = require('ms');

const searchTerm = 't.d3fc.io';
const babelOptions = { presets: ['es2015', 'stage-2'] };

const example = 'z=3,y=d=>w/4*s(d*t/1e3/z),j(rn(0,z),C).a({r:w/4,cx:d=>y(d)*c(d*π/z),cy:d=>y(d)*s(d*π/z)})';

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

app.get('/', function (req, res) {
  console.log('Request', req.ip);
  const statuses = cache.get('statuses');
  if (statuses == null) {
    console.warn('Results cache miss');
    return res.status(503).render('error');
  }
  res.set({ 'Cache-Control': 'public, max-age=' + ms('1m') });
  res.render('index', {
    statuses: statuses
  });
});

app.get('/playground', function(req, res) {
  res.render('playground/index');
});

app.get('/loading', function (req, res) {
  res.set({ 'Cache-Control': 'public, max-age=' + ms('1h') });
  res.render('loading');
});

app.get('/:id_str', function (req, res) {
  const status = cache.get(req.params.id_str);
  if (status == null) {
    console.warn('Item cache miss');
    return res.status(404).render('error');
  }
  res.set({ 'Cache-Control': 'public, max-age=' + ms('1h') });
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
        const cached = cache.get(status.id_str);
        if (cached != null) {
          return cached;
        }
        // const es6 = status.entities.urls.reduce(function(text, url) {
        //   return text.substring(0, url.indices[0]) + text.substring(url.indices[1]);
        // }, status.text);
        const es6 = example;
        let es5 = null;
        try {
           es5 = babel.transform(es6, babelOptions).code;
        } catch (e) {
          console.log('Failed to transform', status.id_str, e);
        }
        const processed = Object.assign({}, status, {
          es5: es5,
          es6: es6
        });
        cache.set(status.id_str, processed);
        return processed;
      });
    const validStatuses = statuses.filter(function(status) {
      return status.es5;
    });
    cache.set('statuses', validStatuses);
    console.log('Search results updated', validStatuses.length);
  });
}
updateSearchResults();
setInterval(updateSearchResults, ms('30s'));

app.listen(3000);
