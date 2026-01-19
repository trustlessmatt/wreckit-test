import { NextRequest, NextResponse } from 'next/server';
import { pokemonTCGApi } from '@/lib/pokemon-tcg';

// GET available Pokemon sets from PokemonTCG.io
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    let sets;
    if (query) {
      // Filter sets by name (client-side filtering for MVP)
      const allSets = await pokemonTCGApi.getSets();
      sets = allSets.filter((set) =>
        set.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      sets = await pokemonTCGApi.getSets();
    }

    // For MVP, only include Crown Zenith and Phantasmal Flames
    const mvpSets = sets.filter(
      (set) =>
        set.name.toLowerCase().includes('crown zenith') ||
        set.name.toLowerCase().includes('phantasmal flames')
    );

    return NextResponse.json({ sets: mvpSets });
  } catch (error) {
    console.error('Fetch Pokemon sets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon sets' },
      { status: 500 }
    );
  }
}
