/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repoName = '/stock-market-next-day-prediction';

const nextConfig = {
  // Enforce static HTML/JS export
  output: 'export',

  // Handle GitHub Pages sub-path while keeping root path for local/Vercel
  basePath: isGithubPages ? repoName : '',
  assetPrefix: isGithubPages ? `${repoName}/` : undefined,

  // Unoptimized images required for static export without Node.js image optimization server
  images: {
    unoptimized: true,
  },
  
  // Generate index.html files inside folder paths for clean static hosting URLs
  trailingSlash: true,
};

export default nextConfig;
