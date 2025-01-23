import { SpotifyApi } from '@spotify/web-api-ts-sdk';

export const api = SpotifyApi.withClientCredentials(process.env.SPOTIFY_ID!, process.env.SPOTIFY_SECRET!);
