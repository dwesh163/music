import { signOut, useSession } from 'next-auth/react';
import { Router, useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function Menu({ isOpen, setIsOpen }) {
	const router = useRouter();
	const { data: session, status } = useSession();

	const [isLoading, setIsLoading] = useState(true);
	const [selectedMenu, setselectedMenu] = useState('Home');
	const [menus, setMenus] = useState(['Home', 'Explore']);
	const [playlists, setPlaylists] = useState([]);
	const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

	const buttonRef = useRef(null);

	const [collections, setCollections] = useState([
		{ name: 'Playlists', svg: '/svg/playlists.svg', url: 'playlists' },
		{ name: 'Albums', svg: '/svg/albums.svg', url: 'albums' },
		{ name: 'Tracks', svg: '/svg/tracks.svg', url: 'tracks' },
		{ name: 'Artists', svg: '/svg/artists.svg', url: 'artists' },
	]);

	useEffect(() => {
		setIsLoading(true);
		const fetchData = async () => {
			try {
				const response = await fetch('/api/playlist');
				const playlistsData = await response.json();
				if (!playlistsData.error) {
					setPlaylists(playlistsData);
				}
				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching audio data:', error);
			}
		};

		fetchData();
	}, []);

	if (isLoading) {
		return (
			<div className="lg:w-1/5 md:w-1/4 md:max-w-96 sm:w-[30%] h-full w-0 left-0 top-0 overflow-hidden">
				<div className="flex flex-col justify-start items-start w-full left-0 top-0 overflow-hidden gap-3 px-3 pt-4 pb-8 bg-[#212124] h-screen">
					<div className="flex justify-between items-center flex-grow-0 flex-shrink-0 w-full relative p-3 pb-0 rounded-lg">
						<div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative gap-2.5 p-0.5 rounded-[999px] bg-[#63676f]">
							<p className="flex-grow-0 flex-shrink-0 w-8 h-8 text-8 pt-1 font-medium text-center text-[#cacad1]"></p>
						</div>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0 w-6 h-6 relative" preserveAspectRatio="none">
							<path d="M6.5 12C6.5 12.5523 6.05228 13 5.5 13C4.94772 13 4.5 12.5523 4.5 12C4.5 11.4477 4.94772 11 5.5 11C6.05228 11 6.5 11.4477 6.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
							<path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
							<path d="M19.5 12C19.5 12.5523 19.0523 13 18.5 13C17.9477 13 17.5 12.5523 17.5 12C17.5 11.4477 17.9477 11 18.5 11C19.0523 11 19.5 11.4477 19.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
						</svg>
					</div>
					<div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0"></div>
					<div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative mt-5"></div>
					<div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative"></div>
				</div>
			</div>
		);
	}

	return (
		<div className={'lg:w-1/5 md:w-1/4 md:max-w-96 sm:w-[30%] w-48 h-full left-0 top-0 sm:relative absolute z-50 sm:z-10 overflow-hidden' + (isOpen ? '' : ' sm:flex hidden')}>
			<div className="flex flex-col justify-start items-start w-full left-0 top-0 overflow-hidden gap-3 px-3 pt-4 pb-8 bg-[#212124] h-screen">
				<div className="flex justify-between items-center flex-grow-0 flex-shrink-0 w-full relative p-3 pb-0 rounded-lg">
					<div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative gap-2.5 rounded-[999px] bg-[#63676f]">
						{session.user.image ? (
							<img className="w-10 h-10 rounded-full" src={session.user.image} />
						) : (
							<p className="flex-grow-0 flex-shrink-0 w-8 h-8 text-8 pt-1 font-medium text-center text-[#cacad1]">
								{session.user.name
									.split(' ')
									.map((word) => word[0])
									.join('')}
							</p>
						)}
					</div>
				</div>
				<div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0">
					{menus.map((menu, index) => (
						<div key={index + '-menu'} onClick={() => router.push('/')} className="flex justify-start items-center flex-grow-0 flex-shrink-0 w-full relative gap-2.5 p-3 rounded-lg cursor-pointer">
							<p className={'flex-grow w-full text-base font-medium text-left ' + (menu == selectedMenu ? 'text-[#0ff]' : 'text-[#fcfcfc]')}>{menu}</p>
						</div>
					))}
				</div>
				<div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative mt-5">
					<p className="flex-grow-0 flex-shrink-0 w-[129px] h-4 text-xs font-medium text-left text-[#9898a6]">MY COLLECTION</p>
					{collections.map((collection, index) => (
						<div key={index + '-collection'} onClick={() => router.push('/' + collection.url)} className="flex justify-start items-center cursor-pointer flex-grow-0 flex-shrink-0 w-full relative gap-2.5 p-3 rounded-lg hover:text-gray-400 hover:brightness-75">
							<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-6 h-6 relative overflow-hidden gap-2.5">
								<img src={collection.svg} />
							</div>
							<p className="flex-grow w-full text-sm font-medium text-left text-[#fcfcfc]">{collection.name}</p>
						</div>
					))}
				</div>
				<div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative">
					<p className="flex-grow-0 flex-shrink-0 w-[129px] h-4 text-xs font-medium text-left text-[#9898a6]">MY PLAYLISTS</p>
					{playlists.map((playlist, index) => (
						<div
							key={index + '-playlist'}
							onClick={() => {
								setIsOpen(false);
								router.push('/playlists/' + playlist.id);
							}}
							className="flex justify-start items-center flex-grow-0 flex-shrink-0 w-[216px] relative gap-2.5 p-3 rounded-lg cursor-pointer">
							<p className="flex-grow w-48 text-sm font-medium text-left text-[#fcfcfc] hover:text-gray-400">{playlist.name}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
