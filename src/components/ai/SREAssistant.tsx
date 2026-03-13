"use client";

import { useState } from "react";

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

export function SREAssistant() {
  const [logContent, setLogContent] = useState("");
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
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;

      const response = await fetch("/api/ai/analyze-error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          logContent,
          context: "Production EKS Cluster - platform-system namespace",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze logs via AI pipeline.");
      }

      const data: AIAnalysisResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknow error occurred");
    } finally {
      SetIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-ls font-semibold text-gray-900">
          Cloud SRE Assitant
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Paste failing Kubernetes logs below for instant Bedrock AI root-cause
          analysis.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label
              htmlFor="logs"
              className="block text-sm font-medium text-gray-700 sr-only"
            >
              Kubernetes Logs
            </label>
            <textarea
              id="logs"
              rows={6}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono p-3 border bg-gray-50"
              placeholder="Paste CrashLoopBackOff or OOMKilled logs here..."
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              disabled={isAnalyzing}
            />
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
              "Analyze with AI"
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
              <h3 className="text-md font-medium text-gray-900">
                Analysis Results
              </h3>
              <span className="inline-flex items-center px-2 5 py-0 5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Source: {result.source}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Summary
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {result.data.summary}
                </p>
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Root Cause
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {result.data.rootCause}
                </p>
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
