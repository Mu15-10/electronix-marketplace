import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Chat API endpoint' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: 'Message sent', data: body });
}
