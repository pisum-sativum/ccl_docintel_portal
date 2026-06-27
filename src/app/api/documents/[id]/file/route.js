// GET /api/documents/[id]/file  →  streams the physical file from backend
// Used for PDF iframe and image preview in the View Document modal.
// Token is accepted as a query param (?token=...) for src= URL usage.
export const maxDuration = 60;\nexport async function GET(request, { params }) {
  const BACKEND = 'https://ccl-docintel-portal-backend.onrender.com';
  const id = (await params).id;
  try {
    // Support both Authorization header and ?token= query param
    let authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get("token");
      if (token) authHeader = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND}/api/documents/${id}/file`, {
      method: "GET",
      headers: authHeader ? { "Authorization": authHeader } : {}
    });

    if (!response.ok) {
      return new Response(`Backend error: ${response.status}`, { status: response.status });
    }

    // Stream the file body with the original content-type header
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || "";
    const body = await response.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...(contentDisposition ? { "Content-Disposition": contentDisposition } : {})
      }
    });
  } catch (err) {
    return new Response(`Proxy error: ${err.message}`, { status: 502 });
  }
}
