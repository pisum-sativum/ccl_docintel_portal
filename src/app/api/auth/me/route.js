export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const response = await fetch("http://127.0.0.1:8000/api/auth/me", {
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
