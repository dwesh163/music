import { useRouter } from 'next/router';
import React, { useState, useRef, useEffect } from 'react';

export default function Player({ isStarted, setIsStarted }) {
	const [isLoading, setIsLoading] = useState(true);
	const [currentTime, setCurrentTime] = useState(0);
	const [audioData, setAudioData] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [songId, setSongId] = useState('');
	const [onLoad, setOnLoad] = useState(false);
	const [isNewSong, setIsNewSong] = useState(true);
	const [loop, setLoop] = useState(false);
	const [isFirst, setIsFirst] = useState(true);
	const audioRef = useRef();
	const progressRef = useRef();

	const router = useRouter();

	const playHandler = () => {
		audioRef.current.play();
		setIsPlaying(true);
	};

	const pauseHandler = () => {
		audioRef.current.pause();
		setIsPlaying(false);
	};

	const fetchAudioData = async (songId) => {
		setIsLoading(true);
		if (songId == '') {
			return;
		}
		try {
			const response = await fetch(`/api/tracks/${songId}/info`);
			const audioData = await response.json();
			if (audioData.error) {
				setAudioData({
					track: { src: ' ' },
					album: { image: '' },
					artists: [{ name: '' }],
				});
			} else {
				setAudioData(audioData);
				setIsLoading(false);
				const songData = JSON.parse(localStorage.getItem('songData'));
				if (isStarted || songData?.status == 'play') {
					setIsPlaying(true);
					setTimeout(() => {
						audioRef.current.play();
					}, 200);
				}
			}
		} catch (error) {
			console.error('Error fetching audio data:', error);
		}
	};

	useEffect(() => {
		if (audioData == null || audioData.error) return;

		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: audioData.track.name,
				artist: audioData.artists[0].name,
				album: audioData.album.name,
				artwork: [
					{ src: audioData.album.image, sizes: '640x640', type: 'image/png' },
					{ src: audioData.album.image, sizes: '(max-width: 96px) 96px, (max-width: 128px) 128px, (max-width: 192px) 192px, (max-width: 256px) 256px, (max-width: 384px) 384px, (max-width: 512px) 512px, 640px, 128px', type: 'image/png' }, // Taille par défaut de 128px
				],
			});

			navigator.mediaSession.setActionHandler('play', playHandler);
			navigator.mediaSession.setActionHandler('pause', pauseHandler);
			navigator.mediaSession.setActionHandler('stop', pauseHandler);
			navigator.mediaSession.setActionHandler('nexttrack', () => nextSong(setSongId));
			navigator.mediaSession.setActionHandler('previoustrack', () => prevSong(setSongId));
		}
	}, [audioData]);

	useEffect(() => {
		let songData = JSON.parse(localStorage.getItem('songData'));
		if (songData) {
			songData.status = 'pause';
			localStorage.setItem('songData', JSON.stringify(songData));
			setIsPlaying(false);
		}
	}, []);

	useEffect(() => {
		const songData = JSON.parse(localStorage.getItem('songData'));
		setCurrentTime(parseFloat(localStorage.getItem('currentTime')));
		if (songData?.songId) {
			setSongId(songData.songId);
			fetchAudioData(songData.songId);
			setIsStarted(false);
			setIsNewSong(true);
		}
	}, [isStarted]);

	const togglePlay = () => {
		if (audioData.track.src == ' ') {
			return;
		}
		if (isPlaying) {
			audioRef.current.pause();
			let songData = JSON.parse(localStorage.getItem('songData'));
			songData.status = 'pause';

			localStorage.setItem('songData', JSON.stringify(songData));
		} else {
			let songData = JSON.parse(localStorage.getItem('songData'));
			songData.status = 'play';
			localStorage.setItem('songData', JSON.stringify(songData));
			audioRef.current.play();
		}
		setIsPlaying(!isPlaying);
	};

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			if (isNewSong) {
				audioRef.current.currentTime = currentTime;
				setIsNewSong(false);
			}
			setCurrentTime(audioRef.current.currentTime);
			localStorage.setItem('currentTime', currentTime);
		}
	};

	const handleProgressClick = (e) => {
		const clickedPosition = e.nativeEvent.clientX - progressRef.current.getBoundingClientRect().left;
		const newTime = (clickedPosition / progressRef.current.offsetWidth) * audioRef.current.duration;
		setCurrentTime(newTime);
		if (audioRef.current) audioRef.current.currentTime = newTime;
	};

	const nextSong = async (setSongId) => {
		let songData = JSON.parse(localStorage.getItem('songData'));

		if (!songData?.playlist?.list) {
			setSongId('');
			setCurrentTime(0);
			return;
		}

		const currentIndex = songData.playlist.currentIndex || 0;
		let nextIndex = currentIndex + 1;

		if (nextIndex >= songData.playlist.list.length) {
			if (loop) {
				nextIndex = 0;
			} else {
				setSongId('');
				setCurrentTime(0);
				return;
			}
		}

		const nextSongId = songData.playlist.list[nextIndex];

		setSongId(nextSongId);
		setCurrentTime(0);
		fetchAudioData(nextSongId);
		if (songData.playlist.list[nextIndex + 1]) {
			fetch('/api/tracks/', { method: 'POST', body: JSON.stringify({ spotifyId: songData.playlist.list[nextIndex + 1] }) });
		}

		songData.songId = nextSongId;

		songData.playlist.currentIndex = nextIndex;
		localStorage.setItem('songData', JSON.stringify(songData));
	};

	const prevSong = async (setSongId) => {
		let songData = JSON.parse(localStorage.getItem('songData'));

		if (!songData?.playlist?.list) {
			setSongId('');
			setCurrentTime(0);
			return;
		}

		const currentIndex = songData.playlist.currentIndex || 0;
		const prevIndex = currentIndex - 1;

		if (prevIndex < 0) {
			setSongId('');
			setCurrentTime(0);
			return;
		}

		const prevSongId = songData.playlist.list[prevIndex];

		setSongId(prevSongId);
		setCurrentTime(0);
		fetchAudioData(prevSongId);

		if (songData.playlist.list[prevSongId - 1]) {
			fetch('/api/tracks/', { method: 'POST', body: JSON.stringify({ spotifyId: songData.playlist.list[prevSongId - 1] }) });
		}

		songData.songId = prevSongId;

		songData.playlist.currentIndex = prevIndex;
		localStorage.setItem('songData', JSON.stringify(songData));
	};

	const Like = async (likedSongId) => {
		if (!likedSongId) {
			return;
		}
		const fetchLikedPlaylist = async () => {
			try {
				const response = await fetch('/api/playlist');
				const playlistsData = await response.json();
				const likedPlaylist = playlistsData.filter((playlist) => playlist.name === 'Liked')[0];

				return likedPlaylist;
			} catch (error) {
				console.error('Error fetching liked playlist:', error);
			}
		};

		const playlistData = await fetchLikedPlaylist();

		const response = await fetch('/api/playlist/' + playlistData.id, { method: audioData.track.isLiked ? 'DELETE' : 'POST', body: JSON.stringify({ songId: likedSongId }) });
		const data = await response.json();

		if (data.status == 'ok') {
			setAudioData((prevAudioData) => ({
				...prevAudioData,
				track: {
					...prevAudioData.track,
					isLiked: true,
				},
			}));
		}

		if (data.status == 'remove') {
			setAudioData((prevAudioData) => ({
				...prevAudioData,
				track: {
					...prevAudioData.track,
					isLiked: false,
				},
			}));
		}
	};

	return (
		<div className="flex justify-start items-center w-full absolute left-0 top-[calc(100vh-100px)] overflow-hidden md:gap-28 px-4 py-3.5 bg-[#1f1f22] z-20 shadow-2xl">
			<div className="hidden sm:flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative overflow-hidden gap-4 w-72">
				<audio ref={audioRef} src={audioData ? audioData.track.src : ''} onTimeUpdate={handleTimeUpdate} onEnded={() => nextSong(setSongId)}></audio>
				<img src={audioData ? audioData.album.image : ''} className="flex-grow-0 flex-shrink-0 w-16 h-[65px] object-cover mt-2" />
				<div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative gap-1.5 overflow-visible">
					<div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
						<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">{audioData ? audioData.track.name.slice(0, 18) : ''}</p>
						<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5 cursor-pointer" onClick={() => Like(songId)}>
							<svg width="16" height="17" viewBox="0 0 16 17" fill={audioData?.track.isLiked ? '#fff' : 'none'} xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
								<path d="M2.30001 8.96658C1.00001 7.56658 1.00001 5.29991 2.30001 3.89991C2.96668 3.16658 3.80001 2.83325 4.66668 2.83325C5.33335 2.83325 6.03334 3.06658 6.60001 3.49991C6.83334 3.69991 7.03335 3.93325 7.23335 4.16658L8.03335 5.23325L8.83334 4.16658C9.03334 3.89991 9.23334 3.66658 9.46668 3.49991C10 3.03325 10.6667 2.83325 11.3667 2.83325C12.2 2.83325 13.0667 3.16658 13.7 3.89991C15 5.29991 15 7.56658 13.7 8.96658L8.46668 14.2999C8.23334 14.5666 7.80001 14.5666 7.56668 14.2999L2.30001 8.96658Z" stroke="#FCFCFC" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
							</svg>
						</div>
						<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5">
							<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
								<path d="M4.16666 8.5C4.16666 8.77614 3.9428 9 3.66666 9C3.39051 9 3.16666 8.77614 3.16666 8.5C3.16666 8.22386 3.39051 8 3.66666 8C3.9428 8 4.16666 8.22386 4.16666 8.5Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M8.5 8.5C8.5 8.77614 8.27614 9 8 9C7.72386 9 7.5 8.77614 7.5 8.5C7.5 8.22386 7.72386 8 8 8C8.27614 8 8.5 8.22386 8.5 8.5Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M12.8333 8.5C12.8333 8.77614 12.6095 9 12.3333 9C12.0572 9 11.8333 8.77614 11.8333 8.5C11.8333 8.22386 12.0572 8 12.3333 8C12.6095 8 12.8333 8.22386 12.8333 8.5Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
							</svg>
						</div>
					</div>
					{audioData ? (
						<>
							<p className="flex gap-1 text-sm font-semibold text-left text-[#fcfcfc]/[0.65] flex gap-1">
								{audioData.artists.slice(0, 2).map((item, index) => (
									<span key={index} className="cursor-pointer" onClick={() => router.push('/artists/' + item.id)}>
										{item.name}
										{index !== audioData.artists.length - 1 && <span>,</span>}
									</span>
								))}
								{audioData.artists.length > 2 && <span onClick={() => router.push('/artists')}>{` ${audioData.artists.length - 2} other${audioData.artists.length > 3 ? 's' : ''}`}</span>}
							</p>
							<p className="flex-grow-0 flex-shrink-0 w-[139px] h-3 text-[10px] font-semibold text-left uppercase text-[#fcfcfc]/[0.65]">PLAING FROM: {JSON.parse(localStorage.getItem('songData'))?.playlist?.name}</p>
						</>
					) : (
						<p className="flex gap-2 text-sm font-semibold text-left text-[#fcfcfc]/[0.65]">Loading</p>
					)}
				</div>
			</div>
			<div className="flex flex-col justify-center items-center flex-grow overflow-hidden gap-1 md:px-8 w-24">
				{audioData ? (
					<div className="flex justify-start sm:hidden items-center flex-grow-0 flex-shrink-0 relative gap-1 sm:mb-0 mb-1">
						<p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-[#fcfcfc]">{audioData.track.name}</p>
						<p className="flex gap-0.5 text-sm font-semibold text-left text-[#fcfcfc]/[0.65] flex gap-1">
							{audioData?.artists?.slice(0, 2).map((item, index) => (
								<span key={index} className="font-normal cursor-pointer" onClick={() => router.push('/artists/' + item.id)}>
									{item.name}
									{index !== audioData.artists.length - 1 && <span>,</span>}
								</span>
							))}
							{audioData?.artists?.length > 2 && <span className="font-normal">{`${audioData.artists.length - 2} other${audioData.artists.length > 3 ? 's' : ''}`}</span>}
						</p>
						<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 ml-1 relative overflow-hidden gap-2.5 cursor-pointer" onClick={() => Like(songId)}>
							<svg width="16" height="17" viewBox="0 0 16 17" fill={audioData?.track.isLiked ? '#fff' : 'none'} xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
								<path d="M2.30001 8.96658C1.00001 7.56658 1.00001 5.29991 2.30001 3.89991C2.96668 3.16658 3.80001 2.83325 4.66668 2.83325C5.33335 2.83325 6.03334 3.06658 6.60001 3.49991C6.83334 3.69991 7.03335 3.93325 7.23335 4.16658L8.03335 5.23325L8.83334 4.16658C9.03334 3.89991 9.23334 3.66658 9.46668 3.49991C10 3.03325 10.6667 2.83325 11.3667 2.83325C12.2 2.83325 13.0667 3.16658 13.7 3.89991C15 5.29991 15 7.56658 13.7 8.96658L8.46668 14.2999C8.23334 14.5666 7.80001 14.5666 7.56668 14.2999L2.30001 8.96658Z" stroke="#FCFCFC" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
							</svg>
						</div>
						<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5 ml-1">
							<svg width="16" height="17" viewBox="0 0 16 17" fill="#fff" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
								<path d="M4.16666 8.5C4.16666 8.77614 3.9428 9 3.66666 9C3.39051 9 3.16666 8.77614 3.16666 8.5C3.16666 8.22386 3.39051 8 3.66666 8C3.9428 8 4.16666 8.22386 4.16666 8.5Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M8.5 8.5C8.5 8.77614 8.27614 9 8 9C7.72386 9 7.5 8.77614 7.5 8.5C7.5 8.22386 7.72386 8 8 8C8.27614 8 8.5 8.22386 8.5 8.5Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M12.8333 8.5C12.8333 8.77614 12.6095 9 12.3333 9C12.0572 9 11.8333 8.77614 11.8333 8.5C11.8333 8.22386 12.0572 8 12.3333 8C12.6095 8 12.8333 8.22386 12.8333 8.5Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
							</svg>
						</div>
					</div>
				) : (
					<></>
				)}

				<div className="flex justify-center items-center flex-grow-0 flex-shrink-0 overflow-hidden gap-8">
					<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5">
						<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
							<path d="M15.2562 4.35569L15.2671 4.36659L15.2752 4.3747L15.3003 4.39987L15.3336 4.43317L15.3502 4.44976L15.4 4.49969L15.2562 4.35569ZM15.2562 4.35569L15.315 4.33491L15.2562 4.35569ZM15.2556 4.35502L15.3161 4.33386L15.3932 4.30686L15.4 4.30448L15.413 4.29992L15.2556 4.35502ZM15.2556 4.35502L15.2169 4.31632L15.2006 4.29992L15.1801 4.2794L15.1787 4.28073C15.1755 4.28394 15.1684 4.29095 15.1598 4.29992C15.1516 4.30845 15.142 4.31876 15.133 4.32926C15.1248 4.33873 15.1146 4.35119 15.1034 4.36659C15.0924 4.38169 15.0806 4.39962 15.0689 4.42034M15.2556 4.35502L15.0689 4.42034M15.0689 4.42034L15.04 4.43047C15.0378 4.41803 15.0363 4.40664 15.0353 4.39654C15.0341 4.3846 15.0336 4.3733 15.0334 4.36659C15.0333 4.36286 15.0333 4.36055 15.0333 4.36032C15.0333 4.36009 15.0333 4.36195 15.0333 4.36659V4.43281L15.0255 4.43553C15.0104 4.39239 15.0046 4.35513 15.0021 4.33116C15.0015 4.32529 15.0011 4.32022 15.0008 4.31605C15.0003 4.30889 15.0001 4.30317 15.0001 4.29992C15 4.29858 15 4.29766 15 4.29723L15 4.29634C15 4.29634 15 4.29722 15 4.29992V4.33325V4.40484C14.993 4.38734 14.987 4.36939 14.9821 4.35111C14.972 4.31293 14.9667 4.2733 14.9667 4.23325V4.33962C14.9509 4.30055 14.9435 4.26671 14.9396 4.24356C14.9369 4.22757 14.9354 4.21314 14.9345 4.20076C14.9341 4.19449 14.9338 4.18851 14.9336 4.18285L14.9334 4.17454L14.9333 4.17052L14.9333 4.16853L14.9333 4.16755L14.9333 4.16728L15.0689 4.42034ZM13.5536 5.52014L14.4071 4.66659H13.2H11.3C10.4672 4.66659 9.63449 5.11716 9.20592 5.84038L5.77886 11.3303C5.23124 12.1632 4.35152 12.6666 3.36667 12.6666H2.16667C2.07614 12.6666 2 12.5904 2 12.4999C2 12.4094 2.07614 12.3333 2.16667 12.3333H3.36667C4.22936 12.3333 5.02886 11.9189 5.49198 11.1628L8.92113 5.66952C9.46874 4.83664 10.3485 4.33325 11.3333 4.33325H13.2333H14.4404L13.5869 3.4797L12.7202 2.61303L12.3667 2.96659L12.7202 2.61303C12.6777 2.57047 12.6667 2.5298 12.6667 2.49992C12.6667 2.47003 12.6777 2.42936 12.7202 2.38681L12.3667 2.03325L12.7202 2.38681C12.7628 2.34425 12.8034 2.33325 12.8333 2.33325C12.8632 2.33325 12.9039 2.34425 12.9464 2.38681L14.9464 4.38681L14.9667 4.40703V4.44062L15 4.47389V4.50703L15.0168 4.52381C15.012 4.53421 15.0073 4.54514 15.0029 4.5566L14.9464 4.61303L12.9464 6.61303C12.9039 6.65559 12.8632 6.66659 12.8333 6.66659C12.8109 6.66659 12.7589 6.66004 12.6711 6.59567C12.6415 6.55953 12.6333 6.52571 12.6333 6.49992C12.6333 6.47003 12.6443 6.42936 12.6869 6.38681L13.5536 5.52014ZM15.0261 4.43711L15.0333 4.43455L15.0318 4.45235C15.0298 4.4474 15.0279 4.44232 15.0261 4.43711ZM15.0403 4.43208L15.0678 4.42235C15.0608 4.43506 15.0538 4.4488 15.0472 4.46357C15.0444 4.45251 15.0421 4.44197 15.0403 4.43208ZM5.37077 5.65708C4.89665 5.01542 4.15826 4.66659 3.36667 4.66659H2.16667C2.09198 4.66659 2 4.60656 2 4.46659C2 4.37607 2.07614 4.29993 2.16667 4.29993H3.36667C4.22424 4.29993 5.01614 4.68107 5.56273 5.35315L5.37077 5.65708ZM14.9333 12.4404V12.6261L12.9464 14.613C12.9039 14.6556 12.8632 14.6666 12.8333 14.6666C12.8109 14.6666 12.7589 14.66 12.6711 14.5957C12.6415 14.5595 12.6333 14.5257 12.6333 14.4999C12.6333 14.47 12.6443 14.4294 12.6869 14.3868L13.5536 13.5201L14.4071 12.6666H13.2H11.3C10.4446 12.6666 9.65461 12.2874 9.10817 11.6186L9.3199 11.2967C9.79364 11.9465 10.5365 12.2999 11.3333 12.2999H13.2333H14.4404L13.5869 11.4464L12.7202 10.5797C12.6777 10.5371 12.6667 10.4965 12.6667 10.4666C12.6667 10.4367 12.6777 10.396 12.7202 10.3535C12.7628 10.3109 12.8034 10.2999 12.8333 10.2999C12.8632 10.2999 12.9039 10.3109 12.9464 10.3535L14.9333 12.3404V12.4404Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
						</svg>
					</div>
					<div onClick={() => prevSong(setSongId)} className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5">
						<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
							<path d="M4.66667 9.35662V14.8333C4.66667 14.9239 4.59053 15 4.5 15H2.5C2.40948 15 2.33334 14.9239 2.33334 14.8333V2.16667C2.33334 2.07614 2.40948 2 2.5 2H4.5C4.59053 2 4.66667 2.07614 4.66667 2.16667V7.61005V8.04853V8.91813V9.35662ZM5.53919 8.58462L5.44851 8.48333L5.53919 8.38204C5.54895 8.37114 5.56137 8.36001 5.57725 8.34943L5.57727 8.34945L5.58201 8.34622L14.4153 2.31288L14.427 2.30492L14.4382 2.29631C14.4678 2.27354 14.4913 2.26783 14.5087 2.26674C14.5285 2.26551 14.5527 2.26985 14.5781 2.28334C14.6301 2.31093 14.6667 2.36413 14.6667 2.43333V14.5667C14.6667 14.6359 14.6301 14.6891 14.5781 14.7167C14.5527 14.7301 14.5285 14.7345 14.5087 14.7333C14.4913 14.7322 14.4678 14.7265 14.4382 14.7037L14.4275 14.6955L14.4164 14.6878L5.58307 8.62118L5.5831 8.62114L5.57725 8.61724C5.56137 8.60666 5.54895 8.59553 5.53919 8.58462Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
						</svg>
					</div>
					<div onClick={togglePlay} className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-6 h-6 relative overflow-hidden gap-2.5">
						{isPlaying ? (
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-[17px] mx-auto">
								<path fill="#ffffff" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" />
							</svg>
						) : (
							<svg width="25" height="25" viewBox="0 0 25 25" fill="#fff" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
								<path d="M6.76693 21.9879L6.75583 21.9956L6.74514 22.0038C6.45991 22.2232 6 22.0313 6 21.6001V3.40009C6 2.96889 6.45991 2.77699 6.74514 2.99641L6.75634 3.00501L6.76799 3.01298L20.018 12.063L20.018 12.063L20.0226 12.0661C20.3258 12.2682 20.3258 12.682 20.0226 12.8841L20.0226 12.884L20.0169 12.8879L6.76693 21.9879Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
							</svg>
						)}
					</div>
					<div onClick={() => nextSong(setSongId)} className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5">
						<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
							<path d="M11.4607 8.38191L11.5514 8.48333L11.4607 8.58475C11.4511 8.5955 11.4387 8.60661 11.4228 8.61723L11.4227 8.61719L11.4169 8.62118L2.5836 14.6878L2.57249 14.6955L2.56181 14.7037C2.53221 14.7265 2.50874 14.7322 2.49134 14.7333C2.47152 14.7345 2.44728 14.7301 2.42185 14.7167C2.36986 14.6891 2.33333 14.6359 2.33333 14.5667V2.43333C2.33333 2.36413 2.36986 2.31093 2.42185 2.28334C2.44728 2.26985 2.47152 2.26551 2.49134 2.26674C2.50874 2.26783 2.53221 2.27354 2.56181 2.29631L2.573 2.30492L2.58465 2.31288L11.418 8.34622L11.418 8.34624L11.4228 8.34944C11.4387 8.36006 11.4511 8.37117 11.4607 8.38191ZM12.3333 8.04853V7.60937V2.16667C12.3333 2.07614 12.4095 2 12.5 2H14.5C14.5905 2 14.6667 2.07614 14.6667 2.16667V14.8333C14.6667 14.9239 14.5905 15 14.5 15H12.5C12.4095 15 12.3333 14.9239 12.3333 14.8333V9.35731V8.91813V8.04853Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
						</svg>
					</div>
					<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-3 h-3 relative overflow-hidden gap-2.5 cursor-pointer" onClick={() => setLoop(!loop)}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
							<path fill={loop ? '#fff' : '#99999a'} d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96H320v32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32V64H160C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96H192V352c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V448H352c88.4 0 160-71.6 160-160z" />
						</svg>
					</div>
				</div>
				<div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative overflow-hidden gap-8">
					<p className="flex-grow-0 flex-shrink-0 text-xs font-semibold text-center text-white">
						{currentTime
							? `${Math.floor(currentTime / 60)
									.toString()
									.padStart(2, '0')}:${(currentTime % 60).toString().split('.')[0].padStart(2, '0')}`
							: '00:00'}
					</p>

					<div onClick={handleProgressClick} ref={progressRef} className="flex-grow w-[515px] h-6 flex justify-center align-center relative overflow-hidden pt-[0.70rem] sm:pt-[0.65rem]">
						<div className="flex-grow w-full h-1 relative overflow-hidden rounded-[999px] bg-[#4c4e54]">
							<div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: audioData ? `${(currentTime / audioData.track.duration) * 100}%` : '0' }}></div>
						</div>
					</div>

					<p className="flex-grow-0 flex-shrink-0 text-xs font-semibold text-center text-white">
						{audioData
							? `${Math.floor(audioData.track.duration / 60)
									.toString()
									.padStart(2, '0')}:${(audioData.track.duration % 60).toString().padStart(2, '0')}`
							: '00:00'}
					</p>
				</div>
			</div>
			<div className="hidden sm:flex justify-end items-center flex-grow-0 flex-shrink-0 relative overflow-hidden gap-8 px-8">
				<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0 w-6 h-6 relative" preserveAspectRatio="none">
					<path d="M16.7334 8.06302L16.7334 8.06305C16.5196 8.23792 16.4881 8.55294 16.663 8.76665C17.494 9.78227 18 11.0717 18 12.5C18 13.9324 17.4913 15.271 16.663 16.2834C16.4882 16.4971 16.5196 16.8121 16.7334 16.987C16.947 17.1618 17.262 17.1304 17.437 16.9167L16.7334 8.06302ZM16.7334 8.06302C16.9471 7.88821 17.2621 7.91964 17.4371 8.13344M16.7334 8.06302L17.4371 8.13344M17.4371 8.13344C18.4061 9.31789 19 10.8285 19 12.5M17.4371 8.13344L19 12.5M19 12.5C19 14.1675 18.4087 15.7289 17.4371 16.9166L19 12.5ZM13.726 3.05399L13.726 3.05401C13.8941 3.13918 14 3.31156 14 3.50001V21.5C14 21.6884 13.8941 21.8609 13.7261 21.946L13.726 21.946C13.5579 22.0312 13.3562 22.0146 13.2043 21.9032L13.2043 21.9032L5.91974 16.5612L5.81203 16.4822L5.67927 16.4675L3.25182 16.1978L3.25183 16.1977L3.24542 16.1971C1.9291 16.068 1 14.9417 1 13.7V11.3C1 9.99161 1.99526 8.93056 3.24524 8.80299L3.24524 8.80301L3.2497 8.80252L5.67928 8.53257L5.81203 8.51782L5.91974 8.43883L13.2043 3.09681C13.3562 2.98537 13.558 2.96884 13.726 3.05399ZM13 5.47342V4.48671L12.2043 5.07021L6.29568 9.40321C6.2251 9.45497 6.14219 9.48728 6.05524 9.49694L6.05521 9.49694L3.35521 9.79694L3.35493 9.79698L3.3521 9.79729L3.34975 9.79753C2.60086 9.87241 2 10.5114 2 11.3V13.7C2 14.4606 2.57159 15.1273 3.34538 15.2021C3.34605 15.2021 3.34673 15.2022 3.34741 15.2023L3.35738 15.2033L6.05521 15.503L6.05529 15.5031C6.14212 15.5127 6.22503 15.545 6.29568 15.5968L12.2043 19.9298L13 20.5133V19.5266V5.47342ZM19.4117 5.03186L19.4117 5.03181C19.615 4.84502 19.9313 4.85834 20.1181 5.06169C21.9004 7.00114 23 9.62092 23 12.5C23 15.3791 21.9004 17.9988 20.1181 19.9383L20.1181 19.9383C19.9313 20.1417 19.615 20.155 19.4117 19.9682L19.4117 19.9681C19.2083 19.7813 19.195 19.465 19.3818 19.2618L19.3819 19.2617C20.9997 17.5012 22 15.1209 22 12.5C22 9.87911 20.9997 7.49889 19.3819 5.73832L19.0137 6.07663L19.3819 5.73831C19.195 5.53496 19.2084 5.21868 19.4117 5.03186Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
				</svg>
				<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-6 h-6 relative overflow-hidden gap-2.5">
					<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
						<path d="M3.4503 21H1.5V19.0497C2.48159 19.2478 3.25216 20.0184 3.4503 21Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
						<path d="M1.5 16.0225V15.0189C4.69459 15.2611 7.2389 17.8054 7.48112 21H6.47755C6.23956 18.3626 4.1374 16.2604 1.5 16.0225Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
						<path d="M1.5 12.0129V11.0117C6.89703 11.2649 11.235 15.595 11.4883 21H10.4871C10.2356 16.1518 6.3482 12.2644 1.5 12.0129Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
						<path d="M3 5H2.5V5.5V8H1.5V5.5C1.5 4.67614 2.17614 4 3 4H21C21.8239 4 22.5 4.67614 22.5 5.5V19.5C22.5 20.3239 21.8239 21 21 21H14.5V20H21H21.5V19.5V5.5V5H21H3Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
					</svg>
				</div>
				<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-6 h-6 relative overflow-hidden gap-2.5">
					<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
						<path d="M3 5.5H21H3Z" fill="#FCFCFC"></path>
						<path d="M3 5.5H21" stroke="#FCFCFC" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
						<g opacity="0.6">
							<path d="M3 19.5H21H3Z" fill="#FCFCFC"></path>
							<path d="M3 19.5H21" stroke="#FCFCFC" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
						</g>
						<g opacity="0.6">
							<path d="M3 12.5H21H3Z" fill="#FCFCFC"></path>
							<path d="M3 12.5H21" stroke="#FCFCFC" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
						</g>
					</svg>
				</div>
				<div className="flex justify-center items-center flex-grow-0 flex-shrink-0 p-3 rounded-lg bg-[#1f1f22] border border-[#ebebff]/5">
					<div className="flex justify-start items-start flex-grow-0 flex-shrink-0 w-4 h-4 relative overflow-hidden gap-2.5">
						<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="self-stretch flex-grow relative" preserveAspectRatio="none">
							<path d="M13.2 10.5L8.00001 5.30005L2.80001 10.5" stroke="#FCFCFC" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
}
