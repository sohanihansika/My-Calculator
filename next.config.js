/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },

  assetPrefix: './',
  basePath: '',

  experimental: {
    turbopack: false,
    optimizeFonts: false,   
    optimizeCss: false,    
  },
};

module.exports = nextConfig;
