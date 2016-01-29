'use strict';

var textarea = document.getElementById('code');
var button = document.getElementById('run-code');
var iframe = document.getElementById('iframe');
var htmlTempl = document.getElementById('template');

function render() {
  var code = textarea.value;
  textarea.style.background = (code.length > 116) ? '#d9534f' : 'none';
  var doc = iframe.contentWindow.document;
  doc.open();
  doc.write(
    '<html lang="en"><head><link rel="stylesheet" href="base.css"></head><body>' +
    '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.13/d3.js"></script>' +
    '<script type="text/javascript" src="base.js"></script>' +
    '<script>function tweet(t) {' + compile(code) + '}</script>' +
    '</body></html>');
  doc.close();
}

function compile(code) {
  // Compile es6 -> es5
  return Babel.transform(code, { presets: ['es2015', 'stage-2'] }).code;
}

button.addEventListener('click',  render);
render();
