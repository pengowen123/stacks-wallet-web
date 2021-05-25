const { compilerOptions } = require('./tsconfig');
const pathNames = {};
Object.keys(compilerOptions.paths).forEach(key => {
  const [path] = compilerOptions.paths[key];
  if (key.includes('/ui')) {
    return;
  }
  if (path.startsWith('../')) {
    pathNames[key] = `<rootDir>/${path.slice(3)}`;
    return;
  } else {
    pathNames[key.replace(/\*/g, '(.*)')] = `<rootDir>/src/${path.replace(/\*/g, '$1')}`;
  }
});

module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  globals: {
    'ts-jest': {
      diagnostics: false,
      tsconfig: '<rootDir>/tests/tsconfig.json',
    },
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node', 'd.ts'],
  moduleNameMapper: pathNames,
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  preset: 'ts-jest',
  testRegex: '/tests/.*.test.tsx?$',
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
};
