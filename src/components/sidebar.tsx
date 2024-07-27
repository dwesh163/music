import React from 'react';
import { History, Library, ListMusic, Mic2, Radio, Star, ListPlus, Play, Plus, Search, Loader2 } from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

type NavItem = {
	title: string;
	href: string;
	icon: LucideIcon;
};

export const sidebarNav: NavItem[] = [
	{
		title: 'Top Albums',
		href: '/album',
		icon: Library,
	},
	{
		title: 'Top Playlists',
		href: '/playlist',
		icon: ListMusic,
	},
	{
		title: 'Search',
		href: '/search',
		icon: Search,
	},
	{
		title: 'Top Artists',
		href: '/artist',
		icon: Mic2,
	},
	{
		title: 'Radio',
		href: '/radio',
		icon: Radio,
	},

	// authenticated routes
	{
		title: 'Recently Played',
		href: '/me/recently-played',
		icon: History,
	},
	{
		title: 'Your Favorite',
		href: '/me/liked-songs',
		icon: Star,
	},
];

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import {} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
// import { NewPlaylistForm } from '@/components/playlist/new-playlist-form';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSession } from 'next-auth/react';

export function Sidebar() {
	const [segment] = useSelectedLayoutSegments();

	const { data: session, status } = useSession<boolean>();

	return (
		<aside className="fixed left-0 top-18 hidden h-full w-1/5 space-y-2 border-r p-4 lg:block xl:w-[15%]">
			<h3 className="pl-3 font-heading text-xl drop-shadow-md dark:text-neutral-200 sm:text-2xl md:text-3xl">Discover</h3>

			<nav>
				<ul className="space-y-0.5">
					{sidebarNav.slice(0, 5).map(({ title, href, icon: Icon }) => {
						const isActive = href === '/' + (segment ?? '');

						return (
							<li key={title}>
								<NavLink title={title} href={href} isActive={isActive}>
									<Icon className="mr-2 size-5" />
									{title}
								</NavLink>
							</li>
						);
					})}
				</ul>
			</nav>

			{!!session && (
				<>
					<h3 className="pl-3 font-heading text-lg drop-shadow-md dark:text-neutral-200 sm:text-xl md:text-2xl">Library</h3>

					<nav>
						<ul className="space-y-0.5">
							{sidebarNav.slice(5).map(({ title, href, icon: Icon }) => {
								const isActive = href === '/' + (segment ?? '');

								return (
									<li key={title}>
										<NavLink title={title} href={href} isActive={isActive}>
											<Icon className="mr-2 size-5 shrink-0" />
											{title}
										</NavLink>
									</li>
								);
							})}
						</ul>
					</nav>
				</>
			)}

			<div className="flex items-center justify-between pl-3">
				<h3 className="font-heading text-lg drop-shadow-md dark:text-neutral-200 sm:text-xl md:text-2xl">Playlists</h3>

				{session && session.playlists && session.playlists.length !== 0 && (
					<TooltipProvider>
						<Tooltip delayDuration={0}>
							{/* <NewPlaylistForm user={session.user}> */}
							<TooltipTrigger asChild>
								<Button size="icon" variant="ghost" className="size-7">
									<ListPlus className="size-4" />
								</Button>
							</TooltipTrigger>
							{/* </NewPlaylistForm> */}
							<TooltipContent>Create a new playlist</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>

			<div className="mx-4 space-y-2">
				{session?.user ? (
					session?.playlists?.length === 0 ? (
						// Uncomment the NewPlaylistForm if you need it
						// <NewPlaylistForm user={user}>
						<Button size="sm" title="Create Playlist" className="w-full truncate shadow">
							<Plus className="mr-2 size-4 shrink-0" />
							Create Playlist
						</Button>
					) : // </NewPlaylistForm>
					null
				) : (
					<>
						{status === 'unauthenticated' ? (
							<>
								<Button asChild className="w-full">
									<Link href="/auth/signin">
										<Plus className="mr-2 size-4 shrink-0" />
										Create Playlist
									</Link>
								</Button>
								<p className="text-center text-xs text-muted-foreground">You need to be logged in to create a playlist.</p>
							</>
						) : (
							<div className="w-full flex justify-center">
								<Loader2 />
							</div>
						)}
					</>
				)}
			</div>

			<ScrollArea>
				<ul className="flex max-h-[380px] flex-col">
					{session?.playlists?.map(({ publicId, name }) => {
						return (
							<li key={publicId}>
								<NavLink href={`/me/playlist/${publicId}`} isActive={publicId === segment} className="group">
									<ListMusic className="mr-2 size-5" />
									{name}
									<button className="invisible ml-auto rounded-full p-0.5 ring-offset-background duration-200 ease-in hover:outline-none hover:ring-2 hover:ring-ring hover:ring-offset-2 group-hover:visible">
										<Play className="size-5" />
									</button>
								</NavLink>
							</li>
						);
					})}
				</ul>

				<ScrollBar orientation="vertical" />
			</ScrollArea>
		</aside>
	);
}

const NavLink = React.forwardRef<
	React.ElementRef<'a'>,
	React.ComponentPropsWithoutRef<'a'> & {
		isActive: boolean;
	}
>(({ href, isActive, className, children, ...props }, ref) => {
	return (
		<Button asChild variant="ghost" className="w-full flex justify-start">
			<Link ref={ref} href={href!} className={isActive ? 'bg-secondary font-bold text-secondary-foreground ' + className : className} {...props}>
				{children}
			</Link>
		</Button>
	);
});

NavLink.displayName = 'NavLink';
