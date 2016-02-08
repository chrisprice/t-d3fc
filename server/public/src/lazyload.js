function swap(elem, attrs) {
  var newElem = document.createElement(elem.tagName);
  Object.keys(attrs)
    .forEach(function(name) {
      newElem.setAttribute(name, attrs[name]);
    });
  elem.parentNode.replaceChild(newElem, elem);
}

function debouncedScroll() {
  function scroll() {
    var viewportWidth   = window.innerWidth || document.documentElement.clientWidth;
    var viewportHeight  = window.innerHeight || document.documentElement.clientHeight;
    var wrappers = document.querySelectorAll('.iframe-wrapper');
    for (var i = 0; i < wrappers.length; i++) {
      var iframe = wrappers[i].querySelector('iframe');
      var bbox = iframe.getBoundingClientRect();
      if (bbox.top <= viewportHeight && bbox.bottom >= 0) {
        if (iframe.dataset.src) {
          swap(iframe, {
            'data-srcdoc': iframe.srcdoc,
            'src': iframe.dataset.src,
            'sandbox': 'allow-scripts'
          });
        }
      } else {
        if (iframe.dataset.srcdoc) {
          swap(iframe, {
            'data-src': iframe.src,
            'srcdoc': iframe.dataset.srcdoc,
            'sandbox': 'allow-scripts'
          });
        }
      }
    }
  }
  if (debouncedScroll.debounce) {
    clearTimeout(debouncedScroll.debounce);
  }
  debouncedScroll.debounce = setTimeout(scroll, 100);
}

addEventListener('scroll', debouncedScroll);

debouncedScroll();
