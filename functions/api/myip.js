// CF Pages Function — /api/myip
// Returns the client's public IP + geolocation. Powers /what-is-my-ip.
//
// Client IP is read from the cf-connecting-ip header (set by Cloudflare edge).
// Geolocation is fetched from Ollagraph /v1/intel/geoip using the project's
// OLLAGRAPH_API_KEY (set as a Pages secret env var).

export async function onRequest(context) {
  const { request, env } = context;

  // Only GET — no body, no side effects.
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const ip = request.headers.get("cf-connecting-ip") || "";
  if (!ip) {
    return json({ error: "Could not determine client IP" }, 400);
  }

  let geo = null;
  try {
    const r = await fetch("https://api.ollagraph.com/v1/intel/geoip", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OLLAGRAPH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip }),
    });
    if (r.ok) geo = await r.json();
  } catch (_) {
    // Non-fatal — still return the IP so the page degrades gracefully.
  }

  return json({ ip, geo });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
