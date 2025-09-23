/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'monaco-editor',
      'reactflow',
      'd3',
      'cytoscape'
    ]
  },
  images: {
    domains: ['huggingface.co', 'github.com'],
    unoptimized: false
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.ORCHESTRATOR_API_URL ? `${process.env.ORCHESTRATOR_API_URL}/api/:path*` : 'http://localhost:8000/api/:path*'
      }
    ]
  },
  webpack: (config, { dev, isServer }) => {
    // Monaco Editor configuration
    if (!isServer) {
      config.module.rules.push({
        test: /monaco-editor\/min\/vs\/language\/typescript\/typescript\.js$/,
        use: 'worker-loader'
      })
    }

    return config
  }
}

module.exports = nextConfig