// OllaVPN Blog Engine - 100% CSP 'self' compliant (zero inline scripts/handlers)
(function () {
  'use strict';

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
    var searchInput = document.getElementById('blog-search');
    var searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var visibleCount = 0;

    // Update active state in sidebar and pill bar
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

    // Update heading
    var headingEl = document.getElementById('active-cat-title');
    if (headingEl) {
      var titleText = catTitles[currentCategory] || 'Articles';
      headingEl.innerHTML = titleText + ' <span class="filter-badge" id="visible-count">0</span>';
    }

    // Filter each article card
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
    if (countEl) {
      countEl.textContent = visibleCount;
    }

    var noResultsEl = document.getElementById('no-results');
    if (noResultsEl) {
      noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // Update URL hash without jump
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

  // Floating category drawer toggler
  function toggleDrawer() {
    var drawer = document.getElementById('catDrawer');
    if (drawer) {
      drawer.classList.toggle('open');
    }
  }

  // Universal event delegation for all clicks (No inline onclick attributes required)
  document.addEventListener('click', function (e) {
    // Check if clicked filter button or category pill
    var filterBtn = e.target.closest('[data-cat], .side-filter-btn, .pill-btn');
    if (filterBtn) {
      var cat = filterBtn.getAttribute('data-cat');
      if (cat) {
        e.preventDefault();
        applyCategoryFilter(cat);
        return;
      }
    }

    // Check if clicked reset button in no-results
    if (e.target.closest('[data-reset-filter]')) {
      e.preventDefault();
      applyCategoryFilter('all');
      return;
    }

    // Check if clicked floating drawer trigger or close button
    if (e.target.closest('#catDrawerBtn, .drawer-close')) {
      e.preventDefault();
      toggleDrawer();
      return;
    }

    // Close drawer if clicking outside
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilterFromURL);
  } else {
    initFilterFromURL();
  }
})();
