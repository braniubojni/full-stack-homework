import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  const grades = await sql`SELECT id, class, grade FROM grades ORDER BY id ASC`;
  return NextResponse.json(grades);
}

export async function POST(request: Request) {
  const { class: className, grade } = await request.json();
  await sql`INSERT INTO grades (class, grade) VALUES (${className}, ${grade})`;
  return NextResponse.json({ message: 'Grade added' });
}
