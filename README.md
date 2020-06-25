# Submission interface frontend

[![Build Status](https://travis-ci.org/CSCfi/metadata-submitter-frontend.svg?branch=master)](https://travis-ci.org/CSCfi/metadata-submitter-frontend)
[![Coverage Status](https://coveralls.io/repos/github/CSCfi/metadata-submitter-frontend/badge.svg?branch=master)](https://coveralls.io/github/CSCfi/metadata-submitter-frontend?branch=master)

Frontend for CSCs Sensitive Data Archive metadata submitter. [See backend for more info](https://github.com/CSCfi/metadata-submitter/)

## Install and run

Requirements:

- Node 12+
- Optionally docker + docker-compose

For quick testing, go to the `development` folder and launch frontend with Docker by running `docker-compose up --build` (add `-d` flag to run container in the background). Frontend can then be found from `http://localhost:3000`.

If you want to use your local node setup, just install dependencies with `npm install` and run frontend in development mode with `npm start`.

If you also need backend for development, check out [backend repository](https://github.com/CSCfi/metadata-submitter/).

## Tests

Run Jest-based tests with `npm test`. Check code formatting and style errors with `npm run lint:check` and fix them with `npm run lint`. Respectively for formatting errors in json/yaml/css/md -files, use `npm run format:check` or `npm run format`. Possible type errors can be checked with `npm run flow`.

We're following recommended settings from eslint, react and prettier -packages with couple exceptions, which you can find in `.eslintrc` and `.prettierrc`. Linting, formatting and testing are also configured for you as a git pre-commit, which is recommended to use to avoid fails on CI pipeline.

## Building

Running `npm run build` builds the app for production to the `build` folder.

## License

Metadata submission interface is released under `MIT`, see [LICENSE](LICENSE).

## Contributing

If you want to contribute to a project and make it better, your help is very welcome. For more info about how to contribute, see [CONTRIBUTING](CONTRIBUTING.md).
