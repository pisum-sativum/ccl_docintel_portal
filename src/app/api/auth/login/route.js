export const maxDuration = 60;

export async function POST(request) {
  const BACKEND = "https://ccl-docintel-portal-backend.onrender.com";
  try {
    const body = await request.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    const response = await fetch(`${BACKEND}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const isTimeout = err.name === "AbortError";
    return Response.json(
      {
        detail: isTimeout
          ? "Server is warming up — please try logging in again in a moment."
          : `Proxy error: ${err.message}`,
      },
      { status: 503 },
    );
  }
}
