// Shared helper: returns a clear 500 if the env var isn't configured in Vercel
function requireBackend() {
  const url = process.env.BACKEND_API_URL;
  if (!url) throw new Error("BACKEND_API_URL is not set. Add it in Vercel → Settings → Environment Variables.");
  return url;
}

// GET/POST /api/documents/[id]/text  →  GET backend /api/documents/{id}/text
// The frontend view modal sends a POST; the backend accepts both via dual decorator.
export async function GET(request, { params }) {
  try {
    const BACKEND = requireBackend();
    const id = (await params).id;
    const authHeader = request.headers.get("Authorization");
    const response = await fetch(`${BACKEND}/api/documents/${id}/text`, {
      method: "GET",
      headers: authHeader ? { "Authorization": authHeader } : {}
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch { data = { detail: text || `Backend error (HTTP ${response.status})` }; }
    return Response.json(data, { status: response.status });
  } catch (err) {
    return Response.json({ detail: err.message }, { status: 502 });
  }
}

// Frontend sends POST to trigger text load (DocumentLibrary.jsx line 76)
export async function POST(request, { params }) {
  try {
    const BACKEND = requireBackend();
    const id = (await params).id;
    const authHeader = request.headers.get("Authorization");
    const response = await fetch(`${BACKEND}/api/documents/${id}/text`, {
      method: "GET",   // Backend uses GET; we translate POST→GET here
      headers: authHeader ? { "Authorization": authHeader } : {}
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch { data = { detail: text || `Backend error (HTTP ${response.status})` }; }
    return Response.json(data, { status: response.status });
  } catch (err) {
    return Response.json({ detail: err.message }, { status: 502 });
  }
}

// PUT /api/documents/[id]/text  →  PUT backend /api/documents/{id}/text
export async function PUT(request, { params }) {
  try {
    const BACKEND = requireBackend();
    const id = (await params).id;
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();
    const response = await fetch(`${BACKEND}/api/documents/${id}/text`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
      body: JSON.stringify(body)
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch { data = { detail: text || `Backend error (HTTP ${response.status})` }; }
    return Response.json(data, { status: response.status });
  } catch (err) {
    return Response.json({ detail: err.message }, { status: 502 });
  }
}
