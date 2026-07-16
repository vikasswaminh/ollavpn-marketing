// CF Pages Function — /api/headers
// Returns HTTP response headers for a URL via Ollagraph.

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const target = (new URL(request.url).searchParams.get("url") || "").trim();
  if (!target) return json({ error: "Missing ?url=… parameter" }, 400);

  let candidate = target;
  if (!/^https?:\/\//i.test(candidate)) candidate = "https://" + candidate;
  try { new URL(candidate); } catch (_) { return json({ error: "Invalid URL" }, 400); }

  try {
    const r = await fetch("https://api.ollagraph.com/v1/intel/headers", {
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
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
