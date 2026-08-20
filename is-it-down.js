(function () {
    var form = document.getElementById("check-form");
    var input = document.getElementById("url-input");
    var btn = document.getElementById("check-btn");
    var result = document.getElementById("result");
    var verdict = document.getElementById("verdict");
    var verdictText = document.getElementById("verdict-text");
    var sslRow = document.getElementById("ssl-row");
    var sslText = document.getElementById("ssl-text");

    function setResult(state) {
      verdict.classList.remove("up", "down");
      if (state) verdict.classList.add(state);
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var url = (input.value || "").trim();
      if (!url) return;
      result.hidden = false;
      btn.disabled = true;
      btn.textContent = "Checking…";
      setResult(null);
      verdictText.textContent = "Checking…";
      document.getElementById("r-url").textContent = "—";
      document.getElementById("r-status").textContent = "—";
      document.getElementById("r-elapsed").textContent = "—";
      document.getElementById("r-method").textContent = "—";
      sslRow.hidden = true;

      try {
        var r = await fetch("/api/uptime?url=" + encodeURIComponent(url));
        var data = await r.json();
        if (data.error) {
          setResult("down");
          verdictText.textContent = "Could not check — " + data.error;
        } else if (data.is_up) {
          setResult("up");
          verdictText.textContent = "It looks up. We reached it from our server.";
        } else {
          setResult("down");
          verdictText.textContent = "It looks down. Our check did not get a clean response.";
        }
        document.getElementById("r-url").textContent = data.final_url || url;
        document.getElementById("r-status").textContent = data.final_status != null ? String(data.final_status) : "—";
        document.getElementById("r-elapsed").textContent = data.elapsed_ms != null ? data.elapsed_ms + " ms" : "—";
        document.getElementById("r-method").textContent = data.method_used || "—";
        if (data.ssl) {
          sslRow.hidden = false;
          sslRow.classList.toggle("warn", !!data.ssl.warning || !data.ssl.valid);
          var parts = [];
          parts.push(data.ssl.valid ? "Valid" : "Invalid");
          if (data.ssl.days_remaining != null) parts.push(data.ssl.days_remaining + " days remaining");
          if (data.ssl.issuer_cn) parts.push("issued by " + data.ssl.issuer_cn);
          if (data.ssl.warning) parts.push("⚠ " + data.ssl.warning);
          sslText.textContent = parts.join(" · ");
        }
      } catch (err) {
        setResult("down");
        verdictText.textContent = "Could not check — try again in a moment.";
      } finally {
        btn.disabled = false;
        btn.textContent = "Check now";
      }
    });
  })();

  // Scroll-spy
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