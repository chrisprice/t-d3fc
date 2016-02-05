'use strict';

var w = 500, // width
  h = 500; // height

var x = {},
  y = [],
  z = 0,
  $ = '',
  _ = null;

// abbreviate the D3 API via https://github.com/ColinEberhardt/d3-api-obfuscate
var d = shortenObject(d3);
shortenObject(d.selection.prototype);
shortenObject(d.selection.enter.prototype);
shortenObject(d.transition.prototype);

// Math functions are not enumerable, so we use a different mechanism for discovering them
var M = shortenObject(Math, Object.getOwnPropertyNames);

// further shorten the most popular maths functions
var s = M.sin,
  c = M.cos;

// mouse/touch positions
var mo = [0, 0], to = [];

var n = function(tuple) {
  return [
    tuple[0] / w - 0.5,
    tuple[1] / h - 0.5
  ];
}

function mouse() {
  mo = n(d3.mouse(this));
}

function touch() {
  to = d3.touches(this).map(n);
  mo = to[0] || [0, 0];
}

// create a canvas
var g = d3.select("body")
  .append("svg")
  .attr("viewBox", '0 0 ' + w + ' ' + h)
  .on("mouseenter", mouse)
  .on("mousemove", mouse)
  .on("mouseleave", function() { mo = [0, 0]; })
  .on("touchstart", touch)
  .on("touchmove", touch)
  .on("touchend", touch)
  .append("g")
  .attr("transform", "translate(" + [w / 2, h / 2] + ")");


var tr = 'transform',
  ts = function(x, y) {
    return 'translate(' + x + ',' + y + ')';
  },
  sc = function(f) {
    return 'scale(' + f + ')';
  },
  rt = function(a) {
    return 'rotate(' + a + ')';
  },
  op = 'opacity',
  pts = 'points',
  sk = 'stroke',
  f = 'fill';

// datajoin utility function
function j(element) {
  return function(data) {
    var update = g.selectAll(element)
        .data(data || [g.datum()]);
    update.enter = update.enter()
      .append(element);
    update.exit = update.exit();
    return update;
  }
}

var C = j('circle'),
  E = j('ellipse'),
  L = j('line'),
  P = j('path'),
  PG = j('polygon'),
  PL = j('polyline'),
  R = j('rect'),
  T = j('text'),
  G = j('g');

// render loop
d3.timer(function(t) {
  g.data([t]);
  if (window.tweet) {
    tweet(t);
  }
});
