import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if universe has any categories
    const categoryCount = await prisma.category.count({
      where: { universe_id: parseInt(id) },
    });

    if (categoryCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete universe with categories' },
        { status: 400 }
      );
    }

    await prisma.universe.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting universe:', error);
    return NextResponse.json({ error: 'Failed to delete universe' }, { status: 500 });
  }
}
