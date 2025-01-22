import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import packageJson from '/package.json';

export default function Signin() {
	const router = useRouter();

	return (
		<div className="flex flex-col w-full items-center justify-center min-h-screen bg-[#171719]">
			<div className="sm:w-full sm:max-w-sm p-8 w-full">
				<h1 className="font-semibold rounded-lg focus:outline-none focus:shadow-outline flex items-center justify-center mb-10 tracking-tighter text-sky-600 text-5xl">MUSICS</h1>
				<h2 className="text-center text-xl  text-white mb-5">Sign in to your account</h2>
				<div className="flex flex-col gap-4">
					<button className="flex items-center justify-center transition-100 gap-2.5 px-2 py-3 bg-[#24292e] hover:bg-[#292d35] rounded-lg drop-shadow-md shadow-2xl text-white" onClick={() => signIn('github', { callbackUrl: router.query.callbackUrl })}>
						<img src="/svg/github-white.svg" alt="GitHub" className="h-6 w-6" />
						<p>Sign in with GitHub</p>
					</button>
					<button className="flex items-center justify-center transition-100 gap-2.5 px-2 py-3 bg-white hover:bg-[#f9f9f9] rounded-lg drop-shadow-md shadow-2xl" onClick={() => signIn('google', { callbackUrl: router.query.callbackUrl })}>
						<img src="/svg/google.svg" alt="Google" className="h-6 w-6" />
						<p>Sign in with Google</p>
					</button>
				</div>
			</div>
			<footer className="absolute bottom-4 text-xs sm:text-base text-white">
				{packageJson.name.toUpperCase()} - {packageJson.version}
			</footer>
		</div>
	);
}
