import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { itemId, direction, categoryId } = await request.json();

    // Get current item
    const currentItem = await sql`
      SELECT * FROM items WHERE id = ${itemId}
    `;

    if (currentItem.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = currentItem.rows[0];
    const currentPosition = item.position;

    // Get items in the same category (excluding completed items)
    const items = await sql`
      SELECT * FROM items
      WHERE category_id = ${categoryId} AND is_completed = false
      ORDER BY position ASC
    `;

    const itemList = items.rows;
    const currentIndex = itemList.findIndex((i) => i.id === parseInt(itemId));

    if (currentIndex === -1) {
      return NextResponse.json({ error: 'Item not found in list' }, { status: 404 });
    }

    let swapIndex = -1;
    if (direction === 'up' && currentIndex > 0) {
      swapIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < itemList.length - 1) {
      swapIndex = currentIndex + 1;
    }

    if (swapIndex === -1) {
      return NextResponse.json({ error: 'Cannot move item in that direction' }, { status: 400 });
    }

    // Swap positions
    const swapItem = itemList[swapIndex];
    await sql`UPDATE items SET position = ${swapItem.position} WHERE id = ${itemId}`;
    await sql`UPDATE items SET position = ${currentPosition} WHERE id = ${swapItem.id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering items:', error);
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
  }
}
