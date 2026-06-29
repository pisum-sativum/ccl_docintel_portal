export const maxDuration = 60;

const BACKEND = "https://ccl-docintel-portal-backend.onrender.com";

async function proxyToBackend(backendUrl, method, authHeader, bodyJson = null) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);
  try {
    const opts = {
      method,
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(bodyJson ? { "Content-Type": "application/json" } : {}),
      },
      signal: controller.signal,
      ...(bodyJson ? { body: JSON.stringify(bodyJson) } : {}),
    };
    const response = await fetch(backendUrl, opts);
    clearTimeout(timeout);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text || `Backend error (HTTP ${response.status})` };
    }
    return Response.json(data, { status: response.status });
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err.name === "AbortError";
    return Response.json(
      { detail: isTimeout ? "Request timed out." : err.message },
      { status: 502 },
    );
  }
}

// GET /api/documents/[id]/text
export async function GET(request, { params }) {
  const id = (await params).id;
  return proxyToBackend(
    `${BACKEND}/api/documents/${id}/text`,
    "GET",
    request.headers.get("Authorization"),
  );
}

// POST  (frontend sends POST; backend accepts both GET and POST)
export async function POST(request, { params }) {
  const id = (await params).id;
  return proxyToBackend(
    `${BACKEND}/api/documents/${id}/text`,
    "GET",
    request.headers.get("Authorization"),
  );
}

// PUT /api/documents/[id]/text
export async function PUT(request, { params }) {
  const id = (await params).id;
  const body = await request.json();
  return proxyToBackend(
    `${BACKEND}/api/documents/${id}/text`,
    "PUT",
    request.headers.get("Authorization"),
    body,
  );
}
