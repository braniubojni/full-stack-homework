import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    // Get all grades
    const grades = await sql`SELECT * FROM grades ORDER BY id`;

    return NextResponse.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { class: className, grade } = body;

    // Validate input
    if (!className || !['Math', 'Science', 'History'].includes(className)) {
      return NextResponse.json(
        { error: 'Invalid class. Must be Math, Science, or History' },
        { status: 400 }
      );
    }

    const gradeValue = Number(grade);
    if (!Number.isInteger(gradeValue) || gradeValue < 0 || gradeValue > 100) {
      return NextResponse.json(
        { error: 'Grade must be an integer between 0 and 100' },
        { status: 400 }
      );
    }

    // Insert the new grade using raw SQL
    const result = await sql`
      INSERT INTO grades (class, grade)
      VALUES (${className}, ${gradeValue})
      RETURNING id, class, grade
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding grade:', error);
    return NextResponse.json({ error: 'Failed to add grade' }, { status: 500 });
  }
}
