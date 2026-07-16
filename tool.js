// Shared JS helpers for the /tools/* pages.
// Provides toolPage.run(slug, opts) that wires up the form submission +
// fetch + result render + verdict styling. Plus a scroll-spy for the right TOC.

window.toolPage = (function () {
  function setupScrollSpy() {
    var rail = document.querySelector(".toc-rail");
    if (!rail) return;
    var links = new Map();
    rail.querySelectorAll("a").forEach(function (a) {
      var id = a.getAttribute("href").replace("#", "");
      links.set(id, a);
    });
    var headings = document.querySelectorAll(".article h2[id]");
    if (!headings.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = links.get(e.target.id);
        if (!link) return;
        var li = link.closest("li");
        if (e.isIntersecting) li.classList.add("is-current");
        else li.classList.remove("is-current");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    headings.forEach(function (h) { obs.observe(h); });
  }

  function run(slug, opts) {
    var form = document.getElementById("check-form");
    var input = document.getElementById(opts.inputId);
    var btn = document.getElementById("check-btn");
    var result = document.getElementById("result");
    var verdict = document.getElementById("verdict");
    var verdictText = document.getElementById("verdict-text");
    if (!form || !input || !btn || !result || !verdict || !verdictText) return;

    var btnLabel = btn.textContent;

    function setVerdict(state, text) {
      verdict.classList.remove("up", "down", "warn");
      if (state) verdict.classList.add(state);
      verdictText.textContent = text;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var v = (input.value || "").trim();
      if (!v) return;
      result.hidden = false;
      btn.disabled = true;
      btn.textContent = "Checking…";
      setVerdict(null, "Checking…");

      try {
        var url = typeof opts.submit === "function" ? opts.submit(v) : opts.submit;
        var r = await fetch(url);
        var data = await r.json();
        var out = opts.render(data) || { verdict: "down", text: "No response." };
        setVerdict(out.verdict, out.text);
      } catch (err) {
        setVerdict("down", "Could not check — try again in a moment.");
      } finally {
        btn.disabled = false;
        btn.textContent = btnLabel;
      }
    });

    setupScrollSpy();
  }

  // Auto-init scroll-spy on DOMContentLoaded so pages without a form still get the TOC behavior.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupScrollSpy);
  } else {
    setupScrollSpy();
  }

  return { run: run };
})();
