import { Cluster, connect } from "couchbase";

// Singleton pattern to prevent multiple cluster connection during development
const globalForCouchbase = global as unknown as { couchbaseCluster: Cluster };

const dbUrl = process.env.COUCHBASE_URL || "couchbase://localhost";
const dbUser = process.env.COUCHBASE_USER || "admin";
const dbPass = process.env.COUCHBASE_PASSWORD || "password";

export async function getCouchbaseCluster(): Promise<Cluster> {
  if (!globalForCouchbase.couchbaseCluster) {
    globalForCouchbase.couchbaseCluster = await connect(dbUrl, {
      username: dbUser,
      password: dbPass,
    });
  }
  return globalForCouchbase.couchbaseCluster;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  rules: Record<string, unknown>[];
  version: number;
  createdBy: string;
}

/**
 * Upserts (Inserts or updates) a governance policy document.
 * Using NoSQL allows us to envolve the policy schema without complex database migrations
 */
export async function savePolicy(policy: GovernancePolicy): Promise<void> {
  const cluster = await getCouchbaseCluster();
  const bucket = cluster.bucket("governance");
  const collection = bucket.defaultCollection();

  const documentId = `policy::${policy.id}`;

  await collection.upsert(documentId, {
    type: "policy",
    ...policy,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Retrieves a specific governance policy by its ID.
 */
export async function getPolicy(id: string): Promise<GovernancePolicy | null> {
  try {
    const cluster = await getCouchbaseCluster();
    const bucket = cluster.bucket("governance");
    const collection = bucket.defaultCollection();

    const documentId = `policy::${id}`;
    const result = await collection.get(documentId);

    return result.content as GovernancePolicy;
  } catch {
    // Return null if document is not found, mimicking standard ORM behavior
    return null;
  }
}
