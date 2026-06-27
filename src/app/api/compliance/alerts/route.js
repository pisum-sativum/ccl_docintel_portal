export const maxDuration = 60;\nexport async function GET(request) {
  const BACKEND = 'https://ccl-docintel-portal-backend.onrender.com';
  try {
    const authHeader = request.headers.get("Authorization");
    const response = await fetch(`${BACKEND}/api/compliance/alerts`, {
      headers: authHeader ? { "Authorization": authHeader } : {}
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text || `Backend error (HTTP ${response.status})` };
    }
    return Response.json(data, { status: response.status });
  } catch (err) {
    return Response.json(
      { detail: `Proxy error: ${err.message}` },
      { status: 502 }
    );
  }
}
