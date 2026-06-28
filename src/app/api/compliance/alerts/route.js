export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request) {
  const BACKEND = "https://ccl-docintel-portal-backend.onrender.com";
  try {
    const authHeader = request.headers.get("Authorization");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    const response = await fetch(`${BACKEND}/api/compliance/alerts`, {
      headers: authHeader ? { Authorization: authHeader } : {},
      cache: "no-store",
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
          ? "Backend is warming up."
          : `Proxy error: ${err.message}`,
      },
      { status: 503 },
    );
  }
}
