# PRD: Database Schema Refactoring - Global Sets and Cards

## Introduction

Refactor the database schema to globally store Pokemon sets and cards independently of user data. The current schema embeds set and card metadata within user-specific tables, causing data duplication, unnecessary PokemonTCG.io API calls, and inability to support multi-user features like trading or deck sharing. The new schema will separate concerns: global sets/cards tables store canonical data from PokemonTCG.io, while a user collection table links users to their collected cards.

## Goals

- Eliminate duplicate storage of set and card metadata across users
- Reduce PokemonTCG.io API calls by caching all sets and cards globally
- Enable future multi-user features (trading, deck building, social sharing)
- Provide a scalable foundation for additional card metadata (conditions, pricing, variants)
- Simplify the data model with clear separation of concerns

## User Stories

### US-001: Create global sets table
**Description:** As a developer, I need a global sets table to store PokemonTCG.io set metadata so it can be shared across all users.

**Acceptance Criteria:**
- [ ] Create `sets` table with columns: id (uuid, pk), setApiId (text, unique), name, series, totalCards (integer), printedTotal (integer), ptcgoCode, releaseDate, legalities (jsonb), images (jsonb: symbol, logo), createdAt, updatedAt
- [ ] Add unique index on `setApiId` for fast lookups
- [ ] Generate and run Drizzle migration successfully
- [ ] Type `Set` exported from schema.ts matches `sets.$inferSelect`

### US-002: Create global cards table
**Description:** As a developer, I need a global cards table to store PokemonTCG.io card metadata linked to sets, so all users reference the same card data.

**Acceptance Criteria:**
- [ ] Create `cards` table with columns: id (uuid, pk), cardApiId (text, unique), setId (uuid, foreign key → sets.id), name, number, supertype, subtypes (text array), types (text array), hp, rarity, images (jsonb: small, large), artist, legalities (jsonb), tcgplayer (jsonb), cardmarket (jsonb), createdAt, updatedAt
- [ ] Add unique index on `cardApiId` for fast lookups
- [ ] Add foreign key constraint from `cards.setId` to `sets.id` with cascade delete
- [ ] Add composite index on `(setId, number)` for ordered card queries
- [ ] Generate and run Drizzle migration successfully
- [ ] Type `Card` exported from schema.ts matches `cards.$inferSelect`

### US-003: Create user collection table
**Description:** As a developer, I need a user collection table to link users to cards they've collected, replacing the current user-specific cards table.

**Acceptance Criteria:**
- [ ] Create `user_collection` table with columns: id (uuid, pk), userId (uuid, foreign key → users.id), cardId (uuid, foreign key → cards.id), collected (boolean, default true), createdAt, updatedAt
- [ ] Add unique constraint on `(userId, cardId)` to prevent duplicate collection entries
- [ ] Add foreign key constraint from `user_collection.cardId` to `cards.id`
- [ ] Add foreign key constraint from `user_collection.userId` to `users.id` with cascade delete
- [ ] Add index on `userId` for fast user collection queries
- [ ] Generate and run Drizzle migration successfully
- [ ] Type `UserCollection` exported from schema.ts matches `user_collection.$inferSelect`

### US-004: Create seed script for modern sets
**Description:** As a developer, I need a migration script that fetches and seeds all modern Pokemon sets (last 3 years) from PokemonTCG.io into the global tables.

**Acceptance Criteria:**
- [ ] Create `scripts/seed-sets-and-cards.ts` executable with `npm run seed:cards`
- [ ] Script fetches all sets from PokemonTCG.io API released on or after 2022-01-01
- [ ] For each set, insert into `sets` table with all metadata
- [ ] For each set, fetch all cards using pagination (pageSize=250, handle multiple pages)
- [ ] For each card, insert into `cards` table linked to parent set
- [ ] Script handles rate limiting (respect PokemonTCG.io rate limits, add delays between requests)
- [ ] Script reports progress: sets processed, cards processed, errors encountered
- [ ] Script is idempotent: safe to run multiple times (upsert based on `setApiId`/`cardApiId`)
- [ ] Script completes successfully and logs final counts

### US-005: Drop old user-specific tables
**Description:** As a developer, I need to remove the old `pokemon_sets` and `user_cards` tables after verifying the new schema works.

**Acceptance Criteria:**
- [ ] Create migration that drops `pokemon_sets` table
- [ ] Create migration that drops `user_cards` table
- [ ] Remove `PokemonSet` and `UserCard` types from schema.ts
- [ ] Update TypeScript exports to only include new schema types
- [ ] All typecheck errors related to old types are resolved
- [ ] Migration runs successfully

### US-006: Update GET /api/sets route
**Description:** As a client application, I need to fetch available Pokemon sets from the global sets table to display them to users for selection.

**Acceptance Criteria:**
- [ ] GET /api/sets returns all sets from global `sets` table (no auth required)
- [ ] Response includes: id, setApiId, name, series, totalCards, images (symbol, logo)
- [ ] Supports optional query param `?q=name` to filter sets by name (case-insensitive)
- [ ] Returns 500 error if database query fails
- [ ] Response format: `{ sets: Set[] }`

### US-007: Update POST /api/sets route
**Description:** As an authenticated user, I need to add a set to my collection, which should create user_collection entries for all cards in that set.

**Acceptance Criteria:**
- [ ] POST /api/sets requires valid Bearer token authentication
- [ ] Request body: `{ setApiId: string }`
- [ ] Validates set exists in global `sets` table, returns 404 if not found
- [ ] Fetches all cards for the set from global `cards` table
- [ ] Creates `user_collection` entries for all cards in set with `collected: false`
- [ ] Checks for existing entries to avoid duplicates (unique constraint handles this)
- [ ] Returns 201 with `{ set: Set, cardsAdded: number }`
- [ ] Returns 401 if token invalid
- [ ] Returns 500 if database operation fails

### US-008: Update GET /api/cards route
**Description:** As an authenticated user, I need to fetch my collected cards for a specific set with their collection status.

**Acceptance Criteria:**
- [ ] GET /api/cards?setApiId=xxx requires valid Bearer token authentication
- [ ] Joins `cards` table with `user_collection` table
- [ ] Returns all cards for the set with `collected` boolean from user_collection (null if not in collection)
- [ ] Response format: `{ cards: (Card & { collected: boolean | null })[] }`
- [ ] Returns 401 if token invalid
- [ ] Returns 500 if database query fails

### US-009: Update PATCH /api/cards route
**Description:** As an authenticated user, I need to toggle the collected status of a card in my collection.

**Acceptance Criteria:**
- [ ] PATCH /api/cards requires valid Bearer token authentication
- [ ] Request body: `{ cardId: uuid, collected: boolean }`
- [ ] Validates card exists in global `cards` table, returns 404 if not found
- [ ] Upserts into `user_collection` table (inserts if missing, updates if exists)
- [ ] Returns 200 with updated card collection entry
- [ ] Returns 401 if token invalid
- [ ] Returns 404 if card not found
- [ ] Returns 500 if database operation fails

### US-010: Update DELETE /api/sets route
**Description:** As an authenticated user, I need to remove a set from my collection, which should delete all user_collection entries for that set.

**Acceptance Criteria:**
- [ ] DELETE /api/sets?setId=xxx requires valid Bearer token authentication
- [ ] Deletes all `user_collection` entries where `cardId` is in the specified set
- [ ] Validates user owns the collection entries being deleted
- [ ] Returns 200 with `{ success: true, cardsRemoved: number }`
- [ ] Returns 401 if token invalid
- [ ] Returns 500 if database operation fails

### US-011: Create GET /api/cards/:cardId route
**Description:** As a client application, I need to fetch detailed card metadata from the global cards table to display card information.

**Acceptance Criteria:**
- [ ] GET /api/cards/:cardId returns full card details from global `cards` table (no auth required)
- [ ] Response includes all card metadata: name, number, images, types, hp, rarity, etc.
- [ ] Returns 404 if card not found
- [ ] Returns 500 if database query fails

## Functional Requirements

