import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lucide-react ships one module per icon; this keeps named imports like
  // `import { Camera } from "lucide-react"` from pulling in more than the
  // icons actually used on each page — meaningful on an icon-heavy landing.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
