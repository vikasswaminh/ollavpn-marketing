toolPage.run("headers-viewer", {
  inputId: "url-input",
  submit: function (v) { return "/api/headers?url=" + encodeURIComponent(v); },
  render: function (data) {
    if (data.error) return { verdict: "down", text: data.error };
    document.getElementById("r-url").textContent = data.url || "—";
    document.getElementById("r-status").textContent = data.final_status != null ? String(data.final_status) : "—";
    document.getElementById("r-elapsed").textContent = data.elapsed_ms != null ? (data.elapsed_ms + " ms") : "—";

    var out = document.getElementById("headers-output");
    out.replaceChildren();
    var headers = data.headers || [];
    var block = document.createElement("div");
    block.className = "records-block";
    var heading = document.createElement("h4");
    heading.textContent = "Response headers · " + headers.length;
    var ul = document.createElement("ul");
    headers.forEach(function (h) {
      var k = h[0], v = h[1];
      var li = document.createElement("li");
      var strong = document.createElement("strong");
      strong.style.color = "var(--red)";
      strong.textContent = k + ": ";
      li.appendChild(strong);
      li.appendChild(document.createTextNode(String(v)));
      ul.appendChild(li);
    });
    block.appendChild(heading);
    block.appendChild(ul);
    out.appendChild(block);

    var ok = (data.final_status >= 200 && data.final_status < 400);
    return { verdict: ok ? "up" : "warn", text: "Got " + headers.length + " headers back (" + (data.final_status || "n/a") + ")." };
  }
});
