'use strict';

console.log("Start playground");

const textarea = document.getElementById('code');
const button = document.getElementById('run-code');
const iframe = document.getElementById('iframe');
const htmlTempl = document.getElementById('template');

button.addEventListener('click', () => {
  iframe.contentWindow.eval('function tweet(t) {' + compile(textarea.value) + '}');
});

function compile(code) {
  // Compile es6 -> es5
  return Babel.transform(code, { presets: ['es2015', 'stage-2'] }).code;
}
