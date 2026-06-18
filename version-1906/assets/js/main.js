(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });
    if (slides.length > 1) {
      play();
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterList(input) {
    var target = input.getAttribute('data-target');
    var list = target ? document.getElementById(target) : null;
    if (!list) {
      return;
    }
    var value = normalize(input.value);
    var items = selectAll('[data-search]', list);
    var visible = 0;
    items.forEach(function (item) {
      var matched = !value || normalize(item.getAttribute('data-search')).indexOf(value) !== -1;
      item.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    var empty = document.querySelector('[data-empty-for="' + target + '"]');
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  function setFilters() {
    selectAll('.filter-input').forEach(function (input) {
      input.addEventListener('input', function () {
        filterList(input);
      });
      filterList(input);
    });
  }

  function setSearchValue() {
    var input = document.querySelector('#search-list') ? document.querySelector('.filter-input[data-target="search-list"]') : null;
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
      filterList(input);
    }
  }

  function setImages() {
    selectAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-empty');
        image.removeAttribute('src');
      }, { once: true });
    });
  }

  window.SitePlayer = {
    init: function (streamUrl) {
      var box = document.querySelector('[data-player]');
      if (!box) {
        return;
      }
      var video = box.querySelector('video');
      var shade = box.querySelector('.player-shade');
      if (!video || !shade) {
        return;
      }
      var loaded = false;
      var hls = null;

      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        load();
        shade.classList.add('is-hidden');
        video.controls = true;
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            shade.classList.remove('is-hidden');
          });
        }
      }

      shade.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    setMenu();
    setHero();
    setImages();
    setFilters();
    setSearchValue();
  });
}());
