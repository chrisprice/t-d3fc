'use strict';

const winston = require('winston');
const fetch = require('node-fetch');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const ms = require('ms');
const db = require('./db');
const pick = require('./pick');

const service = process.env.gif_service;
const directory = process.env.gif_dir;
const target = process.env.gif_target;

exports.directory = directory;

const all = () =>
  new Promise((resolve, reject) => {
    fs.readdir(directory, (error, files) => {
      if (error) {
        winston.warn('Failed to readdir for gifs', directory, error);
        return reject(error);
      }
      resolve(files);
    });
  })
  .then((files) =>
    files.filter((file) => path.parse(file).ext === '.gif')
      .map((file) => path.basename(file, '.gif'))
      .reduce((o, id) => (o[id] = id, o), {})
  );

exports.all = all;

const writeToFile = (stream, path) =>
  new Promise((resolve, reject) => {
    stream.pipe(fs.createWriteStream(path, { encoding: 'binary' }))
      .on('close', () => resolve())
      .on('error', (e) => reject(e));
  });

const generate = (id) => {
  const query = querystring.stringify({
    url: `${target}/status/${id}`,
    selector: 'iframe',
    width: 320,
    height: 320,
    delay: 3333,
    interval: 333,
    count: 9,
    repeat: 0
  });
  return fetch(`${service}?${query}`, { timeout: ms('30s') })
    .then((response) => {
      if (!response.ok) {
        return response.text()
          .then((text) => {
            throw `Invalid response ${response.status}: ${text}`
          });
      }
      return writeToFile(response.body, path.join(directory, `${id}.gif`))
    });
};

const missingIds = () =>
  Promise.all([db.latest(), all()])
    .then((results) =>
      results[0].map((status) => status.id_str)
        .filter((id) => !results[1][id])
    );

exports.generate = () =>
  missingIds()
    .then((missingIds) => {
      if (missingIds.length === 0) {
        return;
      }
      const randomId = pick.random(missingIds);
      winston.info('Attempting to generate gif', randomId);
      return generate(randomId)
        .then(() => winston.info('Generated gif'));
    })
    .catch((e) => winston.warn('Failed to generate random gif', e));
