const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports resolution for Tailwind v4
config.resolver.unstable_enablePackageExports = true;

// Monorepo support: watch workspace packages
const monorepoPackages = {
  "@orderfood/common": path.resolve(__dirname, "../../packages/common"),
};

config.watchFolders = [path.resolve(__dirname, "../../packages/common")];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../../node_modules"),
];

module.exports = config;
