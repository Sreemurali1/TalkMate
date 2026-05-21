import { NextRequest, NextResponse } from 'next/server';

// Proxy STT requests to NestJS to avoid CORS/mixed-content issues in the browser.
// Browser → Next.js /api/stt (same origin, no CORS) → NestJS /stt/transcribe (server-to-server)
export async function POST(req: NextRequest) {
  const nestUrl = process.env.NEST_INTERNAL_URL || 'http://localhost:3001';

  try {
    const formData = await req.formData();

    // Forward the multipart form to NestJS
    const res = await fetch(`${nestUrl}/stt/transcribe`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('STT proxy error:', err);
    return NextResponse.json(
      { detail: 'STT proxy failed' },
      { status: 500 },
    );
  }
}
