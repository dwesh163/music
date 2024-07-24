import { serial, varchar, integer, pgTable, primaryKey, uniqueIndex, date } from 'drizzle-orm/pg-core';

// Define the users table
export const users = pgTable('users', {
  userId: serial('userId').primaryKey(),
  email: varchar('email', { length: 50 }).notNull(),
  username: varchar('username', { length: 50 }).notNull(),
  image: varchar('image', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 30 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
}, (users) => {
  return {
    emailIndex: uniqueIndex('email_idx').on(users.email),
  };
});

// Define the playlists table
export const playlists = pgTable('playlists', {
  playlistId: serial('playlistId').primaryKey(),
  publicId: varchar('publicId', { length: 100 }),
  name: varchar('name', { length: 100 }).notNull(),
  userId: integer('user').references(() => users.userId).notNull(),
});

// Define the playlist_tracks table
export const playlistTracks = pgTable('playlist_tracks', {
  playlistId: integer('playlistId').references(() => playlists.playlistId).notNull(),
  trackId: integer('trackId').notNull(),
  date: date('date').notNull(),
}, (playlistTracks) => {
  return {
    compositePK: primaryKey(playlistTracks.playlistId, playlistTracks.trackId),
  };
});
