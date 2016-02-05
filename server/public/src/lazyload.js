var iframes = document.querySelectorAll('iframe[data-src]');

var viewportWidth   = window.innerWidth || document.documentElement.clientWidth;
var viewportHeight  = window.innerHeight || document.documentElement.clientHeight;

function debouncedScroll() {
  for (var i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];
    var bbox = iframe.getBoundingClientRect();
    if (bbox.top <= viewportHeight && bbox.bottom >= 0) {
      if (iframe.dataset.src) {
        iframe.dataset.loadingSrc = iframe.src;
        iframe.src = iframe.dataset.src;
        delete iframe.dataset.src;
      };
    } else {
      if (iframe.dataset.loadingSrc) {
        iframe.dataset.src = iframe.src;
        iframe.src = iframe.dataset.loadingSrc;
        delete iframe.dataset.loadingSrc;
      }
    }
  }
}

addEventListener('scroll', function() {
  if (debouncedScroll.debounce) {
    clearTimeout(debouncedScroll.debounce);
  }
  debouncedScroll.debounce = setTimeout(debouncedScroll, 100);
});

debouncedScroll();
