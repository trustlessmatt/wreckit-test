import { PrivyClient } from '@privy-io/server-auth';

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const privyAppSecret = process.env.PRIVY_APP_SECRET!;

if (!privyAppId || !privyAppSecret) {
  throw new Error('Privy credentials are not set in environment variables');
}

export const privy = new PrivyClient(privyAppId, privyAppSecret);
