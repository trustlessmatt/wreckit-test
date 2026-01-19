# Pokemon TCG Master Set Tracker

A full-stack Next.js application for tracking Pokemon trading card collections with an interactive binder shelf UI.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Privy.io (cross-platform, mobile-friendly)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **State Management**: Zustand
- **Animations**: GSAP & Framer Motion
- **Styling**: Tailwind CSS 4
- **Card Data**: PokemonTCG.io API

## Features

- 🔐 Secure authentication via Privy.io
- 📚 Interactive binder shelf UI with animations
- 📖 3x4 card grid pages in each binder
- ✅ Track collected cards with checkboxes
- 📊 Progress tracking (X/Y cards, % complete)
- 🔍 Search and add Pokemon sets
- 📱 Cross-platform support (mobile web ready)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Privy.io account
- PokemonTCG.io API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd wreckit-test
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Database - Get from Supabase project settings > Database > Connection string
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase - Get from Supabase project settings > API
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# Privy - Get from Privy dashboard
NEXT_PUBLIC_PRIVY_APP_ID=[YOUR-APP-ID]
PRIVY_APP_SECRET=[YOUR-APP-SECRET]

# Pokemon TCG API - Get from https://pokemontcg.io
POKEMON_TCG_API_KEY=[YOUR-API-KEY]

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > Database
3. Copy the connection string (use "URI" format)
4. Go to Project Settings > API
5. Copy your project URL and anon key

### 4. Set Up Privy

1. Create a new application at [privy.io](https://privy.io)
2. Copy your App ID and App Secret
3. Configure allowed redirect URLs:
   - Local: `http://localhost:3000`
   - Production: `https://your-domain.com`

### 5. Get Pokemon TCG API Key

1. Sign up at [pokemontcg.io](https://pokemontcg.io)
2. Generate an API key
3. Add to your `.env.local`

### 6. Initialize Database

Run database migrations:

```bash
npm run db:push
```

This will create the following tables:
- `users` - User accounts linked to Privy DIDs
- `pokemon_sets` - Sets being tracked by each user
- `user_cards` - Individual card collection status

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── sets/           # Pokemon set CRUD
│   │   ├── cards/          # Card collection tracking
│   │   └── pokemon/        # PokemonTCG.io proxy
│   ├── layout.tsx          # Root layout with Privy provider
│   └── page.tsx            # Main application page
├── components/
│   ├── PrivyProvider.tsx   # Privy authentication wrapper
│   ├── Binder.tsx          # Individual binder component
│   ├── BinderShelf.tsx     # Main shelf view
│   ├── BinderView.tsx      # Open binder with cards
│   ├── CardSlot.tsx        # Individual card slot
│   ├── AddSetModal.tsx     # Add new set modal
│   └── AuthModal.tsx       # Authentication modal
├── db/
│   ├── schema.ts           # Drizzle schema definitions
│   └── index.ts            # Database connection
├── lib/
│   ├── privy.ts            # Privy server client
│   ├── supabase.ts         # Supabase client
│   └── pokemon-tcg.ts      # PokemonTCG.io API wrapper
├── store/
│   ├── useAuthStore.ts     # Authentication state
│   └── useCollectionStore.ts # Collection state
└── drizzle.config.ts       # Drizzle configuration
```

## Database Schema

### users
- `id`: UUID (primary key)
- `privy_did`: User's Privy decentralized ID
- `created_at`, `updated_at`: Timestamps

### pokemon_sets
- `id`: UUID (primary key)
- `user_id`: Foreign key to users
- `set_api_id`: PokemonTCG.io set ID
- `set_name`: Set display name
- `set_series`: Series name
- `total_cards`: Total cards in set
- `collected_cards`: Number of cards collected
- `created_at`, `updated_at`: Timestamps

### user_cards
- `id`: UUID (primary key)
- `user_id`: Foreign key to users
- `set_api_id`: Which set this card belongs to
- `card_api_id`: PokemonTCG.io card ID
- `card_name`: Card display name
- `card_number`: Card number in set
- `collected`: Boolean flag
- `created_at`, `updated_at`: Timestamps

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Important**: After deployment, update your Privy app's allowed redirect URLs to include your production domain.

### Environment Variables for Production

Update `NEXT_PUBLIC_APP_URL` to your production domain:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## MVP Scope

The current MVP includes:

- ✅ Crown Zenith and Phantasmal Flames sets
- ✅ Basic card tracking (collected/not collected)
- ✅ Progress statistics per set
- ✅ Interactive binder shelf animations
- ✅ 3x4 card grid layout
- ✅ Cross-platform authentication

## Future Enhancements

- Full card images from PokemonTCG.io
- Set filtering and search
- Price tracking and valuation
- Collection value over time charts
- Trade management
- Social features (share collections)
- Multiple condition tracking
- Holographic/foil variants
- Card wants/trading lists
- Export collection data

## Troubleshooting

### Privy Login Not Working

- Ensure your App ID is correct in `.env.local`
- Check that your redirect URLs are configured in Privy dashboard
- Verify NEXT_PUBLIC_APP_URL matches your current domain

### Database Connection Issues

- Verify DATABASE_URL is correct (use "Connection pooling" format if on Supabase)
- Check that your Supabase project is active
- Ensure you've run `npm run db:push`

### Pokemon TCG API Errors

- Verify your API key is valid
- Check rate limits (free tier: 50 requests/day)
- The API may be temporarily unavailable

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.
