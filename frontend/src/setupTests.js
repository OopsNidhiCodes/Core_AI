// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Configure fast-check for property-based testing
import fc from 'fast-check';

// Set default number of runs for property-based tests to 100 as specified in design
fc.configureGlobal({
  numRuns: 100,
  verbose: true
});

// Export fast-check for use in tests
global.fc = fc;