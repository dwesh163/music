import { NewReleases } from '@spotify/web-api-ts-sdk';

export interface SimpleTrack {
	name: string;
	id: string;
	artists: {
		name: string;
		id: string;
	}[];
	imageUrl: string;
	album: {
		name: string;
		id: string;
	};
}

export interface SimpleArtist {
	name: string;
	id: string;
	subscribers: string;
	imageUrl: string;
}

export interface RightSidebarType {
	listenMoreOften: SimpleTrack[];
	favouriteArtists: SimpleArtist[];
	newReleases: NewReleases;
}
