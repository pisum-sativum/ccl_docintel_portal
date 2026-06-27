export async function GET(request) {
  const BACKEND = process.env.BACKEND_API_URL || 'https://ccl-docintel-portal-backend.onrender.com';
  try {
    const authHeader = request.headers.get("Authorization");
    const response = await fetch(`${BACKEND}/api/analytics/summary`, {
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
