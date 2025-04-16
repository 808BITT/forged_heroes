export const presets = [
  ['@babel/preset-env', {
    targets: {
      node: 'current',
    },
    modules: false, // Disable module transformation to handle both CommonJS and ESM
  }],
  '@babel/preset-react',
  '@babel/preset-typescript',
];
