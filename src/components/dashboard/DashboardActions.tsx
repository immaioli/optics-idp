'use client';

import { LogoutButton } from '../auth/LogoutButton';

export function DashboardActions() {
  return (
    <div className="mt-4 sm:mt-0 flex gap-3">
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        Refresh Data
      </button>

      <button
        onClick={() =>
          alert(
            '🚀 Manifest Deployment Initiated!\n\n(Note: This is a portfolio simulation. In a real environment, this would open a YAML editor to submit resources to the AWS EKS API.)'
          )
        }
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
      >
        Deploy Manifest
      </button>

      <LogoutButton />
    </div>
  );
}
