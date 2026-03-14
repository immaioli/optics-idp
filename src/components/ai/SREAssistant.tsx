'use client';

import { useState } from 'react';

// Strict typing matching our API response
interface AIAnalysisResponse {
  data: {
    summary: string;
    rootCause: string;
    actionableSteps: Array<{
      step: number;
      action: string;
      estimatedTime: string;
    }>;
  };
  source: string;
  message: string;
}

// ==========================================
// SAMPLE LOGS FOR QUICK TESTING
// ==========================================
const SAMPLE_LOG_CRASH = `[2026-03-13T14:32:11.452Z] INFO: Starting Optics IDP API server v1.4.2
[2026-03-13T14:32:11.890Z] INFO: Initializing database connection pool...
[2026-03-13T14:32:41.892Z] ERROR: Unhandled Rejection
[2026-03-13T14:32:41.895Z] MongoTimeoutError: Server selection timed out after 30000 ms
    at Timeout._onTimeout (/usr/src/app/node_modules/mongodb/lib/sdam/topology.js:312:38)
    at listOnTimeout (node:internal/timers:559:17)
[2026-03-13T14:32:41.901Z] FATAL: Terminating Node.js process due to database connection failure.
npm ERR! code ELIFECYCLE
npm ERR! Exit status 1`;

const SAMPLE_LOG_OOM = `<--- Last few GCs --->
[1:0x7f8a9b400000]    45213 ms: Mark-sweep 1022.2 (1026.5) -> 1021.8 (1026.5) MB, 1450.2 / 0.0 ms  (average mu = 0.124, current mu = 0.012) allocation failure scaffold

<--- JS stacktrace --->
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
 1: 0xb09c10 node::Abort() [node]
 2: 0xa18223 node::FatalError(char const*, char const*) [node]
 3: 0xcdddfb v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [node]
 4: 0xcddf77 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [node]`;

export function SREAssistant() {
  const [logContent, setLogContent] = useState('');
  const [isAnalyzing, SetIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim()) return;

    SetIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      const response = await fetch('/api/ai/analyze-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          logContent,
          context: 'Production EKS Cluster - platform-system namespace',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze logs via AI pipeline.');
      }

      const data: AIAnalysisResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknow error occurred');
    } finally {
      SetIsAnalyzing(false);
    }
  };

  // Helper to quickly fill the textarea and reset previous results
  const fillSampleLog = (log: string) => {
    setLogContent(log);
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-ls font-semibold text-gray-900">Cloud SRE Assitant</h2>
        <p className="text-sm text-gray-500 mt-1">
          Paste failing Kubernetes logs below for instant Bedrock AI root-cause analysis.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label htmlFor="logs" className="block text-sm font-medium text-gray-700 sr-only">
              Kubernetes Logs
            </label>
            <textarea
              id="logs"
              rows={6}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono p-3 border bg-gray-50 text-gray-900 placeholder-gray-500"
              placeholder="Paste CrashLoopBackOff or OOMKilled logs here..."
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          {/* Quick Test Logs Panel */}
          <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-800 mb-3 uppercase tracking-wide">
              Sample Error Logs (Click to test)
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => fillSampleLog(SAMPLE_LOG_CRASH)}
                className="flex-1 text-left bg-white text-sm text-indigo-700 hover:border-indigo-400 hover:shadow-md p-3 rounded-md transition-all border border-indigo-200 flex flex-col justify-center"
              >
                <span className="block font-semibold mb-1">🔥 Database Timeout</span>
                <span className="text-xs text-gray-500 line-clamp-1">
                  MogoTimeoutError: Server selection timed out
                </span>
              </button>
              <button
                type="button"
                onClick={() => fillSampleLog(SAMPLE_LOG_OOM)}
                className="flex-1 text-left bg-white text-sm text-indigo-700 hover:border-indigo-400 hover:shadow-md p-3 rounded-md transition-all border border-indigo-200 flex flex-col justify-center"
              >
                <span className="block font-semibold mb-1">💥 OOMKilled</span>
                <span className="text-xs text-gray-500 line-clamp-1">
                  FALTAL ERROR: Reached heap limit Allocation failed
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || !logContent.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing via Bedrock...
              </>
            ) : (
              'Analyze with AI'
            )}
          </button>
        </form>

        {/*Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Results State */}
        {result && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-900">Analysis Results</h3>
              <span className="inline-flex items-center px-2 5 py-0 5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Source: {result.source}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Summary
                </span>
                <p className="mt-1 text-sm text-gray-900">{result.data.summary}</p>
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Root Cause
                </span>
                <p className="mt-1 text-sm text-gray-900">{result.data.rootCause}</p>
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Actionable Steps
                </span>
                <ul className="space-y-3">
                  {result.data.actionableSteps.map((step) => (
                    <li
                      key={step.step}
                      className="flex items-center bg-white p-3 rounded border border-gray-100 shadow-sm"
                    >
                      <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mr-3">
                        {step.step}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{step.action}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Est. time: {step.estimatedTime}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
