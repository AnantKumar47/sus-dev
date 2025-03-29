'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface KeyMetric {
  name: string;
  value: number;
  unit: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    key_metrics: KeyMetric[];
  };
}

export default function Home() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use environment variable or fallback to localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/test`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        setApiData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data from the API. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-slate-900 dark:to-emerald-950">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Sustainability AI Platform</h1>
          </Link>
          <nav className="hidden sm:flex space-x-6">
            <Link href="/" className="text-emerald-600 border-b-2 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400">
              Dashboard
            </Link>
            <Link href="/map" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
              Urban Planning
            </Link>
            <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">Analytics</a>
            <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">About</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Actionable Insights for Sustainable Urban Planning
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
            Leveraging AI to create greener, more efficient cities
          </p>
          <div className="mt-8">
            <Link href="/map" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              Try Urban Planning Tool
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Key Sustainability Metrics
            </h3>
            
            {loading ? (
              <div className="mt-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading metrics...</p>
              </div>
            ) : error ? (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {apiData?.data.key_metrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">
                        {metric.name}
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                        {metric.value} {metric.unit}
                      </dd>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
