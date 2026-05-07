/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken'],
  },

  webpack: (config) => {
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'src/lib')
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'components')

    return config
  },
}

module.exports = nextConfig