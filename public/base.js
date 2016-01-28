'use strict';

const w = 500, // width
  h = 500; // height

let x = {},
  y = [],
  z = 0,
  $ = '',
  _ = null;

const d = d3,
  ln = d.svg.line,
  rn = d.range;

const C = 'circle',
  E = 'ellipse',
  L = 'line',
  P = 'path',
  PG = 'polygon',
  PL = 'polyline',
  R = 'rect',
  T = 'text';

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

// create a canvas
const g = d.select("body")
  .A("svg")
  .a("width", w)
  .a("height", h)
  .A("g")
  .a("transform", "translate(" + [w / 2, h / 2] + ")");

// aliases
const a = Math.abs,
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
  e = Math.E,
  π = Math.PI;

// datajoin utility function
function j(data, element) {
  var update = g.selectAll(element)
      .data(data);

  update.e = update.enter()
    .append(element);
  update.x = update.exit();
  return update;
}

// render loop
d3.timer(function(t) {
  if (window.tweet) {
    tweet(t);
  }
});
