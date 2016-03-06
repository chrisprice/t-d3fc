function debouncedScroll() {
  function scroll() {
    var viewportWidth   = window.innerWidth || document.documentElement.clientWidth;
    var viewportHeight  = window.innerHeight || document.documentElement.clientHeight;
    var wrappers = document.querySelectorAll('.thumbnail');
    for (var i = 0; i < wrappers.length; i++) {
      var element = wrappers[i].querySelector('img');
      if (element.dataset.src) {
        var bbox = element.getBoundingClientRect();
        if (bbox.top <= viewportHeight * 2 && bbox.bottom >= -viewportHeight) {
          element.src = element.dataset.src;
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
