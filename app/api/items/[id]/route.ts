import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build dynamic update data based on provided fields
    const updateData: any = {};

    if (body.content !== undefined) {
      updateData.content = body.content;
    }
    if (body.is_completed !== undefined) {
      updateData.is_completed = body.is_completed;
    }
    if (body.due_date !== undefined) {
      updateData.due_date = body.due_date ? new Date(body.due_date + 'T00:00:00') : null;

      // If setting a due_date and item doesn't have today_position, assign one
      if (body.due_date) {
        const currentItem = await prisma.item.findUnique({
          where: { id: parseInt(id) },
          select: { today_position: true }
        });

        if (currentItem && currentItem.today_position === null) {
          const maxTodayPositionResult = await prisma.item.aggregate({
            where: {
              due_date: { not: null },
              is_completed: false,
            },
            _max: { today_position: true },
          });
          updateData.today_position = (maxTodayPositionResult._max.today_position ?? -1) + 1;
        }
      } else {
        // If clearing due_date, clear today_position
        updateData.today_position = null;
      }
    }
    if (body.position !== undefined) {
      updateData.position = body.position;
    }
    if (body.today_position !== undefined) {
      updateData.today_position = body.today_position;
    }
    if (body.category_id !== undefined) {
      updateData.category_id = body.category_id;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const item = await prisma.item.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Serialize dates
    const serializedItem = {
      ...item,
      due_date: item.due_date ? item.due_date.toISOString().split('T')[0] : null,
      created_at: item.created_at.toISOString()
    };

    return NextResponse.json(serializedItem);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
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
    await prisma.item.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
