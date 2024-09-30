'use client';
import Link from 'next/link';
import { AudioLines, ListMusic, ChartNoAxesColumn, Heart, Clock3, CalendarDays } from 'lucide-react';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Righteous } from 'next/font/google';

const righteous = Righteous({
	subsets: ['latin'],
	weight: '400',
});

export default function Sidebar({ session }: { session: Session | null }) {
	const pathname = usePathname();

	return (
		<aside className="flex w-1/5 min-w-[250px] flex-col bg-background/45 h-full z-10">
			<nav className="flex flex-col items-start gap-4 px-10 py-5 text-lg select-none">
				<Link href="/" className="flex gap-2 justify-center mt-1 items-center">
					<h1 className={'text-4xl text-[hsl(var(--color))] ' + righteous.className}>MUSICS</h1>
				</Link>
				<div className="grid gap-6 font-medium mt-16">
					<Link href="/" className={cn('flex items-center gap-4 px-2.5 ', pathname === '/' ? 'text-primary' : 'text-[hsl(var(--color))] hover:text-[hsl(var(--color))]/60')} prefetch={false}>
						<AudioLines className="h-5 w-5" />
						Feed
					</Link>
					<Link href="/playlists" className={cn('flex items-center gap-4 px-2.5', pathname === '/playlists' ? 'text-primary' : 'text-[hsl(var(--color))] hover:text-[hsl(var(--color))]/60')} prefetch={false}>
						<ListMusic className="h-5 w-5" />
						Playlists
					</Link>
					<Link href="/statistics" className={cn('flex items-center gap-4 px-2.5', pathname === '/statistics' ? 'text-primary' : 'text-[hsl(var(--color))] hover:text-[hsl(var(--color))]/60')} prefetch={false}>
						<ChartNoAxesColumn className="h-5 w-5" />
						Statistics
					</Link>
				</div>

				<h3 className="font-medium text-muted-foreground text-sm mt-[20%]">YOUR MUSICS</h3>
				<div className="grid gap-6 font-medium">
					<Link href="/favourites" className={cn('flex items-center gap-4 px-2.5', pathname === '/favourites' ? 'text-primary' : 'text-[hsl(var(--color))] hover:text-[hsl(var(--color))]/60')} prefetch={false}>
						<Heart className="h-5 w-5" />
						Favourites
					</Link>
					<Link href="/later" className={cn('flex items-center gap-4 px-2.5', pathname.startsWith('/later') ? 'text-primary' : 'text-[hsl(var(--color))] hover:text-[hsl(var(--color))]/60')} prefetch={false}>
						<Clock3 className="h-5 w-5" />
						Listen Later
					</Link>
					<Link href="/history" className={cn('flex items-center gap-4 px-2.5', pathname === '/history' ? 'text-primary' : 'text-[hsl(var(--color))] hover:text-[hsl(var(--color))]/60')} prefetch={false}>
						<CalendarDays className="h-5 w-5" />
						History
					</Link>
				</div>
				<h3 className="font-medium text-muted-foreground text-sm mt-[20%]">YOUR PLAYLISTS</h3>
				<div className="grid gap-6 font-medium">
					<Link href="/favourites" className={cn('flex items-center gap-4 px-2.5', pathname === '/favourites' ? 'text-primary' : 'text-[hsl(var(--color))] hover:text-[hsl(var(--color))]/60')} prefetch={false}>
						<Heart className="h-5 w-5" />
						Favourites
					</Link>
					<Link href="/later" className={cn('flex items-center gap-4 px-2.5', pathname.startsWith('/later') ? 'text-primary' : 'text-[hsl(var(--color))] hover:text-[hsl(var(--color))]/60')} prefetch={false}>
						<Clock3 className="h-5 w-5" />
						Listen Later
					</Link>
					<Link href="/history" className={cn('flex items-center gap-4 px-2.5', pathname === '/history' ? 'text-primary' : 'text-[hsl(var(--color))] hover:text-[hsl(var(--color))]/60')} prefetch={false}>
						<CalendarDays className="h-5 w-5" />
						History
					</Link>
				</div>
			</nav>
		</aside>
	);
}
