/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enforce static HTML/JS export for Cloudflare Pages (₹0 hosting tier)
  output: 'export',
  
  // Unoptimized images required for static export without Node.js image optimization server
  images: {
    unoptimized: true,
  },
  
  // Generate index.html files inside folder paths for clean static hosting URLs
  trailingSlash: true,
};

export default nextConfig;
