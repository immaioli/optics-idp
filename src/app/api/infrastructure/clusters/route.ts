import { NextResponse } from 'next/server';
import { InfrastructureAPI } from '@/lib/api/infrastructure';

export async function GET() {
  try {
    // Note: Authentication and RBAC are already handled by the Edge middleware.
    // If the request  reaches this points, the user is authorized.

    const api = new InfrastructureAPI();
    const clusters = await api.getClusters();

    return NextResponse.json({
      clusters,
      count: clusters.length,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve infrastructure data' }, { status: 500 });
  }
}
