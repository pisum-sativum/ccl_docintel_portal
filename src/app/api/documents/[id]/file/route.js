export const maxDuration = 60;

// GET /api/documents/[id]/file  →  streams the physical file from backend
// Token is accepted as a query param (?token=...) for src= URL usage.
export async function GET(request, { params }) {
  const BACKEND = "https://ccl-docintel-portal-backend.onrender.com";
  const id = (await params).id;
  try {
    let authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get("token");
      if (token) authHeader = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    const response = await fetch(`${BACKEND}/api/documents/${id}/file`, {
      method: "GET",
      headers: authHeader ? { Authorization: authHeader } : {},
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return new Response(`Backend error: ${response.status}`, {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition =
      response.headers.get("content-disposition") || "";
    const body = await response.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...(contentDisposition
          ? { "Content-Disposition": contentDisposition }
          : {}),
      },
    });
  } catch (err) {
    const isTimeout = err.name === "AbortError";
    return new Response(
      isTimeout ? "File load timed out." : `Proxy error: ${err.message}`,
      { status: 502 },
    );
  }
}
