import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Users API endpoint' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: 'User updated', data: body });
}
