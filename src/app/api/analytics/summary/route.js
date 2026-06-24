export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const response = await fetch("http://127.0.0.1:8000/api/analytics/summary", {
      headers: authHeader ? { "Authorization": authHeader } : {}
    });
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (err) {
    return Response.json(
      { detail: `Proxy error: ${err.message}` },
      { status: 502 }
    );
  }
}
