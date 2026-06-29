export const maxDuration = 60;

// DELETE /api/documents/[id]  →  DELETE backend /api/documents/{id}
export async function DELETE(request, { params }) {
  const BACKEND = "https://ccl-docintel-portal-backend.onrender.com";
  const id = (await params).id;
  try {
    const authHeader = request.headers.get("Authorization");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    const response = await fetch(`${BACKEND}/api/documents/${id}`, {
      method: "DELETE",
      headers: authHeader ? { Authorization: authHeader } : {},
      signal: controller.signal,
    });
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
    const isTimeout = err.name === "AbortError";
    return Response.json(
      {
        detail: isTimeout
          ? "Request timed out."
          : `Proxy error: ${err.message}`,
      },
      { status: 502 },
    );
  }
}
