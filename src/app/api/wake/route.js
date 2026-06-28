// Allow up to 60 s so Vercel waits through a full Render cold start.
export const maxDuration = 60;

export async function GET() {
  const BACKEND = 'https://ccl-docintel-portal-backend.onrender.com';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 58000);
    const res = await fetch(`${BACKEND}/api/wake`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) return Response.json({ status: 'awake' });
    // Backend responded but with an error — still counts as awake
    return Response.json({ status: 'awake' });
  } catch {
    // Timeout or network error — backend still sleeping
    return Response.json({ status: 'cold' }, { status: 503 });
  }
}
