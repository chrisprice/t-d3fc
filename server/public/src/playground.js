'use strict';

var textarea = document.getElementById('code');
var button = document.getElementById('run-code');
var iframe = document.getElementById('iframe');
var htmlTempl = document.getElementById('template');
var alert = document.getElementById('alert');
var limit = 116;

function hideError() {
  alert.style.display = 'none';
}

function showError(source, error) {
  alert.style.display = 'block';
  alert.innerHTML = '<b>' + source + ':</b> ' + error;
}

function updateStatus() {
  var code = textarea.value;
  textarea.style.background = (code.length > limit) ? '#d9534f' : 'none';
  button.innerText = 'Run code (' + (limit - code.length) + ')';
}

function render() {
  var code = textarea.value;
  var doc = iframe.contentWindow.document;
  try {
    var es5 = compile(code);
  } catch(e) {
    showError('Babel Compile Error', e);
    return;
  }
  hideError();
  doc.open();
  doc.write(
    '<html lang="en"><head><link rel="stylesheet" href="base.css"></head><body>' +
    '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.13/d3.js"></script>' +
    '<script type="text/javascript" src="base.js"></script>' +
    '<script>function tweet(t) {\n  ' + es5 + '\n}</script>' +
    '</body></html>');
  doc.close();
}

function compile(code) {
  // Compile es6 -> es5
  return Babel.transform(code, { presets: ['es2015', 'stage-2'] }).code;
}

textarea.addEventListener('input', updateStatus);
button.addEventListener('click',  render);
hideError();
render();
updateStatus();
