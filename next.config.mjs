/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: process.env.NODE_ENV === 'development' ? '.next_dev' : '.next',
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.clerk.com",
            }
        ]
    },
    experimental: {
        serverComponentsExternalPackages: ["natural"],
        serverActions: {
            bodySizeLimit: "10mb"
        }
    },
    async redirects() {
        return [
            {
                source: '/dashboard/marketplace',
                destination: '/',
                permanent: true,
            },
        ];
    }
};

export default nextConfig;
