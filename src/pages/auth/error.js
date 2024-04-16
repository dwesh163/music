import { useRouter } from 'next/router';
import packageJson from '/package.json';

export default function Signin() {
	const router = useRouter();

	return (
		<div className="flex flex-col w-full items-center justify-center min-h-screen bg-[#171719]">
			<div className="sm:w-full sm:max-w-sm p-8 w-full">
				<h1 className="font-semibold rounded-lg focus:outline-none focus:shadow-outline flex items-center justify-center mb-10 tracking-tighter text-sky-600 text-5xl">MUSIC</h1>
				<h2 className="text-center sm:text-xl text-base text-white mb-8">
					{router.query.error == 'AccessDenied' ? '' : 'An error occurred: '} {router.query.error}
				</h2>
			</div>
			<footer className="absolute bottom-4 text-xs sm:text-base text-white">
				{packageJson.name.toUpperCase()} - {packageJson.version}
			</footer>
		</div>
	);
}
