import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'standalone',
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'images.unsplash.com' },
			{ protocol: 'https', hostname: 'i.scdn.co' },
			{ protocol: 'https', hostname: 'mosaic.scdn.co' },
			{ protocol: 'https', hostname: 'image-cdn-ak.spotifycdn.com' },
		],
	},
};

export default nextConfig;
