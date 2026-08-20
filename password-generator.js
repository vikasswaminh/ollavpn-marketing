(function () {
  var CHARS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
  };
  var SIMILAR = /[0O1lI]/g;

  var display = document.getElementById("pw-display");
  var lengthSlider = document.getElementById("length-slider");
  var lengthValue = document.getElementById("length-value");
  var copyBtn = document.getElementById("copy-btn");
  var regenBtn = document.getElementById("regen-btn");
  var copyToast = document.getElementById("copy-toast");
  var strengthBar = document.getElementById("strength-bar");
  var strengthLabel = document.getElementById("strength-label");
  var entropyBits = document.getElementById("entropy-bits");

  function opts() {
    return {
      lower: document.getElementById("opt-lower").checked,
      upper: document.getElementById("opt-upper").checked,
      numbers: document.getElementById("opt-numbers").checked,
      symbols: document.getElementById("opt-symbols").checked,
      noSimilar: document.getElementById("opt-nosimilar").checked
    };
  }

  function pool(o) {
    var p = "";
    if (o.lower) p += CHARS.lower;
    if (o.upper) p += CHARS.upper;
    if (o.numbers) p += CHARS.numbers;
    if (o.symbols) p += CHARS.symbols;
    if (o.noSimilar) p = p.replace(SIMILAR, "");
    return p;
  }

  function generate() {
    var len = parseInt(lengthSlider.value, 10);
    var o = opts();
    var p = pool(o);
    if (!p) {
      display.textContent = "Select at least one character set.";
      strengthBar.style.width = "0%";
      strengthLabel.textContent = "—";
      strengthLabel.className = "strength";
      entropyBits.textContent = "0";
      return;
    }
    var buf = new Uint32Array(len);
    window.crypto.getRandomValues(buf);
    var out = "";
    for (var i = 0; i < len; i++) out += p[buf[i] % p.length];
    display.textContent = out;

    // Entropy: log2(pool_size ^ length)
    var bits = Math.round(len * Math.log2(p.length));
    entropyBits.textContent = bits;
    var pct, cls, label;
    if (bits < 50) { pct = 25; cls = "weak"; label = "Weak"; }
    else if (bits < 80) { pct = 55; cls = "good"; label = "Good"; }
    else if (bits < 120) { pct = 80; cls = "strong"; label = "Strong"; }
    else { pct = 100; cls = "excellent"; label = "Excellent"; }
    strengthBar.style.width = pct + "%";
    strengthBar.style.background =
      cls === "weak" ? "var(--red)" :
      cls === "good" ? "#ffaa00" :
      "#1e8a51";
    strengthLabel.textContent = label;
    strengthLabel.className = "strength " + cls;
  }

  lengthSlider.addEventListener("input", function () {
    lengthValue.textContent = lengthSlider.value;
    generate();
  });
  ["opt-lower", "opt-upper", "opt-numbers", "opt-symbols", "opt-nosimilar"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", generate);
  });
  regenBtn.addEventListener("click", generate);
  copyBtn.addEventListener("click", function () {
    var text = display.textContent;
    if (!text || text.indexOf("Select at least") !== -1) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        copyToast.classList.add("shown");
        setTimeout(function () { copyToast.classList.remove("shown"); }, 1500);
      });
    } else {
      // Fallback: select the text node manually
      var range = document.createRange();
      range.selectNode(display);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      try { document.execCommand("copy"); } catch(_) {}
      window.getSelection().removeAllRanges();
      copyToast.classList.add("shown");
      setTimeout(function () { copyToast.classList.remove("shown"); }, 1500);
    }
  });

  generate();
})();