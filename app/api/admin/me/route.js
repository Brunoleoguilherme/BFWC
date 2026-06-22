import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authAdmin';

export async function GET() {
  const { profile, error } = await requireAuth();
  if (error) return error;
  return NextResponse.json({ role: profile.role, name: profile.name });
}
