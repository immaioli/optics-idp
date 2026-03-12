import { NextRequest, NextResponse } from "next/server";
import { generateMockToken, TokenClaims } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Mock SSO logic: If the email contains 'admin', grant elevated privileges.
    // Ohterwise, assign standard developer permissions.
    const isAdmin = email.includes("admin");

    const claims: TokenClaims = {
      email,
      roles: isAdmin ? ["platform-admin"] : ["developer"],
      teams: isAdmin ? ["platform-team"] : ["backend-team"],
      permissions: isAdmin
        ? ["read:clusters", "write:clusters", "read:pods"]
        : ["read:clusters", "read:pods"],
    };

    const token = await generateMockToken(claims);

    return NextResponse.json({
      token,
      user: claims,
      message: "Authentication successfull (Mock SSO)",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
