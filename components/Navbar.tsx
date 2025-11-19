'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isToday = pathname === '/today' || pathname === '/';
  const isOverview = pathname === '/overview';

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex gap-6">
          <Link
            href="/today"
            className={`text-lg hover:text-blue-600 transition-colors ${
              isToday ? 'font-bold' : ''
            }`}
          >
            Today
          </Link>
          <Link
            href="/overview"
            className={`text-lg hover:text-blue-600 transition-colors ${
              isOverview ? 'font-bold' : ''
            }`}
          >
            Overview
          </Link>
        </div>
      </div>
    </nav>
  );
}
