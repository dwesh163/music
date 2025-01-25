'use client';

import { Song } from '@/types/song';
import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';

type Panel = 'sidebar' | 'tracklist';

type PlaybackContextType = {
	isPlaying: boolean;
	currentTrack: Song | null;
	currentTime: number;
	duration: number;
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
	togglePlayPause: () => void;
	setIsPlaying: (isPlaying: boolean) => void;
	playTrack: (track: Song) => void;
	playNextTrack: () => void;
	playPreviousTrack: () => void;
	setCurrentTime: (time: number) => void;
	setDuration: (duration: number) => void;
	setPlaylist: (songs: Song[]) => void;
	audioRef: React.RefObject<HTMLAudioElement | null>;
	activePanel: Panel;
	setActivePanel: (panel: Panel) => void;
	registerPanelRef: (panel: Panel, ref: React.RefObject<HTMLElement>) => void;
	handleKeyNavigation: (e: React.KeyboardEvent, panel: Panel) => void;
};

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

function useKeyboardNavigation() {
	const [activePanel, setActivePanel] = useState<Panel>('sidebar');
	const panelRefs = useRef<Record<Panel, React.RefObject<HTMLElement> | null>>({
		sidebar: null,
		tracklist: null,
	});

	const registerPanelRef = useCallback((panel: Panel, ref: React.RefObject<HTMLElement>) => {
		panelRefs.current[panel] = ref;
	}, []);

	const handleKeyNavigation = useCallback((e: React.KeyboardEvent, panel: Panel) => {
		const currentRef = panelRefs.current[panel];
		if (!currentRef?.current) return;

		const items = Array.from(currentRef.current.querySelectorAll('[tabindex="0"]'));
		const currentIndex = items.indexOf(document.activeElement as HTMLElement);

		switch (e.key) {
			case 'ArrowDown':
			case 'j':
				e.preventDefault();
				const nextIndex = (currentIndex + 1) % items.length;
				(items[nextIndex] as HTMLElement).focus();
				break;
			case 'ArrowUp':
			case 'k':
				e.preventDefault();
				const prevIndex = (currentIndex - 1 + items.length) % items.length;
				(items[prevIndex] as HTMLElement).focus();
				break;
		}
	}, []);

	return { activePanel, setActivePanel, registerPanelRef, handleKeyNavigation };
}

export function PlaybackProvider({ children }: { children: ReactNode }) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [playlist, setPlaylist] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const audioRef = useRef<HTMLAudioElement>(null);

	const { activePanel, setActivePanel, registerPanelRef, handleKeyNavigation } = useKeyboardNavigation();

	const togglePlayPause = useCallback(() => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	}, [isPlaying]);

	const playTrack = useCallback(
		(track: Song) => {
			setCurrentTrack(track);
			setIsPlaying(true);
			setCurrentTime(0);
			if (audioRef.current) {
				audioRef.current.src = getAudioSrc(`/api/track/${track.id}/song`);
				audioRef.current.play();
			}
			setActivePanel('tracklist');
		},
		[setActivePanel]
	);

	const playNextTrack = useCallback(() => {
		if (currentTrack && playlist.length > 0) {
			const currentIndex = playlist.findIndex((track) => track.id === currentTrack.id);
			const nextIndex = (currentIndex + 1) % playlist.length;
			playTrack(playlist[nextIndex]);
		}
	}, [currentTrack, playlist, playTrack]);

	const playPreviousTrack = useCallback(() => {
		if (currentTrack && playlist.length > 0) {
			const currentIndex = playlist.findIndex((track) => track.id === currentTrack.id);
			const previousIndex = (currentIndex - 1 + playlist.length) % playlist.length;
			playTrack(playlist[previousIndex]);
		}
	}, [currentTrack, playlist, playTrack]);

	const getAudioSrc = (url: string) => {
		if (url.startsWith('file://')) {
			const filename = url.split('/').pop();
			return `/api/audio/${encodeURIComponent(filename || '')}`;
		}
		return url;
	};

	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if (e.key === ' ' && e.target === document.body) {
				e.preventDefault();
				togglePlayPause();
			} else if (e.key === '/') {
				e.preventDefault();
				const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement | null;
				searchInput?.focus();
			}
		};

		window.addEventListener('keydown', handleGlobalKeyDown);
		return () => window.removeEventListener('keydown', handleGlobalKeyDown);
	}, [togglePlayPause]);

	return (
		<PlaybackContext.Provider
			value={{
				isPlaying,
				currentTrack,
				currentTime,
				duration,
				isLoading,
				setIsLoading,
				togglePlayPause,
				setIsPlaying,
				playTrack,
				playNextTrack,
				playPreviousTrack,
				setCurrentTime,
				setDuration,
				setPlaylist,
				audioRef,
				activePanel,
				setActivePanel,
				registerPanelRef,
				handleKeyNavigation,
			}}>
			{children}
		</PlaybackContext.Provider>
	);
}

export function usePlayback() {
	const context = useContext(PlaybackContext);
	if (context === undefined) {
		throw new Error('usePlayback must be used within a PlaybackProvider');
	}
	return context;
}
