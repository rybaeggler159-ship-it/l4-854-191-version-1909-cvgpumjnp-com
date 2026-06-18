(function () {
    var navButton = document.querySelector(".menu-toggle");
    var navMenu = document.querySelector(".nav-menu");

    if (navButton && navMenu) {
        navButton.addEventListener("click", function () {
            var isOpen = navMenu.classList.toggle("open");
            navButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var slider = document.querySelector(".hero-slider");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === active);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
                startTimer();
            });
        });

        slider.addEventListener("mouseenter", stopTimer);
        slider.addEventListener("mouseleave", startTimer);
        startTimer();
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function renderSearch(input) {
        var resultsId = input.getAttribute("aria-controls");
        var panel = resultsId ? document.getElementById(resultsId) : null;
        var keyword = normalizeText(input.value);
        var list = window.SEARCH_INDEX || [];

        if (!panel) {
            return;
        }

        if (!keyword) {
            panel.classList.remove("show");
            panel.innerHTML = "";
            return;
        }

        var matches = list.filter(function (item) {
            return normalizeText(item.title + item.region + item.year + item.genre + item.tags).indexOf(keyword) !== -1;
        }).slice(0, 10);

        panel.innerHTML = matches.map(function (item) {
            return "<a class=\"search-result-item\" href=\"" + item.url + "\">" +
                "<img src=\"" + item.image + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\">" +
                "<span><strong>" + item.title + "</strong><span>" + item.region + " · " + item.year + " · " + item.genre + "</span></span>" +
                "</a>";
        }).join("");

        panel.classList.toggle("show", matches.length > 0);
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-search-input]")).forEach(function (input) {
        input.addEventListener("input", function () {
            renderSearch(input);
        });

        input.addEventListener("focus", function () {
            renderSearch(input);
        });
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".search-panel")) {
            Array.prototype.slice.call(document.querySelectorAll(".search-results")).forEach(function (panel) {
                panel.classList.remove("show");
            });
        }
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]")).forEach(function (input) {
        var selector = input.getAttribute("data-local-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(selector));

        input.addEventListener("input", function () {
            var keyword = normalizeText(input.value);

            cards.forEach(function (card) {
                var text = normalizeText(card.innerText + card.getAttribute("data-title") + card.getAttribute("data-region") + card.getAttribute("data-year") + card.getAttribute("data-category"));
                card.hidden = keyword && text.indexOf(keyword) === -1;
            });
        });
    });

    function prepareVideo(video) {
        if (!video || video.dataset.ready === "1") {
            return;
        }

        var source = video.querySelector("source");
        var streamUrl = source ? source.getAttribute("src") : video.getAttribute("src");

        if (!streamUrl) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video._hlsInstance = hls;
        } else {
            video.src = streamUrl;
        }

        video.dataset.ready = "1";
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");

        function playVideo() {
            prepareVideo(video);

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            if (video) {
                var playPromise = video.play();

                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("play", function () {
                prepareVideo(video);

                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
        }
    });

    window.addEventListener("beforeunload", function () {
        Array.prototype.slice.call(document.querySelectorAll("video")).forEach(function (video) {
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
            }
        });
    });
})();
