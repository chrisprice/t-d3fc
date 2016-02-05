'use strict';

const winston = require('winston');
const pg = require('pg');

const conString = `postgres://postgres@${process.env.database}/postgres`;

const query = (sql, args, cb) => {
  pg.connect(conString, (error, client, done) => {
  if (error) {
    winston.log('Failed to retrieve client from pool', error);
    return cb(error);
  }
  client.query(sql, args, (error, result) => {
    //call `done()` to release the client back to the pool
    done();
    if (error) {
      winston.log('Failed to perform query', error);
      return cb(error);
    }
    cb(null, result.rows.map((r) => r.status));
  });
});
};

exports.latest = (cb) => {
  query(
    `SELECT status FROM statuses ORDER BY (status ->> 'id_str') DESC`,
    [],
    (error, statuses) => {
      if (error) {
        winston.log('Failed to select latest', error);
        return cb(error);
      }
      cb(null, statuses);
    }
  );
};

exports.favorites = (cb) => {
  query(
    `SELECT status
      FROM statuses
      ORDER BY (
        (status ->> 'favorite_count')::numeric +
        (status ->> 'retweet_count')::numeric
      ) DESC`,
    [],
    (error, statuses) => {
      if (error) {
        winston.log('Failed to select latest', error);
        return cb(error);
      }
      cb(null, statuses);
    }
  );
};

const select = (id_str, cb) => {
  query(
    `SELECT status FROM statuses WHERE ((status @> $1::jsonb))`,
    [{id_str: id_str}],
    (error, statuses) => {
      if (error) {
        winston.log('Failed to select status', id_str, error);
        return cb(error);
      }
      cb(null, statuses[0]);
    }
  );
};

const insert = (status, cb) => {
  query(
    `INSERT INTO statuses (status) VALUES ($1::jsonb)`,
    [status],
    (error) => {
      if (error) {
        winston.log('Failed to insert status', status, error);
        return cb(error);
      }
      cb();
    }
  );
};

const update = (status, cb) => {
  query(
    `UPDATE statuses
      SET status = $1::jsonb
      WHERE ((status ->> 'id_str')::text = $2::text)`,
    [status, status.id_str],
    (error) => {
      if (error) {
        winston.log('Failed to insert status', status, error);
        return cb(error);
      }
      cb();
    }
  );
};

exports.status = (id_str_or_status, cb) => {
  const status = (typeof(id_str_or_status) === 'string') ? null : id_str_or_status;
  const id_str = status == null ? id_str_or_status : status.id_str;
  select(id_str, (error, existingStatus) => {
    if (error) {
      winston.log('Failed to retrieve status', id_str, error);
      return cb(error);
    }
    if (status == null) {
      return cb(null, existingStatus);
    }
    if (existingStatus == null) {
      return insert(status, cb);
    }
    const mergedStatus = Object.assign(existingStatus, status);
    update(mergedStatus, cb);
  });
};
