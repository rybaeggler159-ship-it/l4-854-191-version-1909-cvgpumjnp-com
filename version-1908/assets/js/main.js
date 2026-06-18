(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.site-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var previous = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    var showSlide = function (target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    var restart = function () {
      window.clearInterval(timer);
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-to')) || 0);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    showSlide(0);
    start();
  }

  var applyQueryFromLocation = function () {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    var globalSearch = document.querySelector('.global-search');
    if (query && globalSearch) {
      globalSearch.value = query;
      globalSearch.dispatchEvent(new Event('input'));
    }
  };

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var activeChip = 'all';

  var runFilter = function () {
    var input = document.querySelector('.filter-input');
    var query = input ? input.value.trim().toLowerCase() : '';
    var items = Array.prototype.slice.call(document.querySelectorAll('.searchable-item'));
    items.forEach(function (item) {
      var haystack = (item.getAttribute('data-search') || '').toLowerCase();
      var itemFilter = item.getAttribute('data-filter') || '';
      var matchesText = !query || haystack.indexOf(query) !== -1;
      var matchesChip = activeChip === 'all' || itemFilter === activeChip;
      item.classList.toggle('is-filtered-out', !(matchesText && matchesChip));
    });
  };

  filterInputs.forEach(function (input) {
    input.addEventListener('input', runFilter);
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeChip = chip.getAttribute('data-chip') || 'all';
      chips.forEach(function (item) {
        item.classList.toggle('active', item === chip);
      });
      runFilter();
    });
  });

  applyQueryFromLocation();

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (panel) {
    var video = panel.querySelector('video');
    var overlay = panel.querySelector('.player-overlay');
    if (!video || !overlay) {
      return;
    }

    var streamUrl = video.getAttribute('data-video');
    var attached = false;
    var hlsInstance = null;

    var attachStream = function () {
      if (attached || !streamUrl) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    var beginPlayback = function () {
      attachStream();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };

    overlay.addEventListener('click', beginPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlayback();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      overlay.classList.remove('is-hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
