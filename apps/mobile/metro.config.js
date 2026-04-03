const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports resolution for Tailwind v4
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
