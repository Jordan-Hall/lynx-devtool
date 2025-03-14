# Unit tests

You can run the unit tests with `npm run auto-unittest`.
Unit tests are written using [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/) and run with [Karma](https://karma-runner.github.io/latest/index.html) in a web browser.

## Running a subset of unit tests
If you want to run a specific (set of) unit test, you can use `it.only` or `describe.only` for those tests that you want to run.

```ts
describe.only('The test suite that you want to run', () => {
  it('A test that would run', () => {});
  it('Another test that would run', () => {});
});
```

```ts
describe('The test suite that you want to run', () => {
  it.only('A test that would run', () => {});
  it('A test that would not run', () => {});
});
```

## Obtaining code coverage

We can collect code coverage for the source code that is tested with unit tests.
You can run `COVERAGE=1 pnpm run auto-unittest` to obtain code coverage for the whole `front_end` folder.
However, there is some preprocessing overhead for collecting coverage.
You can use `COVERAGE_FOLDERS` to only preprocess specific folders for code coverage:

```bash
COVERAGE_FOLDERS='front_end/ui/components' pnpm run auto-unittest
COVERAGE_FOLDERS='front_end/{ui/components,core/common}' pnpm run auto-unittest
```

## Inspecting detailed errors

By default, the Karma testing output is terse, to avoid console output cluttering.
However, if you want to obtain detailed reporting of a failure you are investigating, you can use `--expanded-reporting`:

```bash
npm run auto-unittest -- --expanded-reporting
```
