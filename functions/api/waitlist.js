// CF Pages Function — POST /api/waitlist
// Captures Pro / Business interest into the WAITLIST KV namespace.
// Privacy posture: stores only email + tier + commitment + arrival timestamp +
// edge country. No IP, no UA, no fingerprint. Edge country is what CF sees regardless.
//
// Body: {
//   "email":  "user@example.com",
//   "tier":   "pro" | "business",
//   "commit": "mo1" | "mo12" | "mo24"   (optional; defaults to "mo24")
// }
// Response: { "ok": true } on success, { "error": "..." } otherwise.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_TIERS = new Set(["pro", "business"]);
const ALLOWED_COMMITS = new Set(["mo1", "mo12", "mo24"]);
const ALLOWED_SOURCES = new Set(["pricing", "blog-newsletter", "homepage"]);

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (!env.WAITLIST) {
    return json({ error: "Waitlist backend not configured" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const email = (body?.email || "").toString().trim().toLowerCase();
  const tier = (body?.tier || "").toString().trim().toLowerCase();
  const commitRaw = (body?.commit || "mo24").toString().trim().toLowerCase();
  const commit = ALLOWED_COMMITS.has(commitRaw) ? commitRaw : "mo24";
  const sourceRaw = (body?.source || "pricing").toString().trim().toLowerCase();
  const source = ALLOWED_SOURCES.has(sourceRaw) ? sourceRaw : "pricing";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: "Invalid email" }, 400);
  }
  if (!ALLOWED_TIERS.has(tier)) {
    return json({ error: "Invalid tier" }, 400);
  }

  const now = new Date().toISOString();
  const country = request.headers.get("cf-ipcountry") || "??";
  // Key format: "<tier>:<commit>:<email>" so the same email can express
  // interest at different commitment terms; commit prefix is sortable.
  const key = `${tier}:${commit}:${email}`;
  const record = JSON.stringify({ email, tier, commit, source, ts: now, country });

  await env.WAITLIST.put(key, record, {
    metadata: { tier, commit, source, country, ts: now },
  });

  return json({ ok: true });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
