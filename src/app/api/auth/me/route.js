export async function GET(request) {
  const BACKEND = process.env.BACKEND_API_URL;
  try {
    const authHeader = request.headers.get("authorization") || "";
    const response = await fetch(`${BACKEND}/api/auth/me`, {
      headers: { "Authorization": authHeader },
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch { data = { detail: text || `Backend error (HTTP ${response.status})` }; }
    return Response.json(data, { status: response.status });
  } catch (err) {
    return Response.json({ detail: `Proxy error: ${err.message}` }, { status: 502 });
  }
}
