document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var navLinks = document.querySelector("[data-nav-links]");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length > 1) {
    var currentSlide = 0;
    var showSlide = function (index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === currentSlide);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var categorySelect = document.querySelector("[data-category-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
  var countNode = document.querySelector("[data-result-count]");
  var emptyNode = document.querySelector("[data-empty-state]");

  var filterCards = function () {
    if (!cards.length) {
      return;
    }

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var category = categorySelect ? categorySelect.value : "all";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || ""
      ].join(" ");
      var cardCategory = card.getAttribute("data-category") || "";
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var categoryMatch = category === "all" || cardCategory === category;
      var visible = keywordMatch && categoryMatch;

      card.style.display = visible ? "" : "none";
      if (visible) {
        visibleCount += 1;
      }
    });

    if (countNode) {
      countNode.textContent = String(visibleCount);
    }
    if (emptyNode) {
      emptyNode.style.display = visibleCount ? "none" : "block";
    }
  };

  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
  }
  if (categorySelect) {
    categorySelect.addEventListener("change", filterCards);
  }
  filterCards();
});

function setupVideoPlayer(source, options) {
  var settings = options || {};
  var video = document.getElementById(settings.videoId || "movie-player");
  var overlay = document.querySelector(settings.overlaySelector || ".player-overlay");
  var started = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  var attachSource = function () {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  };

  var startPlayback = function () {
    if (!started) {
      started = true;
      attachSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  };

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (!started) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
