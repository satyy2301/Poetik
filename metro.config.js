const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
  resolver: {
    extraNodeModules: {
      src: path.resolve(__dirname, 'src'),
    },
    unstable_enableSymlinks: true,
    unstable_enablePackageExports: true,
    sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs'],
  },
  watchFolders: [path.resolve(__dirname, 'src')],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    minifierConfig: {
      keep_fnames: true,
      mangle: { keep_fnames: true },
    },
  },
};

module.exports = mergeConfig(defaultConfig, customConfig);
