export const maxDuration = 60;\nexport async function POST(request) {
  const BACKEND = 'https://ccl-docintel-portal-backend.onrender.com';
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
