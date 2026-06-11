import { NextResponse } from 'next/server';

// This setup route has been disabled for security.
// To create an admin user, run the seed script locally against the database directly.
export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
