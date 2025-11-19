import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM categories ORDER BY position ASC
    `;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    // Get the highest position
    const maxPosition = await sql`
      SELECT COALESCE(MAX(position), -1) as max_pos FROM categories
    `;
    const newPosition = maxPosition.rows[0].max_pos + 1;

    const result = await sql`
      INSERT INTO categories (name, position)
      VALUES (${name}, ${newPosition})
      RETURNING *
    `;

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
