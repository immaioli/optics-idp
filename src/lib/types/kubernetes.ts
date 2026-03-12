// Core Kubernetes entity interfaces to ensure strict typing across the portal

export interface KubernetesPod {
  name: string;
  namespace: string;
  status: "Running" | "Pending" | "CrashLoopBackOff" | "ImagePullBackOff";
  restartCount: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  containers: Array<{
    name: string;
    image: string;
    ready: boolean;
    lastRestartTime?: string;
  }>;
}

export interface KubernetesNode {
  name: string;
  status: "Ready" | "NotReady";
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  podCount: number;
}

export interface KubernetesCluster {
  name: string;
  region: string;
  status: "ACTIVE" | "CREATING" | "DELETING" | "FAILED";
  nodeCount: number;
  version: string;
}

export interface KubernetesEvent {
  timestamp: string;
  type: "Warning" | "Normal";
  reason: string;
  message: string;
  involveObject: {
    kind: "Pod" | "Node" | "Deployment";
    name: string;
    namespace?: string;
  };
}
