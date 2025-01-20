'use client';

import LoginComponent from '@/components/auth/login';
import { Suspense } from 'react';

export default function LoginPage() {
	return (
		<Suspense fallback={<div></div>}>
			<LoginComponent />
		</Suspense>
	);
}
