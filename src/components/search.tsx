'use client';

import { Album, PartialSearchResult, Track } from '@spotify/web-api-ts-sdk';
import { Play, Plus, MoreHorizontal, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { usePlayback } from '@/app/playback-context';
import { cn } from '@/lib/utils';

const SearchResultItem = ({ image, title, subtitle, actions = [], linkHref = null }: { image: string; title: string; subtitle: string; actions: any[] | null; linkHref: string | null }) => {
	const renderContent = () => (
		<div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 hover:bg-gray-800/50 rounded-lg group">
			<div className="relative flex-shrink-0">
				<Image src={image || '/placeholder.png'} alt={title} width={48} height={48} className="rounded object-cover w-12 h-12 sm:w-14 sm:h-14" />
			</div>
			<div className="flex-1 min-w-0 pr-2">
				<h3 className="font-bold text-sm sm:text-base truncate max-w-[50vw]">{title}</h3>
				<p className="text-xs sm:text-sm text-gray-400 truncate max-w-[50vw]">{subtitle}</p>
			</div>
			{actions && (
				<div className="flex items-center space-x-1 sm:space-x-2">
					{actions.map((action, index) => (
						<Button key={index} variant="ghost" size="sm" className={cn('text-gray-400 hover:text-white', action.highlight ? 'bg-orange-500 hover:bg-orange-400 text-white rounded-full p-2' : 'p-1 sm:p-2', 'opacity-0 group-hover:opacity-100 transition-opacity')} onClick={action.onClick}>
							{action.icon}
						</Button>
					))}
					<Button variant="ghost" size="sm" className="p-1 sm:p-2 text-gray-400 hover:text-white">
						<MoreHorizontal size={14} className="sm:size-4" />
					</Button>
				</div>
			)}
		</div>
	);

	return linkHref ? (
		<Link href={linkHref} className="block">
			{renderContent()}
		</Link>
	) : (
		renderContent()
	);
};

export function SearchResults({ results }: { results: Required<Pick<PartialSearchResult, 'tracks' | 'artists' | 'albums'>> }) {
	const { playTrack } = usePlayback();

	const onPlayTrack = (track: Track) => {
		playTrack({
			id: track.id,
			name: track.name,
			artists: track.artists.map((artist) => ({ id: artist.id, name: artist.name })),
			imageUrl: track.album.images[0]?.url,
			album: { id: track.album.id, name: track.album.name },
			duration: track.duration_ms / 1000,
		});
	};

	const renderResultSection = (title: string | null, items: any[], renderItem: (item: any) => React.ReactNode) => {
		if (items.length === 0) return null;

		return (
			<section className="space-y-2">
				{title && <h2 className="text-base sm:text-lg font-bold text-orange-500 mb-2 sm:mb-4">{title}</h2>}
				{items.map(renderItem)}
			</section>
		);
	};

	return (
		<ScrollArea className="w-full h-[calc(100vh-8rem)] sm:h-[calc(100%-10rem)]">
			<div className="space-y-4 sm:space-y-6 p-1 sm:p-2">
				{renderResultSection(null, results.tracks.items, (track: Track) => (
					<SearchResultItem
						key={`track-${track.id}`}
						image={track.album.images[0]?.url}
						title={track.name}
						subtitle={`${track.artists.map((artist) => artist.name).join(', ')} • ${track.album.name}`}
						actions={[
							{
								icon: <Play size={14} className="sm:size-4" fill="currentColor" />,
								onClick: (e: Event) => {
									e.preventDefault();
									onPlayTrack(track);
								},
								highlight: true,
							},
							{
								icon: <Heart size={14} className="sm:size-4" />,
								onClick: (e: Event) => {
									e.preventDefault();
								},
							},
							{
								icon: <Plus size={14} className="sm:size-4" />,
								onClick: (e: Event) => {
									e.preventDefault();
								},
							},
						]}
						linkHref={null}
					/>
				))}

				{renderResultSection('Albums', results.albums.items, (album: Album) => (
					<SearchResultItem key={`album-${album.id}`} image={album.images[0]?.url} title={album.name} subtitle={`${album.artists.map((artist) => artist.name).join(', ')} • ${album.release_date}`} actions={[]} linkHref={`/album/${album.id}`} />
				))}

				{renderResultSection('Artists', results.artists.items, (artist) => (
					<SearchResultItem key={`artist-${artist.id}`} image={artist.images?.[0]?.url} title={artist.name} subtitle={`${artist.followers?.total} followers`} actions={[]} linkHref={`/artist/${artist.id}`} />
				))}
			</div>
		</ScrollArea>
	);
}
