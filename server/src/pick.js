'use strict';

exports.first = (array) => array[0];

exports.last = (array) => array[array.length - 1];

exports.random = (array) => array[Math.floor(Math.random() * array.length)];
