(function () {
  document.documentElement.classList.add('js-reveal');

  // Nav scroll-shadow (ItemUI #16): once the page is scrolled past the
  // top, add .scrolled so the nav grows a soft drop-shadow that separates
  // it from page content. At rest the nav sits flat with just its 1px
  // bottom line. Replaces the old glassmorphism blur.
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach((el) => {
      io.observe(el);
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
    setTimeout(() => reveals.forEach((el) => el.classList.add('in')), 1200);
  }

  // Live throughput
  const speed = document.querySelector('[data-live-speed]');
  if (speed) {
    setInterval(() => { speed.textContent = (9.6 + Math.random() * 0.3).toFixed(2); }, 1500);
  }
  // Servers count
  const servers = document.querySelector('[data-live-servers]');
  if (servers) {
    let n = 4187;
    setInterval(() => { n += Math.random() > 0.5 ? 1 : 0; servers.textContent = n.toLocaleString(); }, 4000);
  }

  // FAQ
  document.querySelectorAll('[data-faq]').forEach((item) => {
    const btn = item.querySelector('.faq-q');
    btn?.addEventListener('click', () => item.classList.toggle('open'));
  });

  // Pricing toggle
  const monthly = document.querySelector('[data-bill="monthly"]');
  const yearly = document.querySelector('[data-bill="yearly"]');
  function setBill(period) {
    document.querySelectorAll('[data-price]').forEach((el) => {
      el.textContent = period === 'yearly' ? el.dataset.priceYearly : el.dataset.priceMonthly;
    });
    document.querySelectorAll('[data-price-was]').forEach((el) => {
      el.textContent = period === 'yearly' ? el.dataset.priceWasYearly : el.dataset.priceWasMonthly;
    });
    document.querySelectorAll('[data-bill-period]').forEach((el) => {
      el.textContent = period === 'yearly' ? '/mo · billed yearly' : '/mo · billed monthly';
    });
    monthly?.classList.toggle('active', period === 'monthly');
    yearly?.classList.toggle('active', period === 'yearly');
  }
  monthly?.addEventListener('click', () => setBill('monthly'));
  yearly?.addEventListener('click', () => setBill('yearly'));
  if (monthly && yearly) setBill('yearly');

  // Live installer SHA-256: fetch /dl/installer.json (emitted by the
  // build script) and inject the real hash into the .sha-box on /dl/.
  // Falls back silently to the hardcoded placeholder if the file isn't
  // there yet (e.g. before the first installer build, or on a clean
  // pages preview deploy). Page still works either way.
  const shaTarget = document.querySelector('[data-installer-sha]');
  if (shaTarget) {
    fetch('/dl/installer.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((meta) => {
        if (meta && typeof meta.sha256 === 'string' && /^[0-9a-f]{64}$/.test(meta.sha256)) {
          shaTarget.textContent = meta.sha256;
          // Surface a friendly "built X minutes ago" hint above the hash
          // so the user can sanity-check freshness without opening JSON.
          const lab = shaTarget.closest('.sha-box')?.querySelector('.lab');
          if (lab && meta.built_at) {
            try {
              const d = new Date(meta.built_at);
              if (!isNaN(d.getTime())) {
                lab.dataset.originalLabel = lab.textContent;
                lab.textContent = `SHA-256 · built ${d.toUTCString()} · click to copy`;
              }
            } catch (e) { /* ignore — leave default label */ }
          }
        }
      })
      .catch(() => { /* silently keep the placeholder */ });
  }

  // Click-to-copy: SHA-256 hash on /dl/ (and any future .copy-on-click target)
  document.querySelectorAll('.sha-box .h, [data-copy]').forEach((el) => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', async () => {
      const text = el.dataset.copy || el.textContent.trim();
      try { await navigator.clipboard.writeText(text); }
      catch { return; }
      const label = el.closest('.sha-box')?.querySelector('.lab');
      const original = label?.textContent;
      if (label) {
        label.textContent = 'SHA-256 · copied ✓';
        setTimeout(() => { label.textContent = original; }, 1600);
      }
    });
  });

  // Testimonial marquee pause on hover handled in CSS

  // Mobile hamburger — builds the drawer on first tap by cloning desktop
  // nav items, then toggles body.mobile-nav-open. Closes on Esc, on
  // backdrop tap, and on any in-drawer link click (so navigation feels
  // immediate). Drawer is built once and re-used across opens.
  const hamburger = document.querySelector('.nav-hamburger');
  if (hamburger) {
    let drawer = null;
    let backdrop = null;

    const closeDrawer = () => {
      document.body.classList.remove('mobile-nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    };

    const buildDrawer = () => {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-drawer-backdrop';
      backdrop.addEventListener('click', closeDrawer);

      drawer = document.createElement('aside');
      drawer.className = 'mobile-drawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-label', 'Site navigation');

      // For each .nav-item dropdown, lift its inner mega-col contents up
      // as flat sections prefixed by the trigger label ("Product · Features").
      document.querySelectorAll('.nav-links > .nav-item').forEach((item) => {
        const triggerText = (item.firstChild?.textContent || '')
          .replace(/▾/g, '').trim();
        item.querySelectorAll('.mega-col').forEach((col) => {
          const section = document.createElement('section');
          const h5 = col.querySelector('h5');
          const heading = document.createElement('h5');
          heading.textContent = h5
            ? triggerText + ' · ' + h5.textContent
            : triggerText;
          section.appendChild(heading);
          col.querySelectorAll('a').forEach((a) => {
            const clone = a.cloneNode(true);
            clone.querySelectorAll('.sub').forEach((s) => s.remove());
            section.appendChild(clone);
          });
          drawer.appendChild(section);
        });
      });

      // Flat links (Apps, Download) get their own section
      const flat = document.querySelectorAll('.nav-links > a');
      if (flat.length) {
        const section = document.createElement('section');
        const heading = document.createElement('h5');
        heading.textContent = 'Quick links';
        section.appendChild(heading);
        flat.forEach((a) => section.appendChild(a.cloneNode(true)));
        drawer.appendChild(section);
      }

      // Persistent CTAs at drawer bottom (sign-in moves here per CSS)
      const cta = document.createElement('div');
      cta.className = 'mobile-cta';
      const signIn = document.createElement('a');
      signIn.href = 'https://login.ollavpn.com/';
      signIn.className = 'ghost';
      signIn.textContent = 'Sign in';
      const download = document.createElement('a');
      download.href = '/dl/';
      download.className = 'primary';
      download.textContent = 'Download free →';
      cta.appendChild(signIn);
      cta.appendChild(download);
      drawer.appendChild(cta);

      drawer.querySelectorAll('a').forEach((a) =>
        a.addEventListener('click', closeDrawer)
      );

      document.body.appendChild(backdrop);
      document.body.appendChild(drawer);
    };

    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation menu');
    hamburger.addEventListener('click', () => {
      if (!drawer) buildDrawer();
      if (document.body.classList.contains('mobile-nav-open')) closeDrawer();
      else {
        document.body.classList.add('mobile-nav-open');
        hamburger.setAttribute('aria-expanded', 'true');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' &&
          document.body.classList.contains('mobile-nav-open')) closeDrawer();
    });
  }
})();


