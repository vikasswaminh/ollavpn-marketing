toolPage.run("email-verifier", {
  inputId: "email-input",
  submit: function (v) { return "/api/email?email=" + encodeURIComponent(v); },
  render: function (data) {
    if (data.error) return { verdict: "down", text: data.error };
    document.getElementById("r-email").textContent = data.email || "—";
    document.getElementById("r-score").textContent = data.score != null ? data.score.toFixed(2) : "—";
    document.getElementById("r-syntax").textContent = data.is_valid_syntax ? "Yes" : "No";
    document.getElementById("r-mx").textContent = data.mx_found ? "Yes" : "No";
    document.getElementById("r-disp").textContent = data.is_disposable ? "Yes" : "No";
    document.getElementById("r-ca").textContent = data.is_catch_all ? "Yes" : "No";
    document.getElementById("r-smtp").textContent = data.smtp_check || "—";
    document.getElementById("r-prov").textContent = data.smtp_provider || "—";

    var score = data.score != null ? data.score : 0;
    var verdict = "down", text = "Looks risky to email.";
    if (score >= 0.8) { verdict = "up"; text = "Safe to email · high confidence."; }
    else if (score >= 0.5) { verdict = "warn"; text = "Catch-all or uncertain · use double opt-in."; }
    return { verdict: verdict, text: text };
  }
});
