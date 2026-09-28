const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Firebase 10.x uses package.json `exports` to route to different builds.
// Metro's handling of this can pick the wrong (non-RN) build, causing
// "Component auth has not been registered yet". Disabling it forces Metro
// to use the React Native entry points correctly.
config.resolver.unstable_enablePackageExports = false;

// Firebase uses .cjs files for some modules — Metro needs to know about them.
config.resolver.sourceExts.push("cjs");

// Web shims — replace heavy native-only modules with lightweight stubs on web
// to prevent OOM crashes in Metro during bundling.
const webShims = {
  "lottie-react-native": path.resolve(
    __dirname,
    "src/components/lottie-shim.web.tsx"
  ),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && webShims[moduleName]) {
    return { filePath: webShims[moduleName], type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// By default Metro skips Babel transforms for node_modules.
// Some packages ship pre-compiled JS with private class fields (#x syntax)
// which hermes-stable cannot compile. Opt them back into Babel so private
// fields get downleveled before hermesc sees them.
config.transformer = config.transformer ?? {};
config.transformer.transformIgnorePatterns = [
  "node_modules/(?!(" +
    "react-native|" +
    "@react-native|" +
    "expo|" +
    "@expo|" +
    "@unimodules|" +
    "@tanstack/query-core|" +
    "react-native-worklets" +
    ")/)",
];

module.exports = config;
