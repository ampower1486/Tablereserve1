import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        // The @next/eslint-plugin-next module has a missing file issue on Vercel
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
};

export default nextConfig;
