import { SignJWT, jwtVerify } from "jose";

export interface TokenClaims {
  email: string;
  roles: Array<"platform-admin" | "developer" | "viewer">;
  teams: string[];
  permissions: string[];
}

// Secret key must be convert to Uint8Array (Required by Next.js Edge Runtime)
const getSecretKey = () => {
  const secret =
    process.env.JWT_SECRET || "fallback-secret-for-development-only";
  return new TextEncoder().encode(secret);
};

export async function generateMockToken(claims: TokenClaims): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 24 * 60 * 60;

  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setIssuer("mock-forgerock")
    .setSubject(claims.email)
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<TokenClaims> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as TokenClaims;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
