import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    await prisma.item.deleteMany({
      where: { is_completed: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting completed items:', error);
    return NextResponse.json({ error: 'Failed to delete completed items' }, { status: 500 });
  }
}
