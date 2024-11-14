import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    message: 'Match tracker data fetched successfully',
    data: ['Alex vs Fernandez'],
  };

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const response = {
    message: 'Match data received',
    receivedData: body,
  };

  return NextResponse.json(response, { status: 201 });
}
