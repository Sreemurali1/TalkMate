import { auth } from '@/auth';
import { redirect } from 'next/navigation';

interface SessionRecord {
  id: string;
  scenario: string;
  duration: number;
  fluencyScore: number | null;
  confidenceScore: number | null;
  pronunciationScore: number | null;
  createdAt: string;
}

async function fetchSessions(token: string): Promise<SessionRecord[]> {
  const backendUrl = process.env.NEST_INTERNAL_URL ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${backendUrl}/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json() as Promise<SessionRecord[]>;
  } catch {
    return [];
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function Score({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-500">—</span>;
  return <span>{value.toFixed(1)}</span>;
}

export default async function SessionsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const sessions = session.backendToken
    ? await fetchSessions(session.backendToken)
    : [];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">TalkMate</h1>
        <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">
          ← Dashboard
        </a>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6">Session History</h2>

        {sessions.length === 0 ? (
          <div className="rounded-2xl bg-gray-900 p-10 text-center text-gray-500">
            <p className="text-4xl mb-3">🎙️</p>
            <p>No sessions yet. Start your first voice practice!</p>
            <a
              href="/voice"
              className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-500 transition"
            >
              Start practicing
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-gray-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Scenario</th>
                  <th className="px-4 py-3 text-right">Duration</th>
                  <th className="px-4 py-3 text-right">Fluency</th>
                  <th className="px-4 py-3 text-right">Confidence</th>
                  <th className="px-4 py-3 text-right">Pronunciation</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition ${
                      i % 2 === 0 ? '' : 'bg-gray-900/50'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-300">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-900/50 px-2 py-0.5 text-xs text-indigo-300 capitalize">
                        {s.scenario}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatDuration(s.duration)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Score value={s.fluencyScore} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Score value={s.confidenceScore} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Score value={s.pronunciationScore} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