// Commitment-tier toggle (1mo / 12mo / 24mo) for pricing.html & index.html
(function () {
  let activeCommit = "mo24";
  function setCommit(commit) {
    activeCommit = commit;
    document.querySelectorAll(".commit-toggle button").forEach((b) => {
      const on = b.dataset.commit === commit;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".commit-val, .commit-val-inline").forEach((el) => {
      el.classList.toggle("active", el.dataset.commit === commit);
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".commit-toggle button").forEach((b) => {
      b.addEventListener("click", () => setCommit(b.dataset.commit));
    });
  });
  if (document.readyState !== "loading") {
    document.querySelectorAll(".commit-toggle button").forEach((b) => {
      b.addEventListener("click", () => setCommit(b.dataset.commit));
    });
  }

  // Notify-me form wire-up for Pro + Business pricing cards
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".notify-form").forEach((form) => {
      const tier = form.dataset.tier;
      const input = form.querySelector('input[type="email"]');
      const button = form.querySelector("button");
      const msg = form.querySelector(".msg");
      const baseMsg = msg ? msg.textContent : "";

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = (input.value || "").trim();
        if (!email) return;
        form.classList.remove("success", "error");
        button.disabled = true;
        if (msg) msg.textContent = "Adding you to the list...";
        try {
          const activeCommitBtn = document.querySelector(".commit-toggle button.active");
          const commitVal = activeCommitBtn ? activeCommitBtn.dataset.commit : activeCommit;
          const r = await fetch("/api/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, tier, commit: commitVal }),
          });
          const j = await r.json().catch(() => ({}));
          if (r.ok && j.ok) {
            form.classList.add("success");
            if (msg) msg.textContent = "You're on the list — we'll email you at launch.";
            input.value = "";
          } else {
            form.classList.add("error");
            if (msg) msg.textContent = j.error || "Couldn't add you. Try again?";
          }
        } catch (err) {
          form.classList.add("error");
          if (msg) msg.textContent = "Network error. Try again?";
        } finally {
          button.disabled = false;
          setTimeout(() => {
            if (msg && !form.classList.contains("error")) msg.textContent = baseMsg;
          }, 6000);
        }
      });
    });
  });

  // Global TOC Scroll-Spy for Pillar & Landing Guides
  document.addEventListener("DOMContentLoaded", () => {
    const rail = document.querySelector(".toc-rail");
    if (!rail) return;
    const links = new Map();
    rail.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("#")) {
        const id = href.replace("#", "");
        const target = document.getElementById(id);
        if (target) links.set(target, a.closest("li") || a);
      }
    });
    if (!links.size) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((li) => li.classList.remove("is-current"));
          const activeLi = links.get(entry.target);
          if (activeLi) activeLi.classList.add("is-current");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    links.forEach((_, target) => observer.observe(target));
  });
})();
