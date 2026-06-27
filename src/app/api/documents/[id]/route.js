// DELETE /api/documents/[id]  →  DELETE backend /api/documents/{id}
export const maxDuration = 60;\nexport async function DELETE(request, { params }) {
  const BACKEND = 'https://ccl-docintel-portal-backend.onrender.com';
  if (!BACKEND) return Response.json({ detail: "BACKEND_API_URL not configured on server." }, { status: 500 });
  const id = (await params).id;
  try {
    const authHeader = request.headers.get("Authorization");
    const response = await fetch(`${BACKEND}/api/documents/${id}`, {
      method: "DELETE",
      headers: authHeader ? { "Authorization": authHeader } : {}
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
