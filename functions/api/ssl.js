// CF Pages Function — /api/ssl
// Checks the SSL/TLS certificate health of a domain via Ollagraph.

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  let domain = (new URL(request.url).searchParams.get("domain") || "").trim();
  if (!domain) return json({ error: "Missing ?domain=… parameter" }, 400);

  // Strip scheme/path if user pasted a URL.
  domain = domain.replace(/^https?:\/\//i, "").split("/")[0].split("?")[0];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
    return json({ error: "Invalid domain" }, 400);
  }

  try {
    const r = await fetch("https://api.ollagraph.com/v1/intel/ssl", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OLLAGRAPH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain }),
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
