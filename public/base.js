'use strict';

var w = 500, // width
  h = 500; // height

var x = {},
  y = [],
  z = 0,
  $ = '',
  _ = null;

var d = d3,
  ln = d.svg.line,
  rn = d.range,
  c1 = d.scale.category10,
  c2 = d.scale.category20;

d.selection.prototype.a = d.selection.prototype.attr;
d.selection.prototype.A = d.selection.prototype.append;
d.selection.prototype.s = d.selection.prototype.select;
d.selection.prototype.S = d.selection.prototype.selectAll;
d.selection.prototype.c = d.selection.prototype.call;
d.selection.prototype.C = d.selection.prototype.classed;
d.selection.prototype.e = d.selection.prototype.each;
d.selection.prototype.D = d.selection.prototype.data;
d.selection.prototype.d = d.selection.prototype.datum;
d.selection.prototype.r = d.selection.prototype.remove;
d.selection.prototype.h = d.selection.prototype.html;
d.selection.prototype.t = d.selection.prototype.text;
d.selection.prototype.o = d.selection.prototype.on;
d.selection.prototype.y = d.selection.prototype.style;

// mouse/touch positions
var mo = [0, 0], to = [];

var n = function(tuple) {
  return [
    tuple[0] / w - 0.5,
    tuple[1] / h - 0.5
  ];
}

function mouse() {
  mo = n(d.mouse(this));
}

function touch() {
  to = d3.touches(this).map(n);
  mo = to[0] || [0, 0];
}

// create a canvas
var g = d.select("body")
  .A("svg")
  .a("viewBox", '0 0 ' + w + ' ' + h)
  .o("mouseenter", mouse)
  .o("mousemove", mouse)
  .o("mouseleave", function() { mo = [0, 0]; })
  .o("touchstart", touch)
  .o("touchmove", touch)
  .o("touchend", touch)
  .A("g")
  .a("transform", "translate(" + [w / 2, h / 2] + ")");

// aliases
var a = Math.abs,
  ce = Math.ceil,
  fl = Math.floor,
  ro = Math.round,
  sq = Math.sqrt,
  lo = Math.log,
  l2 = Math.log2,
  l1 = Math.log10,
  mi = Math.min,
  ma = Math.max,
  s = Math.sin,
  c = Math.cos,
  t = Math.tan,
  as = Math.asin,
  ac = Math.acos,
  at = Math.atan,
  r = Math.random,
  e = Math.E,
  π = Math.PI;

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
  pts= 'points';

// datajoin utility function
function j(element) {
  return function(data) {
    var update = g.selectAll(element)
        .data(data || g.datum());
    update.e = update.enter()
      .append(element);
    update.x = update.exit();
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
  g.d([t]);
  if (window.tweet) {
    tweet(t);
  }
});
