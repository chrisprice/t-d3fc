'use strict';

const winston = require('winston');
const express = require('express');
const staticAsset = require('static-asset');
const ms = require('ms');

const db = require('./src/db');
const cacheControl = require('./src/cacheControl');
const fetch = require('./src/fetch');
const update = require('./src/update');
const gifs = require('./src/gifs');
const pick = require('./src/pick');

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
app.use(
  '/gif',
  express.static(gifs.directory, cacheControlSettings)
);

app.get('/', (req, res) => {
  Promise.all([db.favorites(), gifs.all()])
    .then((results) => {
      cacheControl(res, { maxAge: '1m' });
      res.render('index', {
        statuses: results[0],
        gifs: results[1]
      });
    })
    .catch((e) => {
      winston.warn('Results cache miss', e);
      res.status(500).render('error');
    });
});

app.get('/new', (req, res) => {
  Promise.all([db.latest(), gifs.all()])
    .then((results) => {
      cacheControl(res, { maxAge: '1m' });
      res.render('new', {
        statuses: results[0],
        gifs: results[1]
      });
    })
    .catch((e) => {
      winston.warn('Results cache miss', e);
      res.status(500).render('error');
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

app.get('/playground/:id_str', (req, res) => {
  db.status(String(req.params.id_str))
    .then((status) => {
      cacheControl(res, cacheControlSettings);
      res.render('playground', status);
    })
    .catch((e) => {
      winston.warn('Item cache miss');
      res.status(404).render('error');
    });
});

app.get('/item/:id_str', (req, res) => {
  db.status(String(req.params.id_str))
    .then((status) => {
      cacheControl(res, cacheControlSettings);
      res.render('item', status);
    })
    .catch((e) => {
      winston.warn('Item cache miss', e);
      res.status(404).render('error');
    });
});

app.get('/status/:id_str', (req, res) => {
  db.status(String(req.params.id_str))
    .then((status) => {
      cacheControl(res, cacheControlSettings);
      res.render('status', status);
    })
    .catch((e) => {
      winston.warn('Item cache miss', e);
      res.status(404).render('error');
    });
});

app.get('/lookup/:code*', (req, res) => {
  db.latest()
    .then((statuses) => {
      const code = new Buffer(req.params.code, 'base64').toString('utf8').trim();
      const matching = statuses.filter((status) => status.es6.trim() === code);
      if (!matching.length) {
        throw 'No matching';
      }
      // oldest id should be given precedence
      const id = pick.last(matching).id_str;
      res.redirect(301, `/status/${id}`);
    })
    .catch((e) => {
      winston.warn('unpublished miss', e);
      // not found, assume not picked up yet, send them to latest
      return res.redirect(302, `/new`);
    });
});

if (process.env.NODE_ENV === 'production') {
  setInterval(fetch, ms('30s'));
  setInterval(update, ms('10s'));
  setInterval(gifs.generate, ms('1m'));
}

app.listen(3000);
