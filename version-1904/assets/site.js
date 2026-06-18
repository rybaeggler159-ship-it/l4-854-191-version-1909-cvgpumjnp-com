(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
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
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.js-filter-panel'));
    panels.forEach(function (panel) {
      var section = panel.closest('.section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
      var searchInput = panel.querySelector('.js-search-input');
      var regionSelect = panel.querySelector('.js-region-filter');
      var yearSelect = panel.querySelector('.js-year-filter');
      var channelSelect = panel.querySelector('.js-channel-filter');
      var count = panel.querySelector('.js-result-count');

      function getValue(element) {
        return element ? String(element.value || '').trim().toLowerCase() : '';
      }

      function applyFilter() {
        var keyword = getValue(searchInput);
        var region = getValue(regionSelect);
        var year = getValue(yearSelect);
        var channel = getValue(channelSelect);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = String(card.getAttribute('data-search') || '').toLowerCase();
          var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
          var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
          var cardChannel = String(card.getAttribute('data-channel') || '').toLowerCase();
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (channel && cardChannel !== channel) {
            matched = false;
          }

          card.classList.toggle('is-hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [searchInput, regionSelect, yearSelect, channelSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilter);
          element.addEventListener('change', applyFilter);
        }
      });
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('.movie-player');
      var button = shell.querySelector('[data-player-button]');
      var started = false;
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function attachSource() {
        var src = video.getAttribute('data-src');
        if (!src) {
          return;
        }

        if (started) {
          return;
        }

        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function playVideo() {
        attachSource();
        if (button) {
          button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
