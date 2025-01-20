import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
export const dynamic = 'auto';
import '@/global.css';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Music',
	description: 'A simple music app',
	keywords: ['music', 'songs', 'albums', 'artists'],
	applicationName: 'Kooked Music',
};

type RootLayoutProps = any;

export default function RootLayout(props: RootLayoutProps) {
	const { children } = props;
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body className={inter.className}>
				{children}
			</body>
		</html>
	);
}
