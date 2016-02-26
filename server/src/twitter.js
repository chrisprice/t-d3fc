const Twitter = require('twitter');
const winston = require('winston');

const twitter = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

exports.get = (action, params) =>
  new Promise((resolve, reject) => {
    twitter.get(action, params, (error, tweets, response) => {
      if (error) {
        winston.warn(error);
        return reject(error);
      }
      resolve(tweets, response);
    });
  });
