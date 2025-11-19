import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category is empty
    const items = await sql`
      SELECT COUNT(*) as count FROM items WHERE category_id = ${id}
    `;

    if (parseInt(items.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with items' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM categories WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
