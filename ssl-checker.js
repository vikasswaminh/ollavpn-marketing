function fmtDate(s) { try { return new Date(s).toISOString().slice(0, 10); } catch(_) { return s || "—"; } }
toolPage.run("ssl-checker", {
  inputId: "domain-input",
  submit: function (v) { return "/api/ssl?domain=" + encodeURIComponent(v); },
  render: function (data) {
    if (data.error) return { verdict: "down", text: data.error };
    document.getElementById("r-domain").textContent = data.domain || "—";
    document.getElementById("r-issuer").textContent = data.issuer || "—";
    document.getElementById("r-valid").textContent = data.valid ? "Yes" : "No";
    document.getElementById("r-not-after").textContent = fmtDate(data.not_after);
    document.getElementById("r-days").textContent = data.days_remaining != null ? (data.days_remaining + " days") : "—";
    document.getElementById("r-proto").textContent = data.protocol || "—";
    document.getElementById("r-cipher").textContent = data.cipher || "—";

    var v = "down", t = "Certificate is invalid or untrusted.";
    if (data.valid) {
      if (data.days_remaining > 30) { v = "up"; t = "Valid TLS certificate · " + data.days_remaining + " days left."; }
      else if (data.days_remaining >= 0) { v = "warn"; t = "Expiring soon · " + data.days_remaining + " days remaining."; }
      else { v = "down"; t = "Expired " + Math.abs(data.days_remaining) + " days ago."; }
    }
    return { verdict: v, text: t };
  }
});
