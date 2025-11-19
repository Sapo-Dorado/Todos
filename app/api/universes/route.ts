import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const universes = await prisma.universe.findMany({
      orderBy: { position: 'asc' },
    });

    // Serialize dates
    const serializedUniverses = universes.map(universe => ({
      ...universe,
      created_at: universe.created_at.toISOString()
    }));

    return NextResponse.json(serializedUniverses);
  } catch (error) {
    console.error('Error fetching universes:', error);
    return NextResponse.json({ error: 'Failed to fetch universes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    // Get the highest position
    const maxPositionResult = await prisma.universe.aggregate({
      _max: { position: true },
    });
    const newPosition = (maxPositionResult._max.position ?? -1) + 1;

    const universe = await prisma.universe.create({
      data: {
        name,
        position: newPosition,
      },
    });

    // Serialize dates
    const serializedUniverse = {
      ...universe,
      created_at: universe.created_at.toISOString()
    };

    return NextResponse.json(serializedUniverse, { status: 201 });
  } catch (error) {
    console.error('Error creating universe:', error);
    return NextResponse.json({ error: 'Failed to create universe' }, { status: 500 });
  }
}
