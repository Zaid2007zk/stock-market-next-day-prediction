/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

// Auto-detect repository name from GitHub Actions env or fallback to tradex-pro
const detectedRepo = process.env.GITHUB_REPOSITORY 
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` 
  : '/tradex-pro';

const basePath = isGithubPages ? detectedRepo : '';

const nextConfig = {
  // Enforce static HTML/JS export
  output: 'export',

  // Handle GitHub Pages sub-path dynamically while keeping root for custom domain/Vercel
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,

  // Unoptimized images required for static export without Node.js image optimization server
  images: {
    unoptimized: true,
  },
  
  // Generate index.html files inside folder paths for clean static hosting URLs
  trailingSlash: true,
};

export default nextConfig;
