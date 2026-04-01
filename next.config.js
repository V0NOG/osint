/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  experimental: {
    typedRoutes: false,
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
}

module.exports = nextConfig
