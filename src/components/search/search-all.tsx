import Link from 'next/link';

import type { AllSearch } from '@/types';

import { cn, getHref, getImageSrc } from '@/lib/utils';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

type SearchAllProps = {
	query: string;
	data: AllSearch;
};

export function SearchAll({ query, data }: SearchAllProps) {
	console.log(query, data);

	Object.entries(data)
		.sort(([, a], [, b]) => a.position - b.position)
		.map(([key, value]) => {
			value.results.map((t) => {
				console.log('getImageSrc', getImageSrc(t.image, 'high'));
			});
		});

	return (
		<div>
			<div className="gap-2 space-y-4 md:grid md:grid-cols-2 md:space-y-0 lg:grid-cols-3 xl:grid-cols-4 p-4">
				{Object.entries(data)
					.sort(([, a], [, b]) => a.position - b.position)
					.map(([key, value]) => {
						if (!value.results.length) return null;

						return (
							<div key={key}>
								<div className="flex">
									<p className="pl-2 font-heading text-lg capitalize tracking-wider drop-shadow">{key.replace('_query', ' Result')}</p>

									{key !== 'top_query' && (
										<Link href={`/search/${key.slice(0, -1)}/${query}`} className="ml-auto rounded-full border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-secondary-foreground">
											View all
										</Link>
									)}
								</div>

								<Separator className="my-2" />

								{value.results.map((t) => (
									<Link key={t.id} href={t.type === 'artist' ? `/artist/${t.id}` : getHref(t.url, t.type)} className="flex gap-2 rounded-md p-2 hover:bg-secondary">
										<div className="relative aspect-square h-12 min-h-fit overflow-hidden rounded border">
											<ImageWithFallback src={getImageSrc(t.image, 'high')} alt={t.title} fill className={cn('z-10 object-cover', getImageSrc(t.image, 'low').includes('default') && 'dark:invert')} fallback={`/images/placeholder/${t.type}.jpg`} />

											<Skeleton className="size-full" />
										</div>

										<div className="my-auto w-[calc(100%-5rem)]">
											<div className="truncate text-sm font-medium">{t.title}</div>

											<div className="truncate text-xs capitalize text-muted-foreground">{t.type == 'songs' ? t.primaryArtistst : t.type == 'albums' ? t.artist : t.description}</div>
										</div>
									</Link>
								))}
							</div>
						);
					})}
			</div>
			<div className="lg:pt-0 pt-12"></div>
		</div>
	);
}
