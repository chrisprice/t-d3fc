'use strict';

const winston = require('winston');
const pg = require('pg');

const conString = `postgres://postgres@${process.env.database}/postgres`;

const query = (sql, args) =>
  new Promise((resolve, reject) => {
    pg.connect(conString, (error, client, done) => {
      if (error) {
        winston.warn('Failed to retrieve client from pool', error);
        return reject(error);
      }
      client.query(sql, args, (error, result) => {
        //call `done()` to release the client back to the pool
        done();
        if (error) {
          winston.warn('Failed to perform query', sql, error);
          return reject(error);
        }
        resolve(result.rows.map((r) => r.status));
      });
    });
  });

exports.latest = () =>
  query(
    `SELECT status FROM statuses ORDER BY (status ->> 'id_str') DESC`,
    []
  );

exports.favorites = () =>
  query(
    `SELECT status
      FROM statuses
      ORDER BY (
        (status ->> 'favorite_count')::numeric +
        (status ->> 'retweet_count')::numeric
      ) DESC`,
    []
  );

const select = (id_str) =>
  query(
      `SELECT status FROM statuses WHERE ((status @> $1::jsonb))`,
      [{id_str: id_str}]
    )
    .then((statuses) => statuses[0]);

const insert = (status) =>
  query(
    `INSERT INTO statuses (status) VALUES ($1::jsonb)`,
    [status]
  );

const update = (status, cb) =>
  query(
    `UPDATE statuses
      SET status = $1::jsonb
      WHERE ((status ->> 'id_str')::text = $2::text)`,
    [status, status.id_str]
  );

exports.status = (id_str_or_status) => {
  const status = (typeof(id_str_or_status) === 'string') ? null : id_str_or_status;
  const id_str = status == null ? id_str_or_status : status.id_str;
  return select(id_str)
    .then((existingStatus) => {
      if (status == null) {
        return existingStatus;
      }
      if (existingStatus == null) {
        return insert(status);
      }
      return update(Object.assign(existingStatus, status));
    });
};
