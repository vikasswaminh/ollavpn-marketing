// Fetch IP + geo, then fill in browser-side details.
  (async function () {
    try {
      const r = await fetch("/api/myip");
      if (r.ok) {
        const data = await r.json();
        if (data.ip) document.getElementById("ip-value").textContent = data.ip;
        if (data.geo) {
          const g = data.geo;
          const loc = [g.city, g.region, g.country_name || g.country].filter(Boolean).join(", ");
          if (loc) document.getElementById("geo-value").textContent = loc;
          if (g.isp) document.getElementById("isp-value").textContent = g.isp;
          if (g.asn) document.getElementById("asn-value").textContent = "AS" + g.asn;
        }
      } else {
        document.getElementById("ip-value").textContent = "Unable to detect";
      }
    } catch (_) {
      document.getElementById("ip-value").textContent = "Unable to detect";
    }
    try { document.getElementById("tz-value").textContent = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch(_){}
    document.getElementById("lang-value").textContent = navigator.language || "—";
    document.getElementById("screen-value").textContent =
      (screen && screen.width) ? (screen.width + " × " + screen.height + " (" + (window.devicePixelRatio || 1) + "x)") : "—";
    document.getElementById("dnt-value").textContent = navigator.doNotTrack === "1" ? "On" : "Off";
    document.getElementById("ua-value").textContent = navigator.userAgent || "—";
  })();

  // Scroll-spy for sticky right TOC.
  (function () {
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
  })();