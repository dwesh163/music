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
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const [newPlaylistName, setNewPlaylistName] = useState('');
	const [deletePlaylistId, setDeletePlaylistId] = useState({});

	const [error, setError] = useState('');

	const buttonRef = useRef(null);

	const [collections, setCollections] = useState([
		{ name: 'Playlists', svg: '/svg/playlists.svg', url: 'playlists' },
		// { name: 'Albums', svg: '/svg/albums.svg', url: 'albums' },
		{ name: 'Tracks', svg: '/svg/tracks.svg', url: 'tracks' },
		// { name: 'Artists', svg: '/svg/artists.svg', url: 'artists' },
	]);

		{ name: 'Whitelist', svg: '/svg/whitelist.svg', url: 'admin/whitelist' },

	const fetchPlaylist = async () => {
		try {
			const response = await fetch('/api/playlist');
			const playlistsData = await response.json();
			if (!playlistsData.error) {
				setPlaylists(playlistsData);
			}
		} catch (error) {
			console.error('Error fetching audio data:', error);
		}
	};

	useEffect(() => {
		setIsLoading(true);
		fetchPlaylist();
		setIsLoading(false);
	}, []);

	const openCreateModal = () => {
		setIsCreateModalOpen(true);
	};

	const closeCreateModal = () => {
		setError('');
		setNewPlaylistName('');
		setIsCreateModalOpen(false);
	};

	const openDeleteModal = (data) => {
		setDeletePlaylistId(data);
		setIsDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setIsDeleteModalOpen(false);
	};

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
		<div className="flex items-center justify-center h-screen">
			{isCreateModalOpen && (
				<div className="fixed inset-0 z-[100] overflow-hidden">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div className="fixed inset-0 transition-opacity">
							<div className="absolute inset-0 bg-black opacity-75" onClick={() => closeCreateModal()}></div>
						</div>
						<span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
						<div className="inline-block align-bottom bg-zinc-800 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-zinc-800 px-4 pt-5 pb-4">
								<div className="w-full">
									<div className="mt-3 text-center sm:mt-0 w-full">
										<div className="w-full px-3 mb-6 md:mb-0">
											<label className="block uppercase tracking-wide text-white text-base font-bold mb-2" for="grid-first-name">
												Create a Playlist
											</label>
											<input className={'appearance-none block w-full bg-zinc-700 text-white rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-zinc-600' + (error != '' && ' border border-red-500')} value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} id="grid-first-name" type="text" placeholder="Playlist name" />
											<p class="text-red-500 text-xs text-left">{error}</p>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-zinc-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									onClick={() => {
										const createPlaylist = async () => {
											try {
												const response = await fetch('/api/playlist', { method: 'POST', body: JSON.stringify({ playlistName: newPlaylistName }) });
												const playlistsData = await response.json();
												fetchPlaylist();
												if (playlistsData.error) {
													setError(playlistsData.error);
												} else {
													closeCreateModal();
												}
											} catch (error) {
												console.error('Error fetching audio data:', error);
											}
										};

										createPlaylist();
										setNewPlaylistName('');
									}}
									className="w-full inline-flex justify-center rounded-sm border border-transparent shadow-sm px-4 py-2 bg-[#00a5a5] text-base font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm">
									Create
								</button>
								<button onClick={closeCreateModal} className="mt-3 w-full inline-flex justify-center rounded-sm shadow-sm px-4 py-2 bg-zinc-600 text-base font-medium text-white hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{isDeleteModalOpen && (
				<div className="fixed inset-0 z-[100] overflow-hidden">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div className="fixed inset-0 transition-opacity">
							<div className="absolute inset-0 bg-black opacity-75" onClick={() => closeDeleteModal()}></div>
						</div>
						<span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
						<div className="inline-block align-bottom bg-zinc-800 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<button onClick={() => closeDeleteModal()} class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
								<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
								</svg>
								<span class="sr-only">Close modal</span>
							</button>
							<div class="p-4 md:p-5 text-center">
								<svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
								</svg>
								<h3 class="mb-5 sm:text-lg text-sm font-normal text-gray-500 dark:text-gray-400">
									Are you sure you want to delete the playlist
									<br /> <strong>{deletePlaylistId.name}</strong>
								</h3>
								<button
									onClick={() => {
										const deletePlaylist = async () => {
											try {
												const response = await fetch('/api/playlist', { method: 'DELETE', body: JSON.stringify({ playlistId: deletePlaylistId.id }) });
												const playlistsData = await response.json();
												fetchPlaylist();
												closeDeleteModal();
												setDeletePlaylistId({});
											} catch (error) {
												console.error('Error fetching audio data:', error);
											}
										};

										deletePlaylist();
									}}
									class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
									Yes, I'm sure
								</button>
								<button onClick={() => closeDeleteModal()} class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
									No, cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className={'sm:w-[216px] w-48 h-full left-0 top-0 sm:relative absolute z-50 sm:z-10 overflow-y-auto overflow-x-hidden' + (isOpen ? '' : ' sm:flex hidden')}>
				<div className="flex flex-col justify-start items-start w-full left-0 top-0 overflow-y-auto overflow-x-hidden gap-3 px-3 pt-4 pb-8 bg-[#212124] h-screen">
					<div className="flex justify-between items-center flex-grow-0 flex-shrink-0 w-full relative p-3 pb-0 rounded-lg">
						<div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative gap-2.5 rounded-[999px] bg-[#63676f]">
							{session?.user?.image ? (
								<img className="w-10 h-10 rounded-full" src={session.user.image} />
							) : (
								<p className="flex-grow-0 flex-shrink-0 w-8 h-8 text-8 pt-1 font-medium text-center text-[#cacad1]">
									{session?.user?.name
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
					{session?.user?.accessName == 'admin' && (
						<div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative">
							<p className="flex-grow-0 flex-shrink-0 w-[129px] h-4 text-xs font-medium text-left text-[#9898a6]">ADMIN</p>
							{admins.map((collection, index) => (
								<div key={index + '-collection'} onClick={() => router.push('/' + collection.url)} className="flex justify-start items-center cursor-pointer flex-grow-0 flex-shrink-0 w-full relative gap-2.5 p-3 rounded-lg hover:text-gray-400 hover:brightness-75">
									<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-6 h-6 relative overflow-hidden gap-2.5">
										<img src={collection.svg} />
									</div>
									<p className="flex-grow w-full text-sm font-medium text-left text-[#fcfcfc]">{collection.name}</p>
								</div>
							))}
						</div>
					)}
					<div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative">
						<div className="w-full flex justify-between">
							<p className="flex-grow-0 flex-shrink-0 h-4 text-xs font-medium text-left text-[#9898a6]">MY PLAYLISTS</p>
							<svg xmlns="http://www.w3.org/2000/svg" fill="#9898a6" className="w-3 h-3 mt-0.5 cursor-pointer" viewBox="0 0 448 512" onClick={openCreateModal}>
								<path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
							</svg>
						</div>
						{playlists.map((playlist, index) => (
							<div key={index + '-playlist'} className="flex w-full justify-between align-item group">
								<div
									onClick={() => {
										setIsOpen(false);
										router.push('/playlists/' + playlist.id);
									}}
									className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2.5 p-3 rounded-lg cursor-pointer">
									<p className="flex-grow w-24 text-sm font-medium text-left text-[#fcfcfc] group-hover:text-gray-400">{playlist.name}</p>
								</div>
								{playlist.name != 'Liked' && (
									<div className="select-none flex justify-center items-center group-hover:flex hidden">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-3 h-3 cursor-pointer" onClick={() => openDeleteModal(playlist)}>
											<path fill="#9898a6" d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
										</svg>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
