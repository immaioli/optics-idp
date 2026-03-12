"use client";

import useSWR from "swr";
import { KubernetesCluster } from "@/lib/types/kubernetes";

// Define the expected shape of the API response
interface ClusterResponse {
  clusters: KubernetesCluster[];
  count: number;
  timestamp: string;
}

// Custom fetcher function that injects the JWT token from localStorage
const fetcher = async (url: string) => {
  // Ensure we are running on the client-side to access localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error("An error occurred while fetching infrastructure data.");
  }

  return res.json();
};

export function ClusterHealth() {
  // Polling every 10 seconds to ensure real-time observability
  const { data, error, isLoading } = useSWR<ClusterResponse>(
    "api/infrastructure/clusters",
    fetcher,
    { refreshInterval: 10000 },
  );

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <h3 className="text-sm font-medium text-red-800">
          Observability Sync Failed
        </h3>
        <p className="mt-2 text-sm text-red-700">{error.message}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="animate-pulse flex space-x-4 p-6 border rounded-lg bg-white shadow-sm">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data.clusters.map((cluster) => {
        // Determine status color dynamically based on cluster health
        const isHealthy = cluster.status === "ACTIVE";
        const statusColor = isHealthy
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";
        const indicatorColor = isHealthy ? "bg-green-500" : "bg-green-500";

        return (
          <div
            key={cluster.name}
            className="flex flex-col p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center-justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {cluster.name}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
              >
                <span
                  className={`w-2 h-2 mr-1.5 rounded-full ${indicatorColor}`}
                ></span>
                {cluster.status}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm mt-auto">
              <div>
                <dt className="text-gray-500 font-medium">Region</dt>
                <dd className="text-gray-900 mt-1">{cluster.region}</dd>
              </div>
              <div>
                <dt className="text-gray-500 font-medium">Nodes</dt>
                <dd className="text-gray-900 mt-1">{cluster.nodeCount}</dd>
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-100">
                <dt className="text-gray-500 font-medium">K8s Version</dt>
                <dd className="text-gray-900 mt-1">{cluster.version}</dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}
