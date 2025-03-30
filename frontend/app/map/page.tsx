'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

// Use dynamic import to avoid SSR issues with Leaflet
const MapSelectionWithNoSSR = dynamic(
  () => import('../components/MapSelection'),
  { ssr: false }
);

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-slate-900 dark:to-emerald-950">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Sustainability AI Platform</h1>
          </Link>
          <nav className="hidden sm:flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
              Dashboard
            </Link>
            <Link href="/map" className="text-emerald-600 border-b-2 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400">
              Urban Planning
            </Link>
            <Link href="/solar" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
              Solar Calculator
            </Link>
            <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">About</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Urban Area Selection & Analysis
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
            Select an area on the map using the drawing tools to analyze its sustainability metrics
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-4">
          <MapSelectionWithNoSSR />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Sustainability AI Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 