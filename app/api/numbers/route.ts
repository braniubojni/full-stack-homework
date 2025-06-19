import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  const numbers = await sql`SELECT id, value FROM numbers ORDER BY id ASC`;
  const pairs = [];
  for (let i = 0; i < numbers.length - 1; i++) {
    pairs.push({
      id1: numbers[i].id,
      number1: numbers[i].value,
      id2: numbers[i + 1].id,
      number2: numbers[i + 1].value,
      sum: numbers[i].value + numbers[i + 1].value,
    });
  }
  return NextResponse.json(pairs);
}

export async function POST(request: Request) {
  const { number } = await request.json();
  await sql`INSERT INTO numbers (value) VALUES (${number})`;
  return NextResponse.json({ message: 'Number added' });
}
