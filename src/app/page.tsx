import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="text-5xl">Table Tennis Tracker</div>

      <Link href="/match-tracker">
        <button className="mt-6 px-6 py-3 bg-white text-black rounded-md">
          Go to Match Tracker
        </button>
      </Link>
    </div>
  );
}
