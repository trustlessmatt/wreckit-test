import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userCards, users, pokemonSets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { privy } from '@/lib/privy';

// GET cards for a specific set
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

    const { searchParams } = new URL(req.url);
    const setApiId = searchParams.get('setApiId');

    if (!setApiId) {
      return NextResponse.json({ error: 'Set API ID required' }, { status: 400 });
    }

    const userResult = await db.query.users.findFirst({
      where: eq(users.privyDid, verifiedClaims.userId),
    });

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cards = await db.query.userCards.findMany({
      where: and(
        eq(userCards.userId, userResult.id),
        eq(userCards.setApiId, setApiId)
      ),
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

// POST initialize or update cards for a set
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

    const { setApiId, cards } = await req.json();

    if (!setApiId || !cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userResult = await db.query.users.findFirst({
      where: eq(users.privyDid, verifiedClaims.userId),
    });

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Insert cards (upsert would be better here for production)
    const insertedCards = await db
      .insert(userCards)
      .values(
        cards.map((card: any) => ({
          userId: userResult.id,
          setApiId,
          cardApiId: card.id,
          cardName: card.name,
          cardNumber: card.number,
          collected: false,
        }))
      )
      .returning();

    return NextResponse.json({ cards: insertedCards }, { status: 201 });
  } catch (error) {
    console.error('Create cards error:', error);
    return NextResponse.json({ error: 'Failed to create cards' }, { status: 500 });
  }
}

// PATCH update card collection status
export async function PATCH(req: NextRequest) {
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

    const { cardId, collected } = await req.json();

    if (cardId === undefined || collected === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userResult = await db.query.users.findFirst({
      where: eq(users.privyDid, verifiedClaims.userId),
    });

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [updatedCard] = await db
      .update(userCards)
      .set({ collected, updatedAt: new Date() })
      .where(
        and(
          eq(userCards.id, cardId),
          eq(userCards.userId, userResult.id)
        )
      )
      .returning();

    if (!updatedCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Update the set's collected cards count
    const cardSet = await db.query.pokemonSets.findFirst({
      where: eq(pokemonSets.setApiId, updatedCard.setApiId),
    });

    if (cardSet) {
      const allCards = await db.query.userCards.findMany({
        where: and(
          eq(userCards.userId, userResult.id),
          eq(userCards.setApiId, updatedCard.setApiId)
        ),
      });

      const collectedCount = allCards.filter((c) => c.collected).length;

      await db
        .update(pokemonSets)
        .set({ collectedCards: collectedCount, updatedAt: new Date() })
        .where(eq(pokemonSets.id, cardSet.id));
    }

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}
