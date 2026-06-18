(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.handleImageError = function handleImageError(img) {
    var wrap = img.closest(".poster-ratio, .hero-poster, .rank-poster");
    if (wrap) {
      wrap.classList.add("is-missing");
    }
    img.style.display = "none";
  };

  function initMobileMenu() {
    var header = qs(".site-header");
    var toggle = qs("[data-menu-toggle]");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", header.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var backdrop = qs("[data-hero-backdrop]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
      var image = slides[index].getAttribute("data-hero-image");
      if (backdrop && image) {
        backdrop.style.setProperty("--hero-image", "url('" + image + "')");
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    qsa("[data-filter-form]").forEach(function (form) {
      var targetSelector = form.getAttribute("data-target") || "[data-filter-grid]";
      var grid = qs(targetSelector);
      if (!grid) {
        return;
      }
      var cards = qsa("[data-card]", grid);
      var countNode = qs("[data-filter-count]");
      var emptyNode = qs("[data-empty-state]");

      function applyFilter() {
        var query = normalize((qs("[data-filter-query]", form) || {}).value);
        var type = normalize((qs("[data-filter-type]", form) || {}).value);
        var year = normalize((qs("[data-filter-year]", form) || {}).value);
        var region = normalize((qs("[data-filter-region]", form) || {}).value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (type && normalize(card.getAttribute("data-type")) !== type) {
            ok = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            ok = false;
          }
          if (region && normalize(card.getAttribute("data-region")) !== region) {
            ok = false;
          }
          card.classList.toggle("hidden-card", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = String(visible);
        }
        if (emptyNode) {
          emptyNode.hidden = visible !== 0;
        }
      }

      form.addEventListener("input", applyFilter);
      form.addEventListener("change", applyFilter);
      applyFilter();
    });
  }

  function initSearchPage() {
    var root = qs("[data-search-page]");
    if (!root || !window.MOVIE_DATA) {
      return;
    }
    var input = qs("[data-search-input]", root);
    var results = qs("[data-search-results]", root);
    var count = qs("[data-search-result-count]", root);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (input) {
      input.value = initialQuery;
    }

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join("");
      return [
        '<article class="movie-card" data-card>',
        '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
        '    <span class="poster-ratio">',
        '      <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="handleImageError(this)">',
        '      <span class="poster-fallback">亚洲<br>最新电影</span>',
        '      <span class="badge">' + escapeHtml(movie.year) + '</span>',
        '      <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
        '    </span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h3 class="card-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '    <p class="card-desc">' + escapeHtml(movie.one_line) + '</p>',
        '    <div class="card-tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join("\n");
    }

    function render() {
      var query = normalize(input ? input.value : "");
      var list = window.MOVIE_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.one_line,
          (movie.tags || []).join(" ")
        ].join(" "));
        return !query || haystack.indexOf(query) !== -1;
      });
      var limited = query ? list.slice(0, 300) : list.slice(0, 120);
      results.innerHTML = limited.map(cardTemplate).join("\n");
      if (count) {
        count.textContent = String(list.length);
      }
    }

    if (input) {
      input.addEventListener("input", render);
    }
    render();
  }

  function initPlayers() {
    qsa("[data-player]").forEach(function (box) {
      var video = qs("video", box);
      var startButton = qs("[data-player-start]", box);
      var sourceButtons = qsa("[data-source]", box.parentElement || document);
      var hls = null;
      var loaded = false;

      if (!video) {
        return;
      }

      function destroyHls() {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
        hls = null;
      }

      function loadMp4() {
        destroyHls();
        var mp4Source = box.getAttribute("data-mp4");
        if (mp4Source && video.getAttribute("src") !== mp4Source) {
          video.src = mp4Source;
        }
        loaded = true;
      }

      function loadHls() {
        var hlsSource = box.getAttribute("data-hls");
        if (!hlsSource || window.location.protocol === "file:") {
          loadMp4();
          return;
        }
        destroyHls();
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsSource;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(hlsSource);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              loadMp4();
              video.play();
            }
          });
        } else {
          loadMp4();
          return;
        }
        loaded = true;
      }

      function setActive(type) {
        sourceButtons.forEach(function (button) {
          button.classList.toggle("is-active", button.getAttribute("data-source") === type);
        });
      }

      function playVideo() {
        if (!loaded) {
          loadHls();
          setActive("hls");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            box.classList.remove("is-playing");
          });
        }
      }

      if (startButton) {
        startButton.addEventListener("click", function () {
          box.classList.add("is-playing");
          playVideo();
        });
      }

      sourceButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var type = button.getAttribute("data-source");
          if (type === "mp4") {
            loadMp4();
          } else {
            loadHls();
            type = "hls";
          }
          setActive(type);
          box.classList.add("is-playing");
          video.play();
        });
      });

      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove("is-playing");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
}());
