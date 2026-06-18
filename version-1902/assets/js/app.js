(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var search = scope.querySelector('[data-search]');
      var year = scope.querySelector('[data-filter-year]');
      var type = scope.querySelector('[data-filter-type]');
      var empty = scope.querySelector('[data-empty]');
      function apply() {
        var keyword = normalize(search && search.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-keywords')
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
          var matchType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
          var match = matchKeyword && matchYear && matchType;
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    boxes.forEach(function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('.player-overlay');
      if (!video || !overlay) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var started = false;
      var hls = null;
      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
      function start() {
        if (!stream) {
          return;
        }
        overlay.classList.add('is-hidden');
        if (started) {
          playVideo();
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.load();
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal || !hls) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
          return;
        }
        video.src = stream;
        video.load();
        playVideo();
      }
      overlay.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && hls && video.paused) {
          hls.stopLoad();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
