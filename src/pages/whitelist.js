import Head from 'next/head';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Player from '@/components/player';
import Menu from '@/components/menu';
import Loading from '@/components/loading';
import { useRouter } from 'next/router';
import packageJson from '/package.json';

export default function PlayList({ isStarted, setIsStarted }) {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [whitelist, setWhitelist] = useState([]);

	const [isOpen, setIsOpen] = useState(false);
	const [selectedAuthorizations, setSelectedAuthorizations] = useState({});

	const authorizations = ['denied', 'demo', 'premium', 'admin'];

	const handleAuthorizationChange = (userId, authorizationName) => {
		console.log(userId, authorizationName);
		setSelectedAuthorizations((prevState) => ({
			...prevState,
			[userId]: authorizationName,
		}));
		updateAuthorization(userId, authorizationName);
	};

	const updateAuthorization = (userId, authorizationName) => {
		fetch('/api/admin/whitelist', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId: userId,
				authorizationName: authorizationName,
			}),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
			})
			.catch((error) => {
				console.error('Error updating authorization:', error);
			});
	};

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		fetch('/api/admin/whitelist')
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((whitelistData) => {
				const parsedData = {};
				whitelistData.forEach((item) => {
					parsedData[item.user_id_public] = item.authorization_name;
				});
				setWhitelist(whitelistData);
				setSelectedAuthorizations(parsedData);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Error fetching playlist data:', error);
			});
	}, []);

	useEffect(() => {
		if (!session && status != 'unauthenticated') {
			setIsLoading(true);
			return;
		}
		if (status == 'unauthenticated' || (packageJson && packageJson.version && packageJson.version != session.user.version)) {
			router.push('/auth/signin?callbackUrl=' + router.asPath);
		} else if (session.user.accessName != 'admin') {
			router.push('/error?error=AccessDenied');
		} else {
			setIsLoading(false);
		}
	}, [session, status]);

	if (isLoading) {
		return <Loading status={isLoading ? 'loading' : status} />;
	}

	return (
		<>
			<Head>
				<title>Music</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="w-screen h-screen">
				<div className="w-full h-full relative flex overflow-hidden bg-[#171719]">
					<Menu isOpen={isOpen} setIsOpen={setIsOpen} />
					<div
						className="w-full h-full overflow-hidden"
						onClick={() => {
							if (isOpen) setIsOpen(false);
						}}>
						<div className="w-full p-5 pl-4 sm:p-7 pb-0 sm:pb-0 flex justify-between">
							<h1 className="text-3xl mb-0 font-extrabold leading-none tracking-tight md:text-4xl lg:text-6xl text-white">Whitelist</h1>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={toggleMenu} className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer sm:hidden" preserveAspectRatio="none">
								<path d="M6.5 12C6.5 12.5523 6.05228 13 5.5 13C4.94772 13 4.5 12.5523 4.5 12C4.5 11.4477 4.94772 11 5.5 11C6.05228 11 6.5 11.4477 6.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M19.5 12C19.5 12.5523 19.0523 13 18.5 13C17.9477 13 17.5 12.5523 17.5 12C17.5 11.4477 17.9477 11 18.5 11C19.0523 11 19.5 11.4477 19.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
							</svg>
						</div>

						<div className="sm:px-7 px-4 overflow-y-scroll">
							<div className="w-full py-3">
								<div className="relative overflow-x-auto">
									<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
										<thead className="text-xs uppercase dark:text-gray-400">
											<tr>
												<th scope="col" className="px-3 sm:px-3 py-0.5 sm:py-1 text-center">
													#
												</th>
												<th scope="col" className="sm:px-6 py-1 sm:py-3 sm:hidden table-cell">
													User
												</th>
												<th scope="col" className="px-2 sm:px-6 py-1 sm:py-3 hidden sm:table-cell">
													Name
												</th>
												<th scope="col" className="px-2 sm:px-6 py-1 sm:py-3 hidden sm:table-cell">
													Email
												</th>
												<th scope="col" className="px-2 sm:px-6 py-1 sm:py-3 sm:hidden table-cell">
													Last Login
												</th>
												<th scope="col" className="px-2 sm:px-6 py-1 sm:py-3 sm:hidden table-cell">
													Auth
												</th>
												<th scope="col" className="px-2 sm:px-6 py-1 sm:py-3 hidden sm:table-cell">
													Authorization
												</th>
												<th scope="col" className="px-2 sm:px-6 py-1 sm:py-3 hidden sm:table-cell">
													Username
												</th>
												<th scope="col" className="px-2 sm:px-6 py-1 sm:py-3 hidden sm:table-cell">
													Provider
												</th>
												<th scope="col" className="px-2 sm:px-6 py-1 sm:py-3 hidden sm:table-cell">
													Company
												</th>
												<th scope="col" className="px-2 sm:px-6 py-1 sm:py-3 hidden sm:table-cell">
													Last Login
												</th>
											</tr>
										</thead>
										<tbody>
											{whitelist.map((user, index) => (
												<tr key={index} className="bg-[#11111170] hover:bg-[#1d1d1d70] cursor-pointer text-xs sm:text-sm">
													<th scope="row" className="px-3 sm:px-3 py-0.5 sm:py-1 font-medium whitespace-nowrap text-center">
														{index + 1}
													</th>
													<th scope="row" className=" sm:px-6 py-2 sm:py-4 font-medium whitespace-nowrap text-white sm:hidden table-cell">
														<p className="text-base">{user.user_name}</p>
														<p className={user.user_name ? 'text-gray-400 font-normal' : 'text-base'}>{user.user_email}</p>
													</th>
													<th scope="row" className="px-2 sm:px-6 py-2 sm:py-4 font-medium whitespace-nowrap text-white hidden sm:table-cell">
														{user.user_name}
													</th>
													<th scope="row" className="px-2 sm:px-6 py-2 sm:py-4 font-medium whitespace-nowrap text-white hidden sm:table-cell">
														{user.user_email}
													</th>
													<th scope="row" className="px-2 sm:px-6 py-2 sm:py-4 font-medium whitespace-nowrap sm:hidden table-cell">
														<p className="text-gray-400 font-normal">{new Date(user.last_connect).toLocaleString('fr-FR')}</p>
													</th>
													<th scope="row" className="px-2 sm:px-6 py-2 sm:py-4 font-medium whitespace-nowrap text-white">
														{!user.isAdmin ? (
															<select className="bg-transparent text-white border-none outline-none" value={selectedAuthorizations[user.user_id_public] || ''} onChange={(e) => handleAuthorizationChange(user.user_id_public, e.target.value)}>
																{authorizations.map((auth, index) => (
																	<option key={index} value={auth}>
																		{auth}
																	</option>
																))}
															</select>
														) : (
															'Admin'
														)}
													</th>
													<th scope="row" className="px-2 sm:px-6 py-2 sm:py-4 font-medium whitespace-nowrap hidden sm:table-cell">
														{user.user_username}
													</th>
													<th scope="row" className="px-2 sm:px-6 py-2 sm:py-4 font-medium whitespace-nowrap hidden sm:table-cell">
														{user.user_provider}
													</th>
													<th scope="row" className="px-2 sm:px-6 py-2 sm:py-4 font-medium whitespace-nowrap hidden sm:table-cell">
														{user.user_company.slice(0, 1) === '@' ? user.user_company.slice(1) : user.user_company}
													</th>
													<th scope="row" className="px-2 sm:px-6 py-2 sm:py-4 font-medium whitespace-nowrap hidden sm:table-cell">
														{new Date(user.last_connect).toLocaleString('fr-FR')}
													</th>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
