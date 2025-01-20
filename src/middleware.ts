import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
	try {
		const forwardedFor = req.headers.get('x-forwarded-for');
		const clientIp = forwardedFor?.split(',')[0].trim() || '127.0.0.1';

		const token = await getToken({
			req,
			secret: process.env.NEXTAUTH_SECRET,
		});

		const url = new URL(req.url);

		const sanitizeRedirectUrl = (path: string): string => {
			if (!path.startsWith('/')) {
				return '/';
			}
			const blockedPaths = ['/api', '/_next', '/admin'];
			if (blockedPaths.some((blocked) => path.startsWith(blocked))) {
				return '/';
			}
			return path.replace(/[^\w\-\/\?\&\=]/g, '');
		};

		const createResponseWithHeaders = (response: NextResponse) => {
			response.headers.set('x-forwarded-for', clientIp || '127.0.0.1');
			return response;
		};

		if (['/login', '/register'].includes(url.pathname)) {
			const response = NextResponse.next();
			return createResponseWithHeaders(response);
		}

		if (!token) {
			const response = NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(sanitizeRedirectUrl(url.pathname))}`, req.url));
			return createResponseWithHeaders(response);
		}

		if (token.exp && (token.exp as number) < Date.now() / 1000) {
			const response = NextResponse.redirect(new URL('/login', req.url));
			return createResponseWithHeaders(response);
		}

		const response = NextResponse.next();
		return createResponseWithHeaders(response);
	} catch (error) {
		console.error('Middleware error', { error });
		return NextResponse.redirect(new URL('/login', req.url));
	}
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|error|favicon.ico|image).*)'],
};
