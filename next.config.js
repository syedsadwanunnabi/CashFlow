'use strict';

const { withPlugins } = require('next-compose-plugins');

const nextConfig = {
  reactStrictMode: true,
  // Add more custom configurations if needed
};

module.exports = withPlugins([], nextConfig);