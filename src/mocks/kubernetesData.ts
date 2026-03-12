import {
  KubernetesCluster,
  KubernetesEvent,
  KubernetesPod,
} from "@/lib/types/kubernetes";

// Realistic cluster mock data
export const mockKubernetesClusters: KubernetesCluster[] = [
  {
    name: "platform-prod-cluster",
    region: "us-east-1",
    status: "ACTIVE",
    nodeCount: 12,
    version: "1.27",
  },
  {
    name: "platform-staging-cluster",
    region: "us-east-1",
    status: "ACTIVE",
    nodeCount: 5,
    version: "1.28",
  },
];

// Realistic pod mock data simulating both healthy and failing services
export const mockKubernetesPods: KubernetesPod[] = [
  {
    name: "auth-service-5d4f7c9b-2k9j8",
    namespace: "platform-system",
    status: "Running",
    restartCount: 0,
    cpuUsagePercent: 25,
    memoryUsagePercent: 42,
    containers: [
      {
        name: "auth-service",
        image: "123456789.dkr.ecr.us-east-1.amazonaws.com/auth-service:1.2.3",
        ready: true,
      },
    ],
  },
  {
    name: "payment-processor-8a2f1b3d-x7q2",
    namespace: "finance",
    status: "CrashLoopBackOff",
    restartCount: 14,
    cpuUsagePercent: 0,
    memoryUsagePercent: 0,
    containers: [
      {
        name: "payment-processor",
        image:
          "123456789.dkr.ecr.us-east-1.amazonaws.com/payment-processor:1.0.1",
        ready: false,
        lastRestartTime: new Date(Date.now() - 300000).toISOString(),
      },
    ],
  },
];

// Mock events to display in the observability dashboard
export const mockKubernetesEvents: KubernetesEvent[] = [
  {
    timestamp: new Date().toISOString(),
    type: "Warning",
    reason: "BackOff",
    message: "Back-off restarting failed container payment-processor",
    involveObject: {
      kind: "Pod",
      name: "payment-processor-8a2f1b3d-x7q2",
      namespace: "finance",
    },
  },
];
