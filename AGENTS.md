# Contributor Guide

This is a React Native/ expo app that runs on iOS, Android and web. Use react native components rather than web jsx.

## Testing Instructions

- From the package root you can call `yarn test:ci` and `yarn lint`. The commit should pass all tests and linting before you merge.
- Always run `npx tsc` before committing and ensure everything is passing
- Fix any test or type errors until the whole suite is green.
