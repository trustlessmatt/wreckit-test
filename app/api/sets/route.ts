import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, pokemonSets, userCards } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { privy } from '@/lib/privy';
import { pokemonTCGApi } from '@/lib/pokemon-tcg';

// GET user's Pokemon sets
export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const verifiedClaims = await privy.verifyAuthToken(token);

    if (!verifiedClaims.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userResult = await db.query.users.findFirst({
      where: eq(users.privyDid, verifiedClaims.userId),
    });

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sets = await db.query.pokemonSets.findMany({
      where: eq(pokemonSets.userId, userResult.id),
    });

    const serializedSets = sets.map(set => ({
      ...set,
      createdAt: set.createdAt.toISOString(),
      updatedAt: set.updatedAt.toISOString(),
    }));

    return NextResponse.json({ sets: serializedSets });
  } catch (error) {
    console.error('Get sets error:', error);
    return NextResponse.json({ error: 'Failed to fetch sets' }, { status: 500 });
  }
}

// POST add a new Pokemon set to track
export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const verifiedClaims = await privy.verifyAuthToken(token);

    if (!verifiedClaims.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { setApiId, setName, setSeries, totalCards } = await req.json();

    if (!setApiId || !setName || !totalCards) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userResult = await db.query.users.findFirst({
      where: eq(users.privyDid, verifiedClaims.userId),
    });

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if set already exists for this user
    const existingSet = await db.query.pokemonSets.findFirst({
      where: and(
        eq(pokemonSets.userId, userResult.id),
        eq(pokemonSets.setApiId, setApiId)
      ),
    });

    if (existingSet) {
      return NextResponse.json({ error: 'Set already tracked' }, { status: 409 });
    }

    const [newSet] = await db
      .insert(pokemonSets)
      .values({
        userId: userResult.id,
        setApiId,
        setName,
        setSeries,
        totalCards,
        collectedCards: 0,
      })
      .returning();

    // Fetch cards from PokemonTCG.io and seed them
    const apiCards = await pokemonTCGApi.getSetCards(setApiId);

    // Create user_cards entries for each card
    const seededCards = await db
      .insert(userCards)
      .values(
        apiCards.map((card) => ({
          userId: userResult.id,
          setApiId,
          cardApiId: card.id,
          cardName: card.name,
          cardNumber: card.number,
          collected: false,
        }))
      )
      .returning();

    return NextResponse.json(
      { set: newSet, cards: seededCards },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create set error:', error);
    return NextResponse.json({ error: 'Failed to create set' }, { status: 500 });
  }
}

// DELETE a Pokemon set
export async function DELETE(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const verifiedClaims = await privy.verifyAuthToken(token);

    if (!verifiedClaims.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const setId = searchParams.get('setId');

    if (!setId) {
      return NextResponse.json({ error: 'Set ID required' }, { status: 400 });
    }

    const userResult = await db.query.users.findFirst({
      where: eq(users.privyDid, verifiedClaims.userId),
    });

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete set and all associated cards
    await db.delete(pokemonSets).where(
      and(
        eq(pokemonSets.id, setId),
        eq(pokemonSets.userId, userResult.id)
      )
    );

    // Also delete user cards for this set
    await db.delete(userCards).where(
      and(
        eq(userCards.userId, userResult.id),
        eq(userCards.setApiId, setId)
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete set error:', error);
    return NextResponse.json({ error: 'Failed to delete set' }, { status: 500 });
  }
}
