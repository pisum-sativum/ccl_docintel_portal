export async function GET(request, { params }) {
  const id = (await params).id;
  try {
    const authHeader = request.headers.get("Authorization");
    const response = await fetch(`http://127.0.0.1:8000/api/documents/${id}/text`, {
      headers: authHeader ? { "Authorization": authHeader } : {}
    });
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (err) {
    return Response.json({ detail: `Proxy error: ${err.message}` }, { status: 502 });
  }
}

export async function PUT(request, { params }) {
  const id = (await params).id;
  try {
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();
    const response = await fetch(`http://127.0.0.1:8000/api/documents/${id}/text`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (err) {
    return Response.json({ detail: `Proxy error: ${err.message}` }, { status: 502 });
  }
}

export async function DELETE(request, { params }) {
  const id = (await params).id;
  try {
    const authHeader = request.headers.get("Authorization");
    const response = await fetch(`http://127.0.0.1:8000/api/documents/${id}`, {
      method: "DELETE",
      headers: authHeader ? { "Authorization": authHeader } : {}
    });
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (err) {
    return Response.json({ detail: `Proxy error: ${err.message}` }, { status: 502 });
  }
}
