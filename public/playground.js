'use strict';

const textarea = document.getElementById('code');
const button = document.getElementById('run-code');
const iframe = document.getElementById('iframe');
const htmlTempl = document.getElementById('template');

function render() {
  const code = textarea.value;
  textarea.style.background = (code.length > 116) ? '#d9534f' : 'none';
  iframe.contentWindow.eval('function tweet(t) {' + compile(code) + '}');
}

function compile(code) {
  // Compile es6 -> es5
  return Babel.transform(code, { presets: ['es2015', 'stage-2'] }).code;
}

button.addEventListener('click',  render);
