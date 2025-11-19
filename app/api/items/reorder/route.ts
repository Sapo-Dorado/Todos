import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { itemId, direction, categoryId, isTodayView } = await request.json();

    // Get current item
    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (isTodayView) {
      // Reorder using today_position
      const currentTodayPosition = item.today_position;

      // Get items with due dates (excluding completed items)
      let itemList = await prisma.item.findMany({
        where: {
          due_date: { not: null },
          is_completed: false,
        },
        orderBy: [
          { today_position: 'asc' },
          { id: 'asc' }
        ],
      });

      // Sort to put nulls last
      itemList = itemList.sort((a, b) => {
        if (a.today_position === null && b.today_position === null) return a.id - b.id;
        if (a.today_position === null) return 1;
        if (b.today_position === null) return -1;
        return a.today_position - b.today_position;
      });

      const currentIndex = itemList.findIndex((i) => i.id === parseInt(itemId));

      if (currentIndex === -1) {
        return NextResponse.json({ error: 'Item not found in today list' }, { status: 404 });
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

      // Swap today_positions
      const swapItem = itemList[swapIndex];
      await prisma.item.update({
        where: { id: parseInt(itemId) },
        data: { today_position: swapItem.today_position },
      });
      await prisma.item.update({
        where: { id: swapItem.id },
        data: { today_position: currentTodayPosition },
      });
    } else {
      // Reorder using position (category view)
      const currentPosition = item.position;

      // Get items in the same category (excluding completed items)
      const itemList = await prisma.item.findMany({
        where: {
          category_id: categoryId,
          is_completed: false,
        },
        orderBy: { position: 'asc' },
      });

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
      await prisma.item.update({
        where: { id: parseInt(itemId) },
        data: { position: swapItem.position },
      });
      await prisma.item.update({
        where: { id: swapItem.id },
        data: { position: currentPosition },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering items:', error);
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
  }
}
