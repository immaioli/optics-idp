import { ClusterHealth } from "@/components/infrastructure/ClusterHealth";
import { SREAssistant } from "@/components/ai/SREAssistant";

export const metadata = {
  title: "Infrastructure Overview | Internal Developer Portal",
  description:
    "Real-time monitoring of Kubernetes clusters and core infrastructure.",
};

export default function DashboardOverviewPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w 7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Infrastructure Overview
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and govern your fleet of kubernetes cluster in real-time.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transitio-colors">
              Refresh Data
            </button>
            <button className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm-font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              Deploy Manifest
            </button>
          </div>
        </div>

        {/* Real-time Observability Component */}
        <section aria-labelledby="cluster-health-heading">
          <h2 id="cluster-health-heading" className="sr-only">
            Cluster Health Status
          </h2>
          <ClusterHealth />
        </section>

        {/* AI SRE Assistant Section */}
        <section aria-labelledby="ai-assistant-heading" className="mt-8">
          <h2 id="ai-assistant-heading" className="sr-only">
            AI SRE Assistant
          </h2>
          <SREAssistant />
        </section>
      </div>
    </main>
  );
}
