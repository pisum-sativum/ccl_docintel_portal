export const maxDuration = 60;

export async function POST(request) {
  const BACKEND = "https://ccl-docintel-portal-backend.onrender.com";
  try {
    const authHeader = request.headers.get("authorization") || "";
    const formData = await request.formData();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    const response = await fetch(`${BACKEND}/api/upload`, {
      method: "POST",
      headers: { Authorization: authHeader },
      body: formData,
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
          ? "Upload timed out — try a smaller file or wait for server to warm up."
          : `Proxy error: ${err.message}`,
      },
      { status: 502 },
    );
  }
}
