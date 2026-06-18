(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyFilters() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var category = categoryFilter ? categoryFilter.value : '';
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-title') || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchCategory = !category || cardCategory === category;
      card.classList.toggle('hidden', !(matchKeyword && matchCategory));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play]');
    var source = root.getAttribute('data-stream');
    var started = false;
    var hls = null;

    function attachSource() {
      if (!video || !source || started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();
      if (button) {
        button.classList.add('hidden');
      }
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
