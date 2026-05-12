/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.clerk.com",
            }
        ]
    },
    experimental: {
        serverComponentsExternalPackages: ["natural"]
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
