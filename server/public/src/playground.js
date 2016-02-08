var baseCss = require('fs').readFileSync(__dirname + '/base.css', 'utf8');
var d3Js = require('fs').readFileSync(__dirname + '/../../node_modules/d3/d3.min.js', 'utf8');
var baseJs = require('fs').readFileSync(__dirname + '/base.js', 'utf8');

var textarea = document.getElementById('code');
var button = document.getElementById('run-code');
var iframe = document.getElementById('iframe');
var htmlTempl = document.getElementById('template');
var alert = document.getElementById('alert');
var limit = 116;

var helloWorldJs = "T().a({transform:d=>sc(4+s(d/1e3)),x:d=>mo[0]*10,y:d=>mo[1]*10}).t('Hello World')";

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
  if (code === '' || code === helloWorldJs) {
    delete localStorage['playground'];
  } else {
    localStorage['playground'] = code;
  }
  try {
    var es5 = compile(code);
  } catch(e) {
    showError('Babel Compile Error', e);
    return;
  }
  hideError();
  iframe.srcdoc =
    '<html lang="en"><head>' +
    '<style>' + baseCss + '</style>' +
    '</head><body>' +
    '<script>' + d3Js + '</script>' +
    '<script>' + baseJs + '</script>' +
    '<script>function tweet(t) {\n  ' + es5 + '\n}</script>' +
    '</body></html>';
}

function compile(code) {
  // Compile es6 -> es5
  return Babel.transform(code, { presets: ['es2015', 'stage-2'] }).code;
}

// Default textarea to server specified value, falling back to local storage, then default
textarea.value = textarea.value || localStorage['playground'] || helloWorldJs;

textarea.addEventListener('input', updateStatus);
button.addEventListener('click',  render);
hideError();
render();
updateStatus();
