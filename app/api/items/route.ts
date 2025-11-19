import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const categoryId = searchParams.get('categoryId');

    let items;
    if (date) {
      // Get items for specific date
      items = await prisma.item.findMany({
        where: { due_date: new Date(date) },
        orderBy: [{ is_completed: 'asc' }, { position: 'asc' }],
      });
    } else if (categoryId) {
      // Get items for specific category
      items = await prisma.item.findMany({
        where: { category_id: parseInt(categoryId) },
        orderBy: [{ is_completed: 'asc' }, { position: 'asc' }],
      });
    } else {
      // Get all items
      items = await prisma.item.findMany({
        orderBy: [{ category_id: 'asc' }, { is_completed: 'asc' }, { position: 'asc' }],
      });
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, category_id, due_date } = await request.json();

    // Get the highest position for this category
    const maxPositionResult = await prisma.item.aggregate({
      where: {
        category_id: category_id,
        is_completed: false,
      },
      _max: { position: true },
    });
    const newPosition = (maxPositionResult._max.position ?? -1) + 1;

    const item = await prisma.item.create({
      data: {
        content,
        category_id,
        due_date: due_date ? new Date(due_date) : null,
        position: newPosition,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
