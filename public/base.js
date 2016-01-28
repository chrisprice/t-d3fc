var w = 500, // width
    h = 500, // height
    n = 100, // just some random number
    o = {}, p = {};   // a few objects, remove the need for 'var'

// create a canvas
var i = d3.select("body").append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("background", "#d1d1d1")
    .append("g")
    .attr("transform", "translate(" + [w / 2, h / 2] + ")");

// aliases
var s = Math.sin, c = Math.cos, π = Math.PI;

// datajoin utility function
function j(data, element) {
  var update = i.selectAll(element)
      .data(data);

  //TODO: exit
  update.enter = update.enter().append(element);
  return update;
}

// render loop
d3.timer(function(t) {
  if (window.tweet) {
    tweet(t);
  }
});
