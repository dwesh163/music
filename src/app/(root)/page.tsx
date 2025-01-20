import { getUser } from '@/lib/auth';

export default async function HomePage() {
	const user = await getUser();
	return (
		<div>
			<h1>Home</h1>
			<p>Welcome to the home page!</p>
			{JSON.stringify(user)}
		</div>
	);
}
