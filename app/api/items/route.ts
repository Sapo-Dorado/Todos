import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const categoryId = searchParams.get('categoryId');

    let result;
    if (date) {
      // Get items for specific date
      result = await sql`
        SELECT * FROM items
        WHERE due_date = ${date}
        ORDER BY is_completed ASC, position ASC
      `;
    } else if (categoryId) {
      // Get items for specific category
      result = await sql`
        SELECT * FROM items
        WHERE category_id = ${categoryId}
        ORDER BY is_completed ASC, position ASC
      `;
    } else {
      // Get all items
      result = await sql`
        SELECT * FROM items
        ORDER BY category_id, is_completed ASC, position ASC
      `;
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, category_id, due_date } = await request.json();

    // Get the highest position for this category
    const maxPosition = await sql`
      SELECT COALESCE(MAX(position), -1) as max_pos
      FROM items
      WHERE category_id = ${category_id} AND is_completed = false
    `;
    const newPosition = maxPosition.rows[0].max_pos + 1;

    const result = await sql`
      INSERT INTO items (content, category_id, due_date, position)
      VALUES (${content}, ${category_id}, ${due_date || null}, ${newPosition})
      RETURNING *
    `;

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
