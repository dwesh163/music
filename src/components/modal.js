import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AddInPlaylist({ songData, isAddModalOpen, setIsAddModalOpen }) {
	const [playlists, setPlaylists] = useState([]);
	const [selectedPlaylist, setSelectedPlaylist] = useState('');

	console.log(songData);
	useEffect(() => {
		fetch('/api/playlist')
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((playlistsData) => {
				setPlaylists(playlistsData);
				setSelectedPlaylist(playlistsData[0].id);
			})
			.catch((error) => {
				console.error('Error fetching playlist data:', error);
			});
	}, []);

	const handlePlaylistChange = (event) => {
		setSelectedPlaylist(event.target.value);
	};

	const handleAddButtonClick = () => {
		console.log(songData.id);
		fetch('/api/tracks/', { method: 'POST', body: JSON.stringify({ spotifyId: songData.id }) })
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				fetch('/api/playlist/' + selectedPlaylist, { method: 'POST', body: JSON.stringify({ songId: data.id }) })
					.then((response) => {
						if (!response.ok) {
							throw new Error('Network response was not ok');
						}
						return response.json();
					})
					.then((data) => {
						console.log(data);
						if (data.status == 'ok') {
							setIsAddModalOpen(false);
						}
					})
					.catch((error) => {
						console.error('Error fetching playlist data:', error);
					});
			})
			.catch((error) => {
				console.error('Error fetching playlist data:', error);
			});
	};

	if (isAddModalOpen) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="fixed inset-0 z-[100] overflow-hidden">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div className="fixed inset-0 transition-opacity">
							<div className="absolute inset-0 bg-black opacity-75" onClick={() => setIsAddModalOpen(false)}></div>
						</div>
						<span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
						<div className="inline-block align-bottom bg-zinc-800 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-zinc-800 px-4 pt-5 pb-4">
								<label className="block uppercase tracking-wide text-white text-base font-bold mb-2" htmlFor="grid-first-name">
									Add {songData.name} in a Playlist
								</label>
							</div>
							<div className="flex px-4 gap-2">
								<img className="w-16 h-16 rounded" src={songData.album.images[0].url} alt={songData.album.album_name} />
								<div>
									<p className="text-white">{songData.name}</p>
									<p className="flex flex-wrap gap-1">
										{songData.artists.slice(0, 2).map((item, index) => (
											<span key={index}>
												<span className={'font-normal text-gray-100 cursor-pointer opacity-60'} onClick={() => router.push('/artists/' + item.id)}>
													{item.name}
													{index !== songData.artists.slice(0, 2).length - 1 && <span className="visble">,</span>}
												</span>
											</span>
										))}
									</p>
								</div>
							</div>
							<div className="px-4">
								<label htmlFor="playlists" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									Select an option
								</label>
								<select id="playlists" className="bg-zinc-700 text-gray-900 text-sm block w-full p-2.5 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" value={selectedPlaylist} onChange={handlePlaylistChange}>
									{playlists.map((item) => (
										<option key={item.id} value={item.id}>
											{item.name}
										</option>
									))}
								</select>
							</div>
							<div className="bg-zinc-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button onClick={handleAddButtonClick} className="cursor-pointer w-full inline-flex justify-center rounded-sm border border-transparent shadow-sm px-4 py-2 bg-[#00a5a5] text-base font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm">
									Add
								</button>
								<button onClick={() => setIsAddModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-sm shadow-sm px-4 py-2 bg-zinc-600 text-base font-medium text-white hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
