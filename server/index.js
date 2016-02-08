'use strict';

const winston = require('winston');
const express = require('express');
const staticAsset = require('static-asset');
const ms = require('ms');

const db = require('./src/db');
const cacheControl = require('./src/cacheControl');
const fetch = require('./src/fetch');
const update = require('./src/update');

const app = express();

app.set('view engine', 'jade');

const cacheControlSettings = { maxAge: '1h' };

app.use((req, res, next) => {
  winston.info(req.method, req.url, req.ip);
  next();
});
app.use(staticAsset('public/dist'));
app.use(express.static('public/dist', cacheControlSettings));
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
  db.favorites((error, statuses) => {
    if (error) {
      winston.warn('Results cache miss');
      return res.status(500).render('error');
    }
    cacheControl(res, { maxAge: '1m' });
    res.render('index', {
      route: '/',
      statuses: statuses
    });
  });
});

app.get('/new', (req, res) => {
  db.latest((error, statuses) => {
    if (error) {
      winston.warn('Results cache miss');
      return res.status(500).render('error');
    }
    cacheControl(res, { maxAge: '1m' });
    res.render('new', {
      route: '/new',
      statuses: statuses
    });
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
  db.status(String(req.params.id_str), (error, status) => {
    if (error) {
      winston.warn('Item cache miss');
      return res.status(404).render('error');
    }
    cacheControl(res, cacheControlSettings);
    res.render('item', status);
  });
});

fetch();

if (process.env.NODE_ENV === 'production') {
  setInterval(fetch, ms('30s'));
  setInterval(update, ms('10s'));
}

app.listen(3000);
