import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.backendToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as Record<string, unknown>;
  const backendUrl = process.env.NEST_INTERNAL_URL ?? 'http://localhost:3001';

  const res = await fetch(`${backendUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.backendToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as unknown;
  return NextResponse.json(data, { status: res.status });
}
