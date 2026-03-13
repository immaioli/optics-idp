import { NextRequest, NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { cacheAnalysis, getCachedAnalysis } from "@/lib/cache/redis";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logContent, context } = body;

    if (!logContent) {
      return NextResponse.json(
        { error: "Log content is required for analysis" },
        { status: 400 },
      );
    }

    // 1. Generate a deterministic MD5 hash of the log content to use as a cache key.
    // This allows us to reuse expensive LLM analysis for identical recurring errors.
    const logHash = crypto.createHash("md5").update(logContent).digest("hex");

    // 2. Check the Redis cache first (Latency: ~50ms, Cost: $0.00)
    const cachedAnalysis = await getCachedAnalysis(logHash);

    if (cachedAnalysis) {
      return NextResponse.json({
        data: cachedAnalysis,
        source: "redis-cache",
        message: "Analysis retrieved from cache",
      });
    }

    // 3. Mock Bedrock response for local development without AWS credentials
    if (process.env.MOCK_BEDROCK === "true") {
      const mockResponse = {
        summary: "OOMKilled: The container exceeded its memory limit.",
        rootCause:
          "The application attempted to allocate more memory than the 512Mi limit specified in the deployment manifest.",
        actionableSteps: [
          {
            step: 1,
            action: "Increase memory limit to 1Gi in deployment.yaml",
            estimatedTime: "2m",
          },
          {
            step: 2,
            action: "Check for memory leaks in the application code",
            estimatedTime: "1h",
          },
          {
            step: 3,
            action:
              "Implement horizontal pod autoscaling (HPA) based on memory utilization",
            estimatedTime: "15m",
          },
        ],
      };

      // Save mock to Redis to validate the caching layer locally
      await cacheAnalysis(logHash, mockResponse);

      return NextResponse.json({
        data: mockResponse,
        source: "mock-bedrock",
        message: "Mock Analysis generated and cached",
      });
    }

    // 4. Real AWS Bedrock Integration (Latency: ~2-5s, Incurs AWS cost)
    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    // Strict system prompt to enforce a predicable JSON structure from the LLM
    const systemPrompt = `You are an expert Site Reliability Engineer (SRE) and Kubernetes administrator.
        Analyze the provided Kubernetes log and context.
        Provide a JSON response strictly matching this schema without any markdown formatting outside the JSON:
        {"summary": "string", "rootCause": "string", "actionableSteps": [{ "step": number, "action": "string", "estimatedTime": "string" }] }`;

    const command = new InvokeModelCommand({
      modelId:
        process.env.AWS_BEDROCK_MODEL_ID ||
        "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-06-01",
        max_tokens: 1024,
        system: systemPrompt,
        message: [
          {
            role: "user",
            content: `Context: ${context || "None"} \n\nLog Content:\n${logContent}`,
          },
        ],
      }),
    });

    const response = await client.send(command);

    // Decode the Uint8Array response body
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Parse the actual text response from Claude into a JS object
    const analysisResult = JSON.parse(responseBody.content[0].text);

    // 5. Cache the expensive AI result in Redis for 24 hours (86400 seconds)
    await cacheAnalysis(logHash, analysisResult);

    return NextResponse.json({
      data: analysisResult,
      source: "aws-bedrock",
      message: "Analysis generated and cached successfully",
    });
  } catch (error) {
    // Log the actual error internally but, return a sanitized message to the client
    console.error("AI Analysis Pipeline Error: ", error);
    return NextResponse.json(
      { error: "Failed to process AI infrastructure analysis" },
      { status: 500 },
    );
  }
}
