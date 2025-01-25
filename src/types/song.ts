export interface Song {
	id: string;
	imageUrl: string;
	name: string;
	artists: {
		id: string;
		name: string;
	}[];
	album: {
		id: string;
		name: string;
	};
	duration: number;
}
