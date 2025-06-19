import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    // Get all numbers
    const numbers = await sql`SELECT * FROM numbers ORDER BY id`;

    // Calculate pairs and sums
    const pairs = [];
    for (let i = 0; i < numbers.length - 1; i++) {
      const current = numbers[i];
      const next = numbers[i + 1];
      pairs.push({
        id1: current.id,
        number1: current.value,
        id2: next.id,
        number2: next.value,
        sum: current.value + next.value,
      });
    }

    return NextResponse.json(pairs);
  } catch (error) {
    console.error('Error fetching number pairs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch number pairs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value } = body;

    // Validate input is an integer
    if (!Number.isInteger(Number(value))) {
      return NextResponse.json(
        { error: 'Value must be an integer' },
        { status: 400 }
      );
    }

    // Insert the new number using raw SQL
    const result = await sql`
      INSERT INTO numbers (value)
      VALUES (${value})
      RETURNING id, value
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding number:', error);
    return NextResponse.json(
      { error: 'Failed to add number' },
      { status: 500 }
    );
  }
}
