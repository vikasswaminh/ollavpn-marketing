toolPage.run("dns-lookup", {
  inputId: "domain-input",
  submit: function (v) { return "/api/dns?domain=" + encodeURIComponent(v); },
  render: function (data) {
    if (data.error) return { verdict: "down", text: data.error };
    var out = document.getElementById("records-output");
    out.replaceChildren();
    var records = data.records || {};
    var types = Object.keys(records).sort();
    var totalCount = 0;
    types.forEach(function (type) {
      var items = records[type];
      if (!Array.isArray(items) || !items.length) return;
      totalCount += items.length;
      var block = document.createElement("div");
      block.className = "records-block";
      var heading = document.createElement("h4");
      heading.textContent = type + " · " + items.length + " record" + (items.length > 1 ? "s" : "");
      var ul = document.createElement("ul");
      items.forEach(function (it) {
        var li = document.createElement("li");
        li.textContent = it;
        ul.appendChild(li);
      });
      block.appendChild(heading);
      block.appendChild(ul);
      out.appendChild(block);
    });
    return { verdict: totalCount > 0 ? "up" : "warn",
             text: totalCount > 0 ? ("Found " + totalCount + " records across " + types.length + " types.") : "No records returned for that domain." };
  }
});
