import { ReactNode } from 'react';
import React from 'react';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootLayout({ children }: { children: ReactNode }) {
	const user = await getUser();
	console.log('RootLayoutUser:', user);
	if (!user) redirect('/login');

	return <main>{children}</main>;
}
