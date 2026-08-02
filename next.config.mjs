const repoName = "Track-app";
// Deliberately not tied to the ambient GITHUB_ACTIONS env var: that variable
// is "true" in every job of every workflow run (lint, tests, build, ...), not
// just the one that produces the GitHub Pages artifact. Keying basePath off
// it made the E2E job's dev server 404 at "/" (it served under "/Track-app"
// instead), since GITHUB_ACTIONS is also true there. Only the Pages build
// step sets this dedicated flag.
const useGithubPagesBasePath = process.env.NEXT_PUBLIC_USE_PAGES_BASE_PATH === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: useGithubPagesBasePath ? `/${repoName}` : "",
  assetPrefix: useGithubPagesBasePath ? `/${repoName}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: useGithubPagesBasePath ? `/${repoName}` : "",
  },
};

export default nextConfig;
