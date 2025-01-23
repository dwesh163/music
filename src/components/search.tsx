'use client';

import { PartialSearchResult } from '@spotify/web-api-ts-sdk';
import { Play, Plus, MoreHorizontal, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

export function SearchResults({ results }: { results: Required<Pick<PartialSearchResult, 'tracks' | 'artists' | 'albums'>> }) {
	return (
		<ScrollArea className="w-full h-[calc(100%-10rem)]">
			<div className="space-y-6">
				{results.tracks.items.length > 0 && (
					<div className="space-y-2">
						{results.tracks.items.map((track) => (
							<div key={`track-${track.id}`} className="flex items-center gap-4 p-3 hover:bg-gray-800/50 rounded-lg group">
								<div className="relative flex-shrink-0">
									<Image src={track.album.images[0]?.url || '/placeholder.png'} alt={track.name} width={56} height={56} className="rounded object-cover" />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-bold truncate w-[50vw]">{track.name}</h3>
									<p className="text-sm text-gray-400 truncate w-[50vw]">
										{track.artists.map((artist) => artist.name).join(', ')} • {track.album.name}
									</p>
								</div>
								<div className="flex items-center gap-3">
									<button className="bg-orange-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<Play size={16} fill="currentColor" />
									</button>
									<button className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
										<Heart size={16} />
									</button>
									<button className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
										<Plus size={16} />
									</button>
									<button className="text-gray-400 hover:text-white">
										<MoreHorizontal size={16} />
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{results.albums.items.length > 0 && (
					<section>
						<h2 className="text-lg font-bold text-orange-500 mb-4">Albums</h2>
						<div className="space-y-2">
							{results.albums.items.map((album) => (
								<div key={`album-${album.id}`} className="flex items-center gap-4 p-3 hover:bg-gray-800/50 rounded-lg group">
									<div className="relative flex-shrink-0">
										<Image src={album.images[0]?.url || '/placeholder.png'} alt={album.name} width={56} height={56} className="rounded object-cover" />
									</div>
									<div className="flex-1 min-w-0">
										<Link href={`/album/${album.id}`} className="hover:underline">
											<h3 className="font-bold truncate w-[50vw]">{album.name}</h3>
										</Link>
										<p className="text-sm text-gray-400 truncate w-[50vw]">
											{album.artists.map((artist) => artist.name).join(', ')} • {album.release_date}
										</p>
									</div>
								</div>
							))}
						</div>
					</section>
				)}

				{results.artists.items.length > 0 && (
					<section>
						<h2 className="text-lg font-bold text-orange-500 mb-4">Artists</h2>
						<div className="space-y-2">
							{results.artists.items.map((artist) => (
								<div key={`artist-${artist.id}`} className="flex items-center gap-4 p-3 hover:bg-gray-800/50 rounded-lg group">
									<div className="relative flex-shrink-0">
										<Image src={artist.images?.[0]?.url || '/placeholder.png'} alt={artist.name} width={56} height={56} className="rounded object-cover" />
									</div>
									<div className="flex-1 min-w-0">
										<Link href={`/artist/${artist.id}`} className="hover:underline">
											<h3 className="font-bold truncate w-[50vw]">{artist.name}</h3>
										</Link>
										<p className="text-sm text-gray-400 truncate w-[50vw]">{artist.followers?.total?.toLocaleString()} followers</p>
									</div>
								</div>
							))}
						</div>
					</section>
				)}
			</div>
		</ScrollArea>
	);
}
