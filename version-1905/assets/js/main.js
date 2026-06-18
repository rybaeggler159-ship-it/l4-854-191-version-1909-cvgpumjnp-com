(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function advance(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        advance(1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        advance(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        advance(1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function initCatalogFilters() {
    var catalog = document.querySelector("[data-catalog]");
    if (!catalog) {
      return;
    }

    var input = document.querySelector("[data-catalog-search]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card, .ranking-item"));
    var empty = document.querySelector("[data-empty-message]");
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q") || "";

    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function getActiveFilter() {
      var active = document.querySelector("[data-filter-value].active");
      return active ? active.getAttribute("data-filter-value") : "all";
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var activeFilter = normalize(getActiveFilter());
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = activeFilter === "all" || haystack.indexOf(activeFilter) !== -1;
        var shouldShow = matchesQuery && matchesFilter;

        card.classList.toggle("hidden-by-filter", !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });

        button.classList.add("active");
        apply();
      });
    });

    apply();
  }

  function initPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".video-box"));

    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-overlay");
      var url = box.getAttribute("data-video-url");
      var hls = null;

      function loadAndPlay() {
        if (!video || !url) {
          return;
        }

        if (!box.getAttribute("data-loaded")) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 60
            });
            hls.loadSource(url);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            video.src = url;
          }

          box.setAttribute("data-loaded", "true");
        }

        box.classList.add("is-playing");

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", loadAndPlay);
      }

      box.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }

        if (!box.classList.contains("is-playing")) {
          loadAndPlay();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initCatalogFilters();
    initPlayers();
  });
})();
