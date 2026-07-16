// CF Pages Function — /api/uptime
// Checks whether a URL is up. Powers /is-it-down.
//
// Accepts a `url` query parameter. Proxies to Ollagraph /v1/intel/uptime
// using OLLAGRAPH_API_KEY (Pages secret).

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const target = new URL(request.url).searchParams.get("url") || "";
  if (!target) {
    return json({ error: "Missing ?url=… parameter" }, 400);
  }

  // Light validation — must look like an http(s) URL or a bare hostname.
  let candidate = target.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = "https://" + candidate;
  }
  try {
    new URL(candidate);
  } catch (_) {
    return json({ error: "Invalid URL" }, 400);
  }

  try {
    const r = await fetch("https://api.ollagraph.com/v1/intel/uptime", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OLLAGRAPH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: candidate }),
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
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
