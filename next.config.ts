import type { NextConfig } from 'next';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'lapig-type';
const basePath = process.env.GITHUB_ACTIONS === 'true' ? `/${repositoryName}` : '';

const nextConfig: NextConfig = {
  agentRules: false,
  output: 'export',
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
