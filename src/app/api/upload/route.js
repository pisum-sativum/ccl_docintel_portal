export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const formData = await request.formData();
    const response = await fetch("http://127.0.0.1:8000/api/upload", {
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
