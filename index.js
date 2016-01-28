'use strict';

const Twitter = require('twitter');
const express = require('express');
const cors = require('cors');
const LRU = require('lru-cache');

const hashtag = '#help';
const example = 'o=j(d3.range(0,n),"circle");o.enter.attr("r",w/4);p=d=>w/4*s(d*t/1e3/n);o.attr({"cx":d=>p(d)*c(d*π/n),"cy":d=>p(d)*s(d*π/n)});' + hashtag;

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
  client.get('search/tweets', {q: hashtag}, function(error, tweets, response) {
    const statuses = tweets.statuses.map(function(status) {
        return Object.assign({}, status, {
          code: example/*status.text*/.replace(new RegExp(hashtag, 'gi'), '')
        });
      })
      .filter(function(status, i) {
        return status.code;
      });
    statuses.forEach(function(status) {
      cache.set(status.id_str, status);
    });
    res.render('index', {
      statuses: statuses
    });
  });
});

app.get('/loading', function (req, res) {
  res.render('loading');
});

app.get('/:id_str', function (req, res) {
  const status = cache.get(req.params.id_str);
  if (status == null) {
    return res.status(404).render('error');
  }
  res.render('item', status);
});


app.listen(3000)
