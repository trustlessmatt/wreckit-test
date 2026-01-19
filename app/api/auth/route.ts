import { NextRequest, NextResponse } from 'next/server';
import { privy } from '@/lib/privy';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    // Verify the access token with Privy
    const verifiedClaims = await privy.verifyAuthToken(accessToken);

    if (!verifiedClaims.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const privyDid = verifiedClaims.userId;

    // Check if user exists, if not create them
    let user = await db.query.users.findFirst({
      where: eq(users.privyDid, privyDid),
    });

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          privyDid,
        })
        .returning();
      user = newUser;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
