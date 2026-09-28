module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    overrides: [
      {
        // These packages ship pre-compiled JS with private class fields (#x syntax)
        // which hermes-stable cannot compile. Transform them to regular properties.
        // babel-preset-expo handles this for source files but skips pre-built node_modules.
        include: [
          /node_modules\/@tanstack\/query-core/,
          /node_modules\/react-native\/src\/private/,
          /node_modules\/react-native-worklets/,
        ],
        plugins: [
          ["@babel/plugin-transform-private-methods", { loose: true }],
          ["@babel/plugin-transform-class-properties", { loose: true }],
          ["@babel/plugin-transform-private-property-in-object", { loose: true }],
        ],
      },
    ],
  };
};
