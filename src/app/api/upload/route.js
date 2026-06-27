export const maxDuration = 60;\nexport async function POST(request) {
  const BACKEND = 'https://ccl-docintel-portal-backend.onrender.com';
  try {
    const authHeader = request.headers.get("authorization") || "";
    const formData = await request.formData();
    const response = await fetch(`${BACKEND}/api/upload`, {
      method: "POST",
      headers: { "Authorization": authHeader },
      body: formData,
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
