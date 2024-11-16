'use client';

import Link from 'next/link';
import Navbar from './components/Navbar/Navbar';

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-5xl">Table Tennis Tracker</div>

        <Link href="/match-tracker">
          <button className="mt-6 px-6 py-3 bg-white text-black rounded-md">
            Go to Match Tracker
          </button>
        </Link>
      </div>
    </div>
  );
}
