(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var button = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
            button.textContent = opened ? "×" : "☰";
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var list = root.parentElement.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var items = Array.prototype.slice.call(list.querySelectorAll("[data-title]"));
            var search = root.querySelector("[data-filter-search]");
            var region = root.querySelector("[data-filter-region]");
            var year = root.querySelector("[data-filter-year]");
            var type = root.querySelector("[data-filter-type]");
            var category = root.querySelector("[data-filter-category]");
            function value(node) {
                return node ? String(node.value || "").trim().toLowerCase() : "";
            }
            function matchText(item, keyword) {
                if (!keyword) {
                    return true;
                }
                var text = [
                    item.getAttribute("data-title"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-type"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-genre"),
                    item.getAttribute("data-category")
                ].join(" ").toLowerCase();
                return text.indexOf(keyword) !== -1;
            }
            function apply() {
                var keyword = value(search);
                var regionValue = value(region);
                var yearValue = value(year);
                var typeValue = value(type);
                var categoryValue = value(category);
                items.forEach(function (item) {
                    var ok = true;
                    ok = ok && matchText(item, keyword);
                    ok = ok && (!regionValue || value({ value: item.getAttribute("data-region") }) === regionValue);
                    ok = ok && (!yearValue || value({ value: item.getAttribute("data-year") }) === yearValue);
                    ok = ok && (!typeValue || value({ value: item.getAttribute("data-type") }) === typeValue);
                    ok = ok && (!categoryValue || value({ value: item.getAttribute("data-category") }) === categoryValue);
                    item.classList.toggle("is-filter-hidden", !ok);
                });
            }
            [search, region, year, type, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && search) {
                search.value = q;
                apply();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();

function initMoviePlayer(src) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    if (!video || !src) {
        return;
    }
    var attached = false;
    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = src;
        }
    }
    function play() {
        attach();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }
    if (overlay) {
        overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
}
