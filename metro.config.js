const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase 10.x uses package.json `exports` to route to different builds.
// Metro's handling of this can pick the wrong (non-RN) build, causing
// "Component auth has not been registered yet". Disabling it forces Metro
// to use the React Native entry points correctly.
config.resolver.unstable_enablePackageExports = false;

// Firebase uses .cjs files for some modules — Metro needs to know about them.
config.resolver.sourceExts.push("cjs");

module.exports = config;
