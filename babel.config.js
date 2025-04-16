// Convert to CommonJS format to avoid 'module is not defined' error
export const presets = [
  ['@babel/preset-env', {
    targets: {
      node: 'current',
    },
  }],
];