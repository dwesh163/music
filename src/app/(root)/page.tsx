'use server';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
	const session: Session | null = await getServerSession(authOptions);

	return (
		<div className="flex flex-col items-center justify-center w-full h-full">
			<Card className="w-full sm:w-1/2 xl:w-1/4 sm:mx-5 border-0">
				<CardHeader className="sm:px-6 px-3">
					<CardTitle className="font-semibold tracking-tight text-3xl">Home</CardTitle>
				</CardHeader>
				<CardContent className="pt-0 sm:px-6 px-3">
					<CardDescription className="text-muted/70">{JSON.stringify(session)}</CardDescription>
				</CardContent>
			</Card>
		</div>
	);
}
