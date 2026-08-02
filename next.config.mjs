const repoName = "Track-app";
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGithubActions ? `/${repoName}` : "",
  assetPrefix: isGithubActions ? `/${repoName}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubActions ? `/${repoName}` : "",
  },
};

export default nextConfig;
