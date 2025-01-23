'use client';

import { Artist, Page, SimplifiedAlbum, TopTracksResult } from '@spotify/web-api-ts-sdk';
import { Play, Heart, MoreHorizontal, Plus } from 'lucide-react';
import momment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

export function ArtistComponents({ artist }: { artist: { data: Artist; topTracks: TopTracksResult; albums: Page<SimplifiedAlbum> } }) {
	return (
		<div className="w-full h-full">
			<div className="relative h-[200px]">
				<Image src={artist.data.images[0].url} alt={artist.data.name} fill className="object-cover brightness-50" />
				<div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
					<div className="max-w-6xl mx-auto">
						<h1 className="text-6xl font-bold mb-4">{artist.data.name}</h1>
						<p className="text-gray-300 text-lg">{artist.data.followers?.total?.toLocaleString()} Followers</p>
					</div>
				</div>
			</div>

			<div className="px-6 py-6 h-[calc(100%-200px)]">
				<div className="flex items-center gap-4 mb-8">
					<button className="bg-orange-500 rounded-full px-8 py-3 hover:bg-orange-600 transition-colors flex items-center gap-2">
						<Play size={20} fill="currentColor" />
						Play
					</button>
					<button className="text-gray-400 hover:text-white">
						<Heart size={24} />
					</button>
					<button className="text-gray-400 hover:text-white">
						<MoreHorizontal size={24} />
					</button>
				</div>

				<ScrollArea className="w-full h-[calc(100%-4rem)]">
					<section className="mb-12">
						<h2 className="text-2xl font-bold mb-6">Popular</h2>
						<div className="space-y-2">
							{artist.topTracks.tracks.map((track, index) => (
								<div key={track.id} className="grid grid-cols-[auto,1fr,auto,auto] gap-4 p-3 hover:bg-gray-800/50 rounded-lg group items-center">
									<span className="w-3 text-right text-gray-400">{index + 1}</span>
									<div className="flex items-center gap-4">
										<Image src={track.album.images[0]?.url || '/placeholder.png'} alt={track.name} width={56} height={56} className="rounded object-cover" />
										<div>
											<h3 className="font-medium">{track.name}</h3>
											<p className="text-sm text-gray-400">{track.album.name}</p>
										</div>
									</div>
									<button className="bg-orange-500 hover:bg-opacity-90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<Play size={16} fill="currentColor" />
									</button>
									<div className="flex items-center gap-4">
										<span className="text-gray-400 text-sm">{momment.utc(track.duration_ms).format('mm:ss')}</span>
										<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<button className="text-gray-400 hover:text-white">
												<Heart size={16} />
											</button>
											<button className="text-gray-400 hover:text-white">
												<Plus size={16} />
											</button>
											<button className="text-gray-400 hover:text-white">
												<MoreHorizontal size={16} />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-bold mb-6">Albums</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
							{artist.albums.items.map((album) => (
								<Link key={album.id} href={`/album/${album.id}`} className="group">
									<div className="relative aspect-square mb-4">
										<Image src={album.images[0].url} alt={album.name} fill className="object-cover rounded-lg" />
										<button className="absolute bottom-4 right-4 bg-orange-500 text-white rounded-full p-3 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
											<Play size={20} fill="currentColor" />
										</button>
									</div>
									<Link href={`/album/${album.id}`} className="hover:underline">
										<h3 className="font-medium truncate">{album.name}</h3>
									</Link>
									<p className="text-sm text-gray-400">
										{album.release_date} • {album.total_tracks} songs
									</p>
								</Link>
							))}
						</div>
					</section>
				</ScrollArea>
			</div>
		</div>
	);
}
