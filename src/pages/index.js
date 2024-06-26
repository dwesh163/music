import Head from 'next/head';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Player from '@/components/player';
import Menu from '@/components/menu';
import Loading from '@/components/loading';
import Comments from '@/components/comments';
import { useRouter } from 'next/router';
import packageJson from '/package.json';

export default function Home({ isStarted, setIsStarted }) {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);

	const [forYouText, setForYouText] = useState([{ text: 'Based on your likes' }, { text: 'New Album' }, { text: 'New Track for you' }, { text: 'New For You' }]);
	const [recommandations, setRecommandations] = useState([]);

	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		if (JSON.parse(localStorage.getItem('recommendations'))) {
			setRecommandations(JSON.parse(localStorage.getItem('recommendations')));
			return;
		}
		fetch('/api/home')
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				setRecommandations(data.recommendations.tracks);
				localStorage.setItem('recommendations', JSON.stringify(data.recommendations.tracks));
				if (data.error) {
					router.push('/error?error=' + session.user.error);
				}
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
		} else if (!session.user.access) {
			router.push('/error?error=' + session.user.error);
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
				<meta name="description" content="An app to listen music" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="">
				<div className="w-full h-full relative flex overflow-hidden bg-[#171719]">
					<Menu isOpen={isOpen} setIsOpen={setIsOpen} />
					<div
						className="w-full h-full overflow-hidden"
						onClick={() => {
							if (isOpen) setIsOpen(false);
						}}>
						<div className="w-full p-5 pl-4 sm:p-7 pb-0 sm:pb-0 flex justify-end">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={toggleMenu} className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer sm:hidden" preserveAspectRatio="none">
								<path d="M6.5 12C6.5 12.5523 6.05228 13 5.5 13C4.94772 13 4.5 12.5523 4.5 12C4.5 11.4477 4.94772 11 5.5 11C6.05228 11 6.5 11.4477 6.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M19.5 12C19.5 12.5523 19.0523 13 18.5 13C17.9477 13 17.5 12.5523 17.5 12C17.5 11.4477 17.9477 11 18.5 11C19.0523 11 19.5 11.4477 19.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
							</svg>
						</div>

						<div className="sm:px-7 px-4 overflow-scroll">
							<div className="flex flex-col justify-start items-center w-full gap-6 pb-32">
								<div className="flex-grow-0 flex-shrink-0 w-full relative">
									<div className="w-full h-[38px] overflow-hidden">
										<p className="text-lg font-semibold text-left text-[#fcfcfc] mt-1.5">For you</p>
									</div>
									<div className="w-full overflow-scroll">
										<div className="flex sm:w-[2770px] w-[1575px] sm:gap-6 gap-2">
											{recommandations.map((track, index) => (
												<div key={index} className="sm:w-[255px] w-[150px] h-[210px] sm:h-[350px] overflow-hidden rounded-lg" style={{ filter: 'drop-shadow(0px 8px 28px rgba(0,0,0,0.4))' }}>
													<div className="sm:w-[255px] w-[150px] overflow-hidden">
														<img src={track.album.images[0].url} className="sm:w-[255px] w-[150px] sm:h-[257px] h-[150px] object-cover" />
													</div>
													<div className="sm:w-[255px] w-[150px] sm:h-[100px] h-[70px] overflow-hidden sm:p-2 p-1">
														<div className="w-[228px] overflow-hidden">
															<p className="sm:text-[10px] text-[9px] font-semibold text-left uppercase text-[#ef2f62]">{forYouText[Math.floor(Math.random() * 4)].text}</p>
															<p className="sm:text-[1.1rem] text-[0.7rem] w-full font-semibold text-left text-[#fcfcfc] overflow-x-auto whitespace-nowrap">{track.name}</p>
															<span className="w-[197px] flex gap-1 sm:text-sm text-[0.6rem] font-semibold text-left text-[#9898a6]">
																{track.artists.slice(0, 2).map((item, index) => (
																	<span key={index}>
																		<span className={'cursor-pointer ' + (index !== 0 ? 'hidden sm:inline' : '')} onClick={() => router.push('/artists/' + item.id)}>
																			{item.name}
																			{index !== track.artists.slice(0, 2).length - 1 && <span className="visible">,</span>}
																		</span>
																	</span>
																))}
															</span>
														</div>
														<div className="w-[286px] h-[286px] ml-[-10px] mt-[-150px] opacity-40">
															<img src={track.album.images[0].url} className="w-[274px] h-[237px] object-cover blur opacity-60" />
														</div>
													</div>
													<div className="sm:w-10 sm:h-10 w-7 h-7 rounded-[999px] bg-[#fcfcfc] flex items-center justify-center left-[7rem] top-[136px] sm:left-48 sm:top-[236.5px] absolute" style={{ boxShadow: '0px 2.200000047683716px 5.5px 0 rgba(0,0,0,0.1)' }}>
														<div className="flex sm:w-4 sm:h-4 sm:gap-2.5 sm:mt-[-2px] sm:ml-0 ml-[0.1rem] items-center justify-center">
															<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative sm:w-4 sm:h-4 w-3 h-3" preserveAspectRatio="none">
																<path d="M4.0836 14.1878L4.07249 14.1954L4.06181 14.2036C4.03221 14.2264 4.00874 14.2321 3.99134 14.2332C3.97153 14.2344 3.94728 14.2301 3.92186 14.2166C3.86986 14.189 3.83333 14.1358 3.83333 14.0666V1.93327C3.83333 1.86407 3.86987 1.81087 3.92186 1.78328C3.94728 1.76979 3.97153 1.76545 3.99134 1.76668C4.00874 1.76777 4.03221 1.77348 4.06181 1.79625L4.073 1.80486L4.08466 1.81282L12.918 7.84616L12.918 7.84618L12.9226 7.8493C12.9798 7.88739 13 7.93754 13 7.98327C13 8.029 12.9798 8.07916 12.9226 8.11725L12.9226 8.11721L12.9169 8.12112L4.0836 14.1878Z" fill="#171719" stroke="#171719" />
															</svg>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>

								{/* <div className="flex-grow-0 flex-shrink-0 w-[1156px] h-[360px] relative overflow-hidden">
									<div className="w-[1104px] h-[38px] left-8 top-0 overflow-hidden">
										<p className="absolute left-0 top-1.5 text-lg font-semibold text-left text-[#fcfcfc]">Section Title </p>
										<div className="flex justify-center items-center w-6 absolute left-[1104px] top-8 p-1 rounded-[999px] bg-[#1f1f22] border border-[#ebebff]/5">
											<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5">
												<svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
													<path d="M6.00001 13.2L11.2 7.99995L6.00001 2.79995" stroke="#FCFCFC" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</div>
										</div>
										<div className="flex justify-center items-center w-6 absolute left-[1048px] top-2 opacity-60 p-1 rounded-[999px] bg-[#1f1f22] border border-[#ebebff]/5">
											<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5">
												<svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
													<path d="M9.99999 2.80005L4.79999 8.00005L9.99999 13.2" stroke="#FCFCFC" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</div>
										</div>
									</div>
									<div className="w-[2208px] h-[383px] absolute left-[30px] top-[45px]">
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-px top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-4.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">Blood Sugar Sex Magik (Deluxe Edition)</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Red Hot Chili Peppers</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[1169px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-9.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">Multitude</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Stromae</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[225px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Daily Discovery</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Songs by new and familiar artists inspired by your listening. Updates every morning.</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[1393px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-7.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Mix 1</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Stromae, Angèle, Isaac Delusion and more</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[449px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-2.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Mix 2</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Ghali, Liberato, Coma_Cose and more</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[1617px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-8.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Mix 3</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Lido Pimienta, Romy, Dana Gavanski and more</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[673px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-3.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Mix 4</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Stephanie Beatriz, Kristen Bell, JD McCrary and more</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[1841px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-10.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">Moderat III</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Moderat</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[897px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-5.png" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">In Your Honor</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Foo Fighters</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[2065px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-11.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">In Your Honor</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Foo Fighters</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
									</div>
								</div>
								<div className="flex-grow-0 flex-shrink-0 w-[1156px] h-[360px] relative overflow-hidden">
									<div className="w-[1104px] h-[38px] absolute left-8 top-0 overflow-hidden">
										<p className="absolute left-0 top-1.5 text-lg font-semibold text-left text-[#fcfcfc]">Section Title </p>
										<div className="flex justify-center items-center w-6 absolute left-[1104px] top-8 p-1 rounded-[999px] bg-[#1f1f22] border border-[#ebebff]/5">
											<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5">
												<svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
													<path d="M6.00001 13.2L11.2 7.99995L6.00001 2.79995" stroke="#FCFCFC" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</div>
										</div>
										<div className="flex justify-center items-center w-6 absolute left-[1048px] top-2 opacity-60 p-1 rounded-[999px] bg-[#1f1f22] border border-[#ebebff]/5">
											<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5">
												<svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
													<path d="M9.99999 2.80005L4.79999 8.00005L9.99999 13.2" stroke="#FCFCFC" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</div>
										</div>
									</div>
									<div className="w-[2208px] h-[383px] absolute left-[30px] top-[45px]">
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-px top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Daily Discovery</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Songs by new and familiar artists inspired by your listening. Updates every morning.</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[1169px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-7.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Mix 1</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Stromae, Angèle, Isaac Delusion and more</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[225px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-2.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Mix 2</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Ghali, Liberato, Coma_Cose and more</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[1393px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-8.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Mix 3</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Lido Pimienta, Romy, Dana Gavanski and more</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[449px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-3.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">My Mix 4</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Stephanie Beatriz, Kristen Bell, JD McCrary and more</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[1617px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-10.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">Moderat III</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Moderat</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[673px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-4.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">Blood Sugar Sex Magik (Deluxe Edition)</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Red Hot Chili Peppers</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[1841px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-11.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">In Your Honor</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Foo Fighters</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[897px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-6.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">Mellon Collie And The Infinite Sadness (Deluxe Edition)</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Greatest Hits</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
										<div className="flex flex-col justify-start items-start w-[200px] absolute left-[2065px] top-0.5 overflow-hidden gap-4">
											<div className="flex-grow-0 flex-shrink-0 w-[200px] h-[200px] relative overflow-hidden rounded-[3px] bg-[#fcfcfc]">
												<img src="#image-thumb-12.jpeg" className="w-[200px] h-[202px] absolute left-[-1px] top-[-3px] object-cover" />
											</div>
											<div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1">
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">At Swim</p>
												<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Lisa Hannigan</p>
												<p className="flex-grow-0 flex-shrink-0 text-[10px] font-semibold text-left text-[#9898a6]">LABEL</p>
											</div>
										</div>
									</div>
								</div> */}
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
