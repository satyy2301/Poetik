const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Create a default configuration
const defaultConfig = getDefaultConfig(__dirname);

// Custom configuration
const customConfig = {
  resolver: {
    // Add 'src' to the list of directories Metro should look for modules
    extraNodeModules: {
      // This ensures all imports from 'src' work correctly
      src: path.resolve(__dirname, 'src'),
    },
    // Enable symlinks (optional but useful)
    unstable_enableSymlinks: true,
    // Enable package exports (optional)
    unstable_enablePackageExports: true,
  },
  watchFolders: [
    // Ensure Metro watches the src directory
    path.resolve(__dirname, 'src'),
  ],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(defaultConfig, customConfig);