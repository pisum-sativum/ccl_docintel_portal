export const maxDuration = 60; // Allow Vercel to wait up to 60s (for cold Render starts)

export async function POST(request) {
  const BACKEND = 'https://ccl-docintel-portal-backend.onrender.com';
  try {
    const body = await request.json();
    const authHeader = request.headers.get("Authorization");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s timeout

    const response = await fetch(`${BACKEND}/api/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
      body: JSON.stringify(body),
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
    const isTimeout = err.name === 'AbortError';
    return Response.json(
      { detail: isTimeout 
          ? 'The backend server is warming up (cold start). Please try again in 30 seconds.' 
          : `Proxy error: ${err.message}` 
      },
      { status: 502 }
    );
  }
}
