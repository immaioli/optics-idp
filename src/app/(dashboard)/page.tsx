import { ClusterHealth } from '@/components/infrastructure/ClusterHealth';
import { SREAssistant } from '@/components/ai/SREAssistant';
import { DashboardActions } from '@/components/dashboard/DashboardActions';

export const metadata = {
  title: 'Infrastructure Overview | Internal Developer Portal',
  description: 'Real-time monitoring of Kubernetes clusters and core infrastructure.',
};

export default function DashboardOverviewPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w 7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Infrastructure Overview</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and govern your fleet of kubernetes cluster in real-time.
            </p>
          </div>
          <DashboardActions />
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
