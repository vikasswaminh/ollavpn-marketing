function fmtDate(s) { try { return new Date(s).toISOString().slice(0, 10); } catch(_) { return s || "—"; } }
toolPage.run("whois-lookup", {
  inputId: "domain-input",
  submit: function (v) { return "/api/whois?domain=" + encodeURIComponent(v); },
  render: function (data) {
    if (data.error) return { verdict: "down", text: data.error };
    document.getElementById("r-domain").textContent = data.domain || "—";
    document.getElementById("r-registrar").textContent = data.registrar || "—";
    document.getElementById("r-created").textContent = fmtDate(data.created);
    document.getElementById("r-expires").textContent = fmtDate(data.expires);
    document.getElementById("r-updated").textContent = fmtDate(data.updated);
    document.getElementById("r-status").textContent = data.status || "—";
    document.getElementById("r-ns").textContent = (data.name_servers || []).join(", ") || "—";

    var hasData = !!(data.registrar || data.created || data.expires);
    return { verdict: hasData ? "up" : "warn",
             text: hasData ? "Retrieved RDAP/WHOIS record for " + data.domain : "Limited RDAP data available." };
  }
});
