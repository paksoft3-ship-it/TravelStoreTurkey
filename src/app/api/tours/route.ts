import { NextResponse } from 'next/server';
import { packages } from '@/data/packages';

export const revalidate = 3600;

// GET - List all active tours/packages (public).
// Served from the static Turkey packages so the public site never depends on
// (or exposes) external database content.
export async function GET() {
  const tours = packages.filter((p) => p.active);
  return NextResponse.json({ tours });
}
