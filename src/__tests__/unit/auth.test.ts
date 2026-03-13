import { describe, expect, it } from "vitest";
import { generateMockToken, TokenClaims, verifyToken } from "@/lib/auth/jwt";

describe("Security & Authentication (JWT)", () => {
  const mockDeveloperClaims: TokenClaims = {
    email: "dev001@maioli.dev.br",
    roles: ["developer"],
    teams: ["backend-team"],
    permissions: ["read:clusters"],
  };

  const mockAdminClaims: TokenClaims = {
    email: "admin001@maioli.dev.br",
    roles: ["platform-admin"],
    teams: ["platform-team"],
    permissions: ["read:clusters", "write:clusters"],
  };

  it("Should generate a valid JWT token for developer", async () => {
    const token = await generateMockToken(mockDeveloperClaims);

    // The token should be a non-empty string  with three parts (Header.Payload.Signature)
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });

  it("Should successfully verify a token and decode its claims", async () => {
    const token = await generateMockToken(mockAdminClaims);
    const decoded = await verifyToken(token);

    // Ensure the claims match perfectly
    expect(decoded.email).toBe("admin001@maioli.dev.br");
    expect(decoded.roles).toContain("platform-admin");
    expect(decoded.permissions.length).toBe(2);
  });

  it("Should throw an error when verifying an invalid token signature", async () => {
    const validToken = await generateMockToken(mockDeveloperClaims);
    const tamperedToken = validToken.slice(0, -5) + "abcde"; // Tamper with the signature

    // We expect the verification to fail and throw our custom error
    await expect(verifyToken(tamperedToken)).rejects.toThrow(
      "Invalid or expired token",
    );
  });
});
