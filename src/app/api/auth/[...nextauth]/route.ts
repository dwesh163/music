import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { NextRequest } from 'next/server';

async function auth(req: NextRequest) {
	return NextAuth(authOptions);
}

export { auth as GET, auth as POST };
