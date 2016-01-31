'use strict';

const winston = require('winston');
const LRU = require('lru-cache');
const ms = require('ms');

const _cache = LRU({
  length: 1000
});

const cache = {
  statuses(x) {
    const key = 'statuses';
    if (arguments.length === 0) {
      return _cache.get(key);
    }
    _cache.set(key, x);
    return cache;
  },
  status(id, x) {
    const prefix = 'status_';
    if (arguments.length === 1) {
      return _cache.get(prefix + id);
    }
    _cache.set(prefix + id, x);
    return cache;
  }
};

module.exports = cache;
