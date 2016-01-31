const ms = require('ms');

module.exports = (res, settings) => {
  res.set({ 'Cache-Control': 'public, max-age=' + ms(settings.maxAge) / 1e3 });
};
