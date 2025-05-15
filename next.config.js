/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server-side rendering enabled (removed 'export' to allow API routes)
  // Use basePath if you're not serving from root
  // basePath: '',
  // If you're deploying to GitHub Pages
  // assetPrefix: './',
  images: {
    domains: [],
  },
}

module.exports = nextConfig