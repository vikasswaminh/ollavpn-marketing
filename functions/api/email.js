// CF Pages Function — /api/email
// Verifies an email address (syntax, MX, disposable check, catch-all) via Ollagraph.

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const email = (new URL(request.url).searchParams.get("email") || "").trim();
  if (!email) return json({ error: "Missing ?email=… parameter" }, 400);

  // Loose RFC 5322 sanity check — Ollagraph does the real validation.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ error: "Invalid email format" }, 400);
  }

  try {
    const r = await fetch("https://api.ollagraph.com/v1/verify/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OLLAGRAPH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await r.json();
    return json(data, r.ok ? 200 : 502);
  } catch (e) {
    return json({ error: "Upstream call failed", detail: String(e) }, 502);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
