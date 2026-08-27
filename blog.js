// OllaVPN Blog Engine - Unified & 100% CSP 'self' Compliant
(function () {
  "use strict";

  // ==========================================
  // 1. Blog Index: Interactive Category & Topic Search Filter
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

  function applyFilter(cat, explicitSearch) {
    if (cat !== undefined) {
      currentCategory = cat || 'all';
    }

    var cards = document.querySelectorAll('.post-card');
    if (!cards.length) return;

    var sideSearchInput = document.getElementById('sidebar-blog-search');
    var mainSearchInput = document.getElementById('blog-search');
    var rawSearch = explicitSearch !== undefined ? explicitSearch : (
      (sideSearchInput && sideSearchInput.value) || 
      (mainSearchInput && mainSearchInput.value) || 
      ''
    );
    var searchVal = rawSearch.toLowerCase().trim();
    var searchTerms = searchVal ? searchVal.split(/\s+/).filter(Boolean) : [];

    var visibleCount = 0;

    // Update active button classes
    var filterButtons = document.querySelectorAll('.side-filter-btn, .pill-btn');
    for (var i = 0; i < filterButtons.length; i++) {
      var btn = filterButtons[i];
      var bCat = btn.getAttribute('data-cat');
      if (bCat === currentCategory && !searchVal) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }

    // Update heading title
    var headingEl = document.getElementById('active-cat-title');
    if (headingEl) {
      if (searchVal) {
        headingEl.textContent = 'Results for "' + rawSearch.trim() + '"';
      } else {
        headingEl.textContent = catTitles[currentCategory] || 'Articles';
      }
    }

    // Filter article cards
    for (var j = 0; j < cards.length; j++) {
      var card = cards[j];
      var cardCat = card.getAttribute('data-category') || '';
      var isPillar = card.getAttribute('data-pillar') === 'true';
      var text = (card.textContent || '').toLowerCase();
      var href = (card.getAttribute('href') || '').toLowerCase();
      var fullSearchable = text + ' ' + cardCat + ' ' + href;

      // Category matching:
      // If user typed a search query, search across all articles unless a specific category was picked
      var matchesCat = true;
      if (!searchVal) {
        matchesCat = (currentCategory === 'all') || (currentCategory === 'pillars' && isPillar) || (cardCat === currentCategory);
      }

      // Keyword matching (all terms must match)
      var matchesSearch = true;
      if (searchTerms.length > 0) {
        for (var t = 0; t < searchTerms.length; t++) {
          if (fullSearchable.indexOf(searchTerms[t]) === -1) {
            matchesSearch = false;
            break;
          }
        }
      }

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    }

    var noResultsEl = document.getElementById('no-results');
    if (noResultsEl) {
      noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // Update URL hash without jumping (only when not searching)
    try {
      if (window.history && window.history.replaceState && !searchVal) {
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
      applyFilter(catParam);
    } else {
      applyFilter('all');
    }
  }

  // ==========================================
  // 2. Floating Category Drawer (Mobile)
  // ==========================================
  function toggleDrawer() {
    var drawer = document.getElementById('catDrawer');
    if (drawer) {
      drawer.classList.toggle('open');
    }
  }

  // ==========================================
  // 3. Global Event Delegation
  // ==========================================
  document.addEventListener('click', function (e) {
    // Filter click
    var filterBtn = e.target.closest('[data-cat], .side-filter-btn, .pill-btn');
    if (filterBtn) {
      var cat = filterBtn.getAttribute('data-cat');
      if (cat) {
        e.preventDefault();
        // Clear search inputs when user explicitly clicks a category
        var sideSearch = document.getElementById('sidebar-blog-search');
        var mainSearch = document.getElementById('blog-search');
        if (sideSearch) sideSearch.value = '';
        if (mainSearch) mainSearch.value = '';
        applyFilter(cat, '');
        return;
      }
    }

    // Reset filter click
    if (e.target.closest('[data-reset-filter]')) {
      e.preventDefault();
      var sideSearchInput = document.getElementById('sidebar-blog-search');
      var searchInput = document.getElementById('blog-search');
      if (sideSearchInput) sideSearchInput.value = '';
      if (searchInput) searchInput.value = '';
      applyFilter('all', '');
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

  // Live Search Event Listeners
  function handleSearchLive(e) {
    var target = e.target;
    if (target && (target.id === 'sidebar-blog-search' || target.id === 'blog-search' || target.classList.contains('sidebar-search-input'))) {
      applyFilter(currentCategory, target.value);
    }
  }

  document.addEventListener('input', handleSearchLive);
  document.addEventListener('search', handleSearchLive);
  document.addEventListener('paste', function(e) {
    setTimeout(function() { handleSearchLive(e); }, 10);
  });

  document.addEventListener('keyup', function (e) {
    var target = e.target;
    if (target && (target.id === 'sidebar-blog-search' || target.id === 'blog-search' || target.classList.contains('sidebar-search-input'))) {
      if (e.key === 'Escape') {
        target.value = '';
        applyFilter(currentCategory, '');
      } else {
        applyFilter(currentCategory, target.value);
      }
    }
  });

  window.addEventListener('hashchange', initFilterFromURL);

  // Reading-Progress Bar removed

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

  // Initialize on load & attach direct listeners
  function initEngine() {
    initFilterFromURL();

    var sideSearch = document.getElementById('sidebar-blog-search');
    if (sideSearch) {
      sideSearch.addEventListener('input', function() {
        applyFilter(currentCategory, this.value);
      });
      sideSearch.addEventListener('keyup', function(e) {
        if (e.key === 'Escape') {
          this.value = '';
          applyFilter(currentCategory, '');
        } else {
          applyFilter(currentCategory, this.value);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }
})();
