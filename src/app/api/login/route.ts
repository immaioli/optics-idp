import { NextResponse } from 'next/server';
import { generateMockToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Identifies if it's an admin by the email address
    const isAdmin = email.includes('admin');

    const token = await generateMockToken({
      email,
      roles: isAdmin ? ['platform-admin'] : ['developer'],
      teams: ['platform-team'],
      permissions: isAdmin ? ['read:clusters', 'write:clusters'] : ['read:clusters'],
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
