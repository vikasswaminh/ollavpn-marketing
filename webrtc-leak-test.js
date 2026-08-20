(async function () {
  var verdict = document.getElementById("verdict");
  var verdictText = document.getElementById("verdict-text");
  function setVerdict(state, text) {
    verdict.classList.remove("up", "down", "warn");
    if (state) verdict.classList.add(state);
    verdictText.textContent = text;
  }
  setVerdict(null, "Running test…");

  // 1. Fetch our reference public IP (via the /api/myip Function).
  var reportedIp = null;
  try {
    var r = await fetch("/api/myip");
    if (r.ok) {
      var data = await r.json();
      reportedIp = data.ip || null;
    }
  } catch (_) {}
  document.getElementById("r-reported").textContent = reportedIp || "Unavailable";

  // 2. Run WebRTC ICE gathering.
  var publicIps = new Set();
  var localIps = new Set();
  var mdnsCount = 0;
  var ipRegex = /([0-9]{1,3}(?:\.[0-9]{1,3}){3})|([a-f0-9:]+:+[a-f0-9:]+)/i;
  var isPrivateV4 = function (ip) {
    return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.|127\.)/.test(ip);
  };
  var isLinkLocalV6 = function (ip) { return /^fe80:/i.test(ip); };

  var pc;
  try {
    pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.cloudflare.com:3478" }
      ]
    });
  } catch (e) {
    setVerdict("warn", "WebRTC is disabled in this browser — no leak possible here.");
    return;
  }
  pc.createDataChannel("");
  pc.createOffer().then(function (o) { pc.setLocalDescription(o); }).catch(function () {});

  var done = false;
  function finish() {
    if (done) return;
    done = true;
    try { pc.close(); } catch(_) {}

    var publicList = Array.from(publicIps);
    var localList = Array.from(localIps);
    document.getElementById("r-public").textContent = publicList.length ? publicList.join(", ") : "None";
    document.getElementById("r-local").textContent = localList.length ? localList.join(", ") : (mdnsCount > 0 ? "Hidden behind mDNS (" + mdnsCount + " entries)" : "None");

    var out = document.getElementById("candidates-output");
    if (publicList.length || localList.length || mdnsCount > 0) {
      var block = document.createElement("div");
      block.className = "records-block";
      var heading = document.createElement("h4");
      heading.textContent = "All discovered candidates";
      var ul = document.createElement("ul");
      publicList.forEach(function (ip) {
        var li = document.createElement("li");
        var s = document.createElement("strong");
        s.style.color = "var(--red)";
        s.textContent = "PUBLIC ";
        li.appendChild(s);
        li.appendChild(document.createTextNode(ip));
        ul.appendChild(li);
      });
      localList.forEach(function (ip) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode("LOCAL  " + ip));
        ul.appendChild(li);
      });
      if (mdnsCount > 0) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode("mDNS protected: " + mdnsCount + " host candidates anonymised by browser"));
        ul.appendChild(li);
      }
      block.appendChild(heading);
      block.appendChild(ul);
      out.replaceChildren(block);
    }

    // Verdict
    if (publicList.length === 0) {
      setVerdict("warn", "No public IPs discovered by WebRTC. Either WebRTC is blocked, you're offline, or the test couldn't reach a STUN server. Not necessarily safe — try again.");
      return;
    }
    if (reportedIp && publicList.includes(reportedIp)) {
      var others = publicList.filter(function (ip) { return ip !== reportedIp; });
      if (others.length > 0) {
        setVerdict("down", "Leak detected. WebRTC found " + others.length + " extra public IP" + (others.length > 1 ? "s" : "") + " that aren't your VPN exit.");
      } else {
        setVerdict("up", "No leak. WebRTC sees the same public IP as the reference check.");
      }
    } else if (reportedIp) {
      setVerdict("down", "Leak detected. WebRTC found a different public IP than the reference. Your VPN isn't routing WebRTC.");
    } else {
      setVerdict("warn", "Could not verify against a reference. WebRTC discovered: " + publicList.join(", "));
    }
  }

  pc.onicecandidate = function (e) {
    if (!e.candidate) { finish(); return; }
    var c = e.candidate.candidate || "";
    if (c.indexOf(".local") !== -1) { mdnsCount++; return; }
    var m = c.match(ipRegex);
    if (!m) return;
    var ip = m[0];
    if (isPrivateV4(ip) || isLinkLocalV6(ip)) localIps.add(ip);
    else publicIps.add(ip);
  };

  setTimeout(finish, 3000);
})();