import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  privyDid: text('privy_did').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pokemonSets = pgTable('pokemon_sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  setApiId: text('set_api_id').notNull(), // PokemonTCG.io set ID
  setName: text('set_name').notNull(),
  setSeries: text('set_series'),
  totalCards: integer('total_cards').notNull(),
  collectedCards: integer('collected_cards').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userCards = pgTable('user_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  setApiId: text('set_api_id').notNull(),
  cardApiId: text('card_api_id').notNull(),
  cardName: text('card_name').notNull(),
  cardNumber: text('card_number').notNull(),
  collected: boolean('collected').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PokemonSet = typeof pokemonSets.$inferSelect;
export type NewPokemonSet = typeof pokemonSets.$inferInsert;
export type UserCard = typeof userCards.$inferSelect;
export type NewUserCard = typeof userCards.$inferInsert;
