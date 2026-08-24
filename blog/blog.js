// OllaVPN Blog Engine - Unified & 100% CSP 'self' Compliant
(function () {
  "use strict";

  // ==========================================
  // 1. Blog Index: Interactive Category Filter
  // ==========================================
  var catTitles = {
    'all': 'All Articles',
    'pillars': 'Pillar Guides',
    'comparisons': 'VPN Comparisons',
    'buyer-guides': 'Buyer Guides',
    'privacy-security': 'Privacy & Security Guides',
    'how-to-guides': 'How-To Tutorials',
    'beginner-basics': 'Beginner Basics',
    'protocol-tech': 'Protocols & Cryptography',
    'use-cases': 'Streaming & Use Cases'
  };

  var currentCategory = 'all';

  function applyCategoryFilter(cat) {
    currentCategory = cat || 'all';
    var cards = document.querySelectorAll('.post-card');
    if (!cards.length) return;

    var searchInput = document.getElementById('blog-search');
    var sideSearchInput = document.getElementById('sidebar-blog-search');
    var searchVal = '';
    if (sideSearchInput && sideSearchInput.value.trim()) {
      searchVal = sideSearchInput.value.toLowerCase().trim();
    } else if (searchInput && searchInput.value.trim()) {
      searchVal = searchInput.value.toLowerCase().trim();
    }
    var visibleCount = 0;

    // Update active button classes
    var filterButtons = document.querySelectorAll('.side-filter-btn, .pill-btn');
    for (var i = 0; i < filterButtons.length; i++) {
      var btn = filterButtons[i];
      var bCat = btn.getAttribute('data-cat');
      if (bCat === currentCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }

    // Update heading title
    var headingEl = document.getElementById('active-cat-title');
    if (headingEl) {
      var titleText = catTitles[currentCategory] || 'Articles';
      headingEl.innerHTML = titleText + ' <span class="filter-badge" id="visible-count">0</span>';
    }

    // Filter article cards
    for (var j = 0; j < cards.length; j++) {
      var card = cards[j];
      var cardCat = card.getAttribute('data-category');
      var isPillar = card.getAttribute('data-pillar') === 'true';
      var text = card.textContent.toLowerCase();

      var matchesCat = (currentCategory === 'all') || (currentCategory === 'pillars' && isPillar) || (cardCat === currentCategory);
      var matchesSearch = !searchVal || text.indexOf(searchVal) !== -1;

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    }

    var countEl = document.getElementById('visible-count');
    if (countEl) countEl.textContent = visibleCount;

    var noResultsEl = document.getElementById('no-results');
    if (noResultsEl) {
      noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // Update URL hash without jumping
    try {
      if (window.history && window.history.replaceState) {
        var newHash = currentCategory === 'all' ? '' : '#' + currentCategory;
        var newUrl = window.location.pathname + (window.location.search || '') + newHash;
        window.history.replaceState(null, '', newUrl);
      }
    } catch (e) {}
  }

  function initFilterFromURL() {
    var hash = (window.location.hash || '').replace('#', '').trim();
    var urlParams = new URLSearchParams(window.location.search);
    var catParam = urlParams.get('cat') || urlParams.get('category') || hash;

    if (catParam && catTitles[catParam]) {
      applyCategoryFilter(catParam);
    } else {
      applyCategoryFilter('all');
    }
  }

  // ==========================================
  // 2. Floating Category Drawer (All Articles)
  // ==========================================
  function toggleDrawer() {
    var drawer = document.getElementById('catDrawer');
    if (drawer) {
      drawer.classList.toggle('open');
    }
  }

  // ==========================================
  // 3. Global Click Delegation
  // ==========================================
  document.addEventListener('click', function (e) {
    // Filter click
    var filterBtn = e.target.closest('[data-cat], .side-filter-btn, .pill-btn');
    if (filterBtn) {
      var cat = filterBtn.getAttribute('data-cat');
      if (cat) {
        e.preventDefault();
        applyCategoryFilter(cat);
        return;
      }
    }

    // Reset filter click
    if (e.target.closest('[data-reset-filter]')) {
      e.preventDefault();
      applyCategoryFilter('all');
      return;
    }

    // Floating drawer button or close icon
    if (e.target.closest('#catDrawerBtn, .drawer-close')) {
      e.preventDefault();
      toggleDrawer();
      return;
    }

    // Close drawer when clicking outside
    var drawer = document.getElementById('catDrawer');
    var drawerBtn = document.getElementById('catDrawerBtn');
    if (drawer && drawer.classList.contains('open')) {
      if (!drawer.contains(e.target) && !drawerBtn.contains(e.target)) {
        drawer.classList.remove('open');
      }
    }
  });

  // Search input live filtering
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'blog-search') {
      applyCategoryFilter(currentCategory);
    }
  });

  window.addEventListener('hashchange', initFilterFromURL);

  // ==========================================
  // 4. Reading-Progress Bar
  // ==========================================
  var bar = document.querySelector(".reading-progress");
  var article = document.querySelector(".article");
  if (bar && article) {
    var raf = 0;
    function updateProgress() {
      raf = 0;
      var rect = article.getBoundingClientRect();
      var articleTop = window.scrollY + rect.top;
      var articleHeight = article.offsetHeight - window.innerHeight;
      if (articleHeight <= 0) {
        bar.style.width = "100%";
        return;
      }
      var progress = (window.scrollY - articleTop) / articleHeight;
      var pct = Math.max(0, Math.min(1, progress)) * 100;
      bar.style.width = pct.toFixed(2) + "%";
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(updateProgress);
    }, { passive: true });
    updateProgress();
  }

  // ==========================================
  // 5. Section Anchor Copy & Share
  // ==========================================
  document.querySelectorAll(".article h2[id]").forEach(function (h2) {
    var a = document.createElement("a");
    a.className = "anchor-copy";
    a.href = "#" + h2.id;
    a.textContent = "#";
    a.setAttribute("aria-label", "Copy link to this section");
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      var url = window.location.origin + window.location.pathname + "#" + h2.id;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          a.classList.add("copied");
          a.textContent = "✓";
          setTimeout(function () {
            a.classList.remove("copied");
            a.textContent = "#";
          }, 1400);
        });
      }
      history.pushState(null, "", "#" + h2.id);
      h2.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    h2.appendChild(a);
  });

  document.querySelectorAll(".share-row .copy-link").forEach(function (btn) {
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      var url = window.location.origin + window.location.pathname;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          var label = btn.querySelector(".share-text") || btn;
          var orig = label.textContent;
          btn.classList.add("copied");
          label.textContent = "Copied!";
          setTimeout(function () {
            btn.classList.remove("copied");
            label.textContent = orig;
          }, 1600);
        });
      }
    });
  });

  // ==========================================
  // 6. Right-Rail TOC Scroll Spy
  // ==========================================
  var tocLinks = document.querySelectorAll(".toc-rail ol li a, .toc-inline ol li a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var tocMap = new Map();
    tocLinks.forEach(function (link) {
      var id = (link.getAttribute("href") || "").replace(/^#/, "");
      if (id) tocMap.set(id, link.parentElement);
    });
    var sections = Array.from(document.querySelectorAll(".article h2[id]"));
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            tocMap.forEach(function (li) { li.classList.remove("is-current"); });
            var li = tocMap.get(e.target.id);
            if (li) li.classList.add("is-current");
          }
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { obs.observe(s); });
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilterFromURL);
  } else {
    initFilterFromURL();
  }
})();
