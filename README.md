# Submission interface frontend

Frontend for CSCs Sensitive Data Archive metadata submitter. [See backend for more info](https://github.com/CSCfi/metadata-submitter/)

## Install and run

Clone project and install dependencies with `npm install`.

Run frontend in development mode with `npm start`. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Tests

Run Jest-based tests with `npm test`. Check code formatting and style errors with `npm run lint:check` and fix them with `npm run lint`. Respectively for formatting errors in json/yaml/css/md -files, use `npm run format:check` or `npm run format`. We're following recommended settings from eslint, react and prettier -packages with couple exceptions, which you can find in `.eslintrc` and `.prettierrc`.

Linting, formatting and testing are also configured for you as a git pre-commit, which is recommended to use to avoid fails on CI pipeline.

## Building

Running `npm run build` builds the app for production to the `build` folder.

## License

Metadata submission interface is released under `MIT`, see [LICENSE](LICENSE).

## Contributing

If you want to contribute to a project and make it better, your help is very welcome. For more info about how to contribute, see [CONTRIBUTING](CONTRIBUTING).
