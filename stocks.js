// Serverless proxy: fetches Indian stock fundamentals server-side (avoiding the
// browser's HTTPS-mixed-content block on the underlying HTTP-only data source)
// and returns clean JSON with CORS enabled for same-origin/browser use.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const symbols = (req.query.symbols || "").trim();
  if (!symbols) {
    return res.status(400).json({ status: "error", message: "Provide ?symbols=TICKER1,TICKER2,..." });
  }

  try {
    const upstream = `http://65.0.104.9/stock/list?symbols=${encodeURIComponent(symbols)}&res=num`;
    const r = await fetch(upstream, { signal: AbortSignal.timeout(15000) });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ status: "error", message: "Upstream fetch failed: " + (err.message || err) });
  }
}
