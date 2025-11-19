import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE() {
  try {
    await sql`DELETE FROM items WHERE is_completed = true`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting completed items:', error);
    return NextResponse.json({ error: 'Failed to delete completed items' }, { status: 500 });
  }
}
