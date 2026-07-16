// Blog reading-experience polish — Phase 2 (2026-06-10).
// Two features:
//   1) Reading-progress bar — fills as the reader scrolls through .article
//   2) Anchor-copy '#' icon next to every <article> h2 — click to copy the
//      canonical URL with #section-id to clipboard
//
// Loaded by every blog/article page via <script defer src="/blog.js">.
// Safe no-op if .article or .reading-progress isn't present (e.g. nav pages).

(function () {
  "use strict";

  // ---------- 1. Reading-progress bar ----------
  const bar = document.querySelector(".reading-progress");
  const article = document.querySelector(".article");
  if (bar && article) {
    let raf = 0;
    function update() {
      raf = 0;
      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const articleHeight = article.offsetHeight - window.innerHeight;
      if (articleHeight <= 0) {
        bar.style.width = "100%";
        return;
      }
      const progress = (window.scrollY - articleTop) / articleHeight;
      const pct = Math.max(0, Math.min(1, progress)) * 100;
      bar.style.width = pct.toFixed(2) + "%";
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!raf) raf = requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  }

  // ---------- 2. Anchor-copy on H2 hover ----------
  document.querySelectorAll(".article h2[id]").forEach(function (h2) {
    const a = document.createElement("a");
    a.className = "anchor-copy";
    a.href = "#" + h2.id;
    a.textContent = "#";
    a.setAttribute("aria-label", "Copy link to this section");
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      const url = window.location.origin + window.location.pathname + "#" + h2.id;
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
      // Also update history so back-button works as expected
      history.pushState(null, "", "#" + h2.id);
      h2.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    h2.appendChild(a);
  });

  // ---------- 3. Share-row "Copy link" + share targets ----------
  document.querySelectorAll(".share-row .copy-link").forEach(function (btn) {
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      const url = window.location.origin + window.location.pathname;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          const label = btn.querySelector(".share-text") || btn;
          const orig = label.textContent;
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

  // ---------- 4. Inline newsletter signup ----------
  document.querySelectorAll(".inline-newsletter form").forEach(function (form) {
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector("button");
    const wrapper = form.closest(".inline-newsletter");
    const msg = wrapper ? wrapper.querySelector(".msg") : null;
    if (!input || !button || !msg) return;
    const baseMsg = msg.textContent;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = (input.value || "").trim();
      if (!email) return;
      wrapper.classList.remove("success", "error");
      button.disabled = true;
      msg.textContent = "Subscribing…";
      try {
        const r = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, tier: "pro", commit: "mo24", source: "blog-newsletter" }),
        });
        if (r.ok) {
          wrapper.classList.add("success");
          msg.textContent = "Subscribed. We'll email you new posts.";
          input.value = "";
        } else {
          wrapper.classList.add("error");
          msg.textContent = "Couldn't subscribe. Try again?";
        }
      } catch (err) {
        wrapper.classList.add("error");
        msg.textContent = "Network error. Try again?";
      } finally {
        button.disabled = false;
        setTimeout(function () {
          if (!wrapper.classList.contains("error")) msg.textContent = baseMsg;
        }, 6000);
      }
    });
  });

  // ---------- 5. Right-rail TOC current-section highlight ----------
  // Already partially wired via CSS; we add IntersectionObserver here so
  // the .is-current class follows the section currently in view.
  const tocLinks = document.querySelectorAll(".toc-rail ol li a, .toc-inline ol li a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const tocMap = new Map();
    tocLinks.forEach(function (link) {
      const id = (link.getAttribute("href") || "").replace(/^#/, "");
      if (id) tocMap.set(id, link.parentElement);
    });
    const sections = Array.from(document.querySelectorAll(".article h2[id]"));
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            tocMap.forEach(function (li) { li.classList.remove("is-current"); });
            const li = tocMap.get(e.target.id);
            if (li) li.classList.add("is-current");
          }
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { obs.observe(s); });
  }
})();