- FR-1: Create global `sets` table storing canonical PokemonTCG.io set metadata
- FR-2: Create global `cards` table storing canonical PokemonTCG.io card metadata with foreign key to sets
- FR-3: Create `user_collection` table linking users to cards with collected status
- FR-4: Seed script fetches all modern sets (2022+) and their cards from PokemonTCG.io
- FR-5: Seed script is idempotent and handles rate limiting
- FR-6: Drop old `pokemon_sets` and `user_cards` tables after migration
- FR-7: GET /api/sets returns global sets (no auth)
- FR-8: POST /api/sets creates user_collection entries for all cards in a set
- FR-9: GET /api/cards returns cards with user's collected status
- FR-10: PATCH /api/cards updates collected status via upsert
- FR-11: DELETE /api/sets removes all collection entries for a set
- FR-12: GET /api/cards/:cardId returns detailed card metadata

## Non-Goals

- No data migration from old schema (wiping existing data is acceptable for MVP)
- No real-time sync with PokemonTCG.io (data is static after seed)
- No card pricing updates or historical pricing data
- No card condition tracking (near mint, lightly played, etc.)
- No quantity tracking (multiple copies of same card)
- No trading or deck building features (out of scope, but enabled by new schema)
- No admin panel for manual data refresh
- No automatic card image caching or CDN

## Design Considerations

### Schema Design

**New Tables:**
```typescript
sets {
  id: uuid (pk)
  setApiId: text (unique) // PokemonTCG.io set ID
  name: text
  series: text
  totalCards: integer
  printedTotal: integer
  ptcgoCode: text
  releaseDate: text // YYYY/MM/DD
  legalities: jsonb // { standard, expanded, unlimited }
  images: jsonb // { symbol, logo }
  createdAt: timestamp
  updatedAt: timestamp
}

cards {
  id: uuid (pk)
  cardApiId: text (unique) // PokemonTCG.io card ID
  setId: uuid (fk → sets.id)
  name: text
  number: text
  supertype: text
  subtypes: text[]
  types: text[]
  hp: text
  rarity: text
  images: jsonb // { small, large }
  artist: text
  legalities: jsonb
  tcgplayer: jsonb
  cardmarket: jsonb
  createdAt: timestamp
  updatedAt: timestamp
}

user_collection {
  id: uuid (pk)
  userId: uuid (fk → users.id)
  cardId: uuid (fk → cards.id)
  collected: boolean (default true)
  createdAt: timestamp
  updatedAt: timestamp
  UNIQUE(userId, cardId)
}
```

### Data Flow
1. Seed script runs once, populating sets and cards
2. User adds set to collection → creates user_collection entries for all cards in set
3. User toggles card collected → upserts user_collection entry
4. Queries join cards with user_collection to show collection status

### Index Strategy
- Unique indexes on `sets.setApiId` and `cards.cardApiId` for API lookups
- Composite index on `(cards.setId, cards.number)` for ordered card listing
- Index on `user_collection.userId` for user's collection queries

## Technical Considerations

### PokemonTCG.io Rate Limits
- Free tier: 1000 requests/day, 30 requests/minute
- Seed script must implement exponential backoff and respect rate limits
- Consider batch delays between set/card fetches
- Log all API calls for monitoring

### Database Migration
- Use Drizzle Kit for schema generation and migration
- Drop tables in correct order (respect foreign key constraints)
- No rollback needed for old schema (acceptable data loss for MVP)

### Type Safety
- Export inferred types from Drizzle schema
- Update all API route handlers to use new types
- Update Zustand store types

### Performance
- Global tables eliminate redundant API calls
- Index strategy optimizes common query patterns
- Joins are efficient due to foreign key constraints

## Success Metrics

- Zero PokemonTCG.io API calls during normal user operations (after seed)
- Sub-100ms response time for GET /api/cards queries
- Seed script completes for all 2022+ sets in under 10 minutes
- No duplicate set or card data across users
- Database size increase is acceptable (estimated ~50MB for modern sets)

## Open Questions

- Should we include pre-2022 sets in the seed, or strictly limit to last 3 years?
- What error handling should occur if PokemonTCG.io API is down during seed?
- Should we add a health check endpoint that reports seed status?
- Do we need a mechanism to add individual sets on-demand if a user wants an older set?
