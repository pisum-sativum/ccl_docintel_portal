export async function GET(request) {
  const BACKEND = 'https://ccl-docintel-portal-backend.onrender.com';
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("Authorization");
    const response = await fetch(`${BACKEND}/api/documents?${searchParams.toString()}`, {
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
