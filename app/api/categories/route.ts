import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { position: 'asc' },
    });

    // Serialize dates
    const serializedCategories = categories.map(cat => ({
      ...cat,
      created_at: cat.created_at.toISOString()
    }));

    return NextResponse.json(serializedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, universe_id } = await request.json();

    // Get the highest position within this universe
    const maxPositionResult = await prisma.category.aggregate({
      where: { universe_id },
      _max: { position: true },
    });
    const newPosition = (maxPositionResult._max.position ?? -1) + 1;

    const category = await prisma.category.create({
      data: {
        name,
        universe_id,
        position: newPosition,
      },
    });

    // Serialize dates
    const serializedCategory = {
      ...category,
      created_at: category.created_at.toISOString()
    };

    return NextResponse.json(serializedCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
