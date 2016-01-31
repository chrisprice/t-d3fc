'use strict';

const winston = require('winston');
const express = require('express');
const cors = require('cors');
const ms = require('ms');

const cache = require('./src/cache');
const cacheControl = require('./src/cacheControl');
const fetch = require('./src/fetch');

const app = express();

app.set('view engine', 'jade');

const cacheControlSettings = { maxAge: '1h' };

app.use(express.static('public', cacheControlSettings));
app.use(
  '/lazyload',
  express.static('node_modules/lazyloadjs/build', cacheControlSettings)
);
app.use(
  '/bootstrap',
  express.static('node_modules/bootstrap/dist', cacheControlSettings)
);
app.use(
  '/babel-standalone.min.js',
  express.static('node_modules/babel-standalone/babel.min.js', cacheControlSettings)
);

app.get('/', (req, res) => {
  winston.info('Request', req.ip);
  const statuses = cache.statuses();
  if (statuses == null) {
    winston.warn('Results cache miss');
    return res.status(503).render('error');
  }
  cacheControl(res, { maxAge: '1m' });
  res.render('index', {
    statuses: statuses
  });
});

app.get('/playground', (req, res) => {
  cacheControl(res, cacheControlSettings);
  res.render('playground');
});

app.get('/loading', (req, res) => {
  cacheControl(res, cacheControlSettings);
  res.render('loading');
});

app.get('/item/:id_str', (req, res) => {
  const status = cache.status(req.params.id_str);
  if (status == null) {
    winston.warn('Item cache miss');
    return res.status(404).render('error');
  }
  cacheControl(res, cacheControlSettings);
  res.render('item', status);
});

fetch();
setInterval(fetch, ms('30s'));

app.listen(3000);
