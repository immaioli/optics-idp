import { createClient, RedisClientType } from "redis";

// Ensure we maintain a single connection instance across hot-reloads in development
const globalForRedis = global as unknown as { redisClient: RedisClientType };

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient =
  globalForRedis.redisClient || createClient({ url: redisUrl });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisClient = redisClient;
}

// Connect immediately (error handling is crucial for robust infrastructure tools)
redisClient.on("error", (err) => console.error("Redis Client Error: ", err));

// A self-executing async function to connect safely
(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
})();

/**
 * Caches AI analysis results to prevent redundant LLM API calls, saving costs and reducing latency
 * @param logHash MD5 hash of the log content
 * @param analysis The structure AI response
 * @param ttlSeconds Time-to-live in seconds(default: 24 hours)
 */
export async function cacheAnalysis(
  logHash: string,
  analysis: Record<string, unknown>,
  ttlSeconds = 86400,
): Promise<void> {
  const cacheKey = `ai-analysis:${logHash}`;
  await redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(analysis));
}

/**
 * Retrieves a cached AI analysis if it exists and hasn't expired
 */
export async function getCachedAnalysis(
  logHash: string,
): Promise<Record<string, unknown> | null> {
  const cacheKey = `ai-analysis:${logHash}`;
  const cached = await redisClient.get(cacheKey);
  return cached ? JSON.parse(cached) : null;
}
