import { auth } from '@/auth';
import { redirect } from 'next/navigation';

interface ProgressData {
  totalSessions: number;
  streak: number;
  minutesSpoken: number;
}

async function fetchProgress(token: string): Promise<ProgressData> {
  const backendUrl = process.env.NEST_INTERNAL_URL ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${backendUrl}/analytics/progress`, {
      headers: { Authorization: `Bearer ${token}` },
      // Don't cache — always show fresh stats
      cache: 'no-store',
    });
    if (!res.ok) return { totalSessions: 0, streak: 0, minutesSpoken: 0 };
    return res.json() as Promise<ProgressData>;
  } catch {
    return { totalSessions: 0, streak: 0, minutesSpoken: 0 };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const user = session.user;
  const progress = session.backendToken
    ? await fetchProgress(session.backendToken)
    : { totalSessions: 0, streak: 0, minutesSpoken: 0 };

  const stats = [
    { label: 'Sessions', value: String(progress.totalSessions) },
    { label: 'Day streak', value: String(progress.streak) },
    { label: 'Minutes spoken', value: String(progress.minutesSpoken) },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Top nav */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">TalkMate</h1>
        <div className="flex items-center gap-3">
          {user?.image && (
            <img
              src={user.image}
              alt={user.name ?? 'User avatar'}
              className="h-8 w-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-300">{user?.name}</span>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-2xl font-semibold">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h2>
        <p className="mt-2 text-gray-400">Ready to practice? Start a session below.</p>

        {/* Quick-action cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href="/voice"
            className="rounded-2xl bg-indigo-600 p-6 hover:bg-indigo-500 transition"
          >
            <div className="text-2xl mb-2">🎙️</div>
            <h3 className="font-semibold text-lg">Voice Practice</h3>
            <p className="mt-1 text-sm text-indigo-200">
              Talk with your AI coach in real time
            </p>
          </a>

          <a
            href="/sessions"
            className="rounded-2xl bg-gray-800 p-6 hover:bg-gray-700 transition"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-lg">Session History</h3>
            <p className="mt-1 text-sm text-gray-400">
              Review your past practice sessions
            </p>
          </a>
        </div>

        {/* Live stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-gray-900 p-4 text-center">
              <p className="text-3xl font-bold text-indigo-400">{value}</p>
              <p className="mt-1 text-xs text-gray-500 uppercase tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
