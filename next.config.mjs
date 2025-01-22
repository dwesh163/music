import withPWAInit from '@ducanh2912/next-pwa';
/** @type {import('next').NextConfig} */

const withPWA = withPWAInit({
	dest: 'public',
	reloadOnOnline: true,
	aggressiveFrontEndNavCaching: true,
});
const nextConfig = {
	output: 'standalone',
};

export default withPWA(nextConfig);
