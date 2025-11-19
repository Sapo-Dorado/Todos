import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (body.content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(body.content);
    }
    if (body.is_completed !== undefined) {
      updates.push(`is_completed = $${paramCount++}`);
      values.push(body.is_completed);
    }
    if (body.due_date !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(body.due_date);
    }
    if (body.position !== undefined) {
      updates.push(`position = $${paramCount++}`);
      values.push(body.position);
    }
    if (body.category_id !== undefined) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(body.category_id);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await sql.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM items WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
