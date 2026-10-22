module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // `react-native-worklets/plugin` MUST be listed last — it wraps the
    // worklet transform that Reanimated 4 relies on. Putting it after
    // every other plugin is the documented requirement; a plugin that
    // also rewrites the worklet payload has to run before it.
    //
    // Note for an RN-CLI reader: in a bare React Native app this
    // plugin lives in `babel.config.js` too, but the preset is
    // `module:@react-native/babel-preset` instead of
    // `babel-preset-expo`. Everything else about the Reanimated setup
    // is identical.
    plugins: ['react-native-worklets/plugin'],
  };
};
