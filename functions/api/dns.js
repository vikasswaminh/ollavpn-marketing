// CF Pages Function — /api/dns
// Returns DNS records (A, AAAA, MX, TXT, NS, CNAME, etc.) for a domain via Ollagraph.

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  let domain = (new URL(request.url).searchParams.get("domain") || "").trim();
  if (!domain) return json({ error: "Missing ?domain=… parameter" }, 400);

  domain = domain.replace(/^https?:\/\//i, "").split("/")[0].split("?")[0];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
    return json({ error: "Invalid domain" }, 400);
  }

  try {
    const r = await fetch("https://api.ollagraph.com/v1/dns/lookup", {
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
