/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  images: {
    domains: ['books.google.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    // Add path aliases
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    
    // Important: return the modified config
    return config;
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Enable SWC minification
  swcMinify: true,
  // Enable production browser source maps
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
};

module.exports = nextConfig;
