import { NextRequest, NextResponse } from 'next/server';
import { pokemonTCGApi } from '@/lib/pokemon-tcg';

// GET cards for a specific set from PokemonTCG.io
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const setApiId = searchParams.get('setApiId');

    if (!setApiId) {
      return NextResponse.json(
        { error: 'Set API ID required' },
        { status: 400 }
      );
    }

    const cards = await pokemonTCGApi.getSetCards(setApiId);

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Fetch Pokemon cards error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon cards' },
      { status: 500 }
    );
  }
}
