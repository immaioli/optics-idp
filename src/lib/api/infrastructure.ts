import { EKSClient, ListClustersCommand } from "@aws-sdk/client-eks";
import { KubernetesCluster, KubernetesPod } from "@/lib/types/kubernetes";
import {
  mockKubernetesClusters,
  mockKubernetesPods,
} from "@/mocks/kubernetesData";

export class InfrastructureAPI {
  private readonly useMockData: boolean;
  private readonly region: string;

  constructor() {
    this.useMockData = process.env.USE_MOCK_DATA === "true";
    this.region = process.env.AWS_REGION || "us-east-1";
  }

  /**
   * Fetches the list of EKS clusters.
   * Returns mock data if USE_MOCK_DATA is true, otherwise calls AWS SDK.
   */
  async getClusters(): Promise<KubernetesCluster[]> {
    if (this.useMockData) {
      return mockKubernetesClusters;
    }

    try {
      const client = new EKSClient({ region: this.region });
      const comand = new ListClustersCommand({});
      const respose = await client.send(comand);

      // Map AWS response to our strict Typescript interface
      return (respose.clusters || []).map((name: string) => ({
        name,
        region: this.region,
        status: "ACTIVE" as const, // Simplified for this example
        nodeCount: 3, // Require a separate describeCluster call in
        version: "1.27",
      }));
    } catch {
      throw new Error("Failed to fetch clusters from AWS EKS");
    }
  }

  /**
   * Fetches pods for a gives cluster.
   * In a real scenario, this would authenticate with the kubernetes API server via EKS.
   */
  async getPods(clusterId: string): Promise<KubernetesPod[]> {
    // For safely, prevent unused variable warnings in case we only use mock data right now
    if (!clusterId) throw new Error("Cluster ID is required");

    if (this.useMockData) {
      return mockKubernetesPods;
    }

    // Real implementation would require Kubernetes client-node and EKS token generation
    throw new Error("Real Kubernetes API integration not implemented yet");
  }
}
