const lint = require('mocha-eslint');

// Array of paths to lint
const paths = [
  '*.js',
  'api/*.js',
  'test/test-*.js',
  '!node_modules', // ignore node_modules, not our code.
];

const options = {
  formatter: 'stylish',
  alwaysWarn: true,
  strict: true,
  contextName: 'Test Code Quality - eslint'
};

// Run the tests
lint(paths, options);
