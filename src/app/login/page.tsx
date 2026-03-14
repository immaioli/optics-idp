'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'mock-password' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      // Save to localStorage for our client-side data fetching (SWR)
      localStorage.setItem('auth_token', data.token);

      // SAVE TO COOKIE so proxy.ts (Edge/Server middleware) can read it and allow access
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

      // Force a hard browser navigator to clean Next.js client cache and hit t
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick helper to auto-fill the input when clicking test credentials
  const fillEmail = (testEmail: string) => {
    setEmail(testEmail);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Internal Developer Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in via SSO (Mock Enterprise Auth)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Corporate Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@maioli.dev.br"
                  className="appearance-none block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Test Credentials Panel */}
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <p className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wide">
                Test Credentials (Click to fill):
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fillEmail('admin001@maioli.dev.br')}
                  className="w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-1.5 rounded transition-colors flex justify-between items-center"
                >
                  <span className="font-mono">admin001@maioli.dev.br</span>
                  <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full font-medium">
                    Platform Admin
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => fillEmail('dev001@maioli.dev.br')}
                  className="w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-1.5 rounded transition-colors flex justify-between items-center"
                >
                  <span className="font-mono">dev001@maioli.dev.br</span>
                  <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full font-medium">
                    Developer
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Authenticating...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
