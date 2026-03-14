'use client';

export function LogoutButton() {
  const handleLogout = () => {
    // 1. Remove the token from client-side storage
    localStorage.removeItem('auth_token');

    // 2. Expire the cookie so the proxy.ts (Edge middleware) knows the session is dead
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

    // 3. Hard redirect to the login page to flush any React state memory
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      title="Sign out of the Internal Developer Portal"
    >
      <svg
        className="mr-2 h-4 w-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Sign out
    </button>
  );
}
