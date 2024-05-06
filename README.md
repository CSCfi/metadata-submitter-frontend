# Submission interface frontend

[![Unit tests and coverage](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/unittests.yml/badge.svg)](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/unittests.yml)
![Code style check](https://github.com/CSCfi/metadata-submitter-frontend/workflows/Code%20style%20check/badge.svg)
[![Static type checks](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/typechecks.yml/badge.svg)](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/typechecks.yml)
[![End-to-end tests](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/e2etests.yml/badge.svg)](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/e2etests.yml)
[![Coverage Status](https://coveralls.io/repos/github/CSCfi/metadata-submitter-frontend/badge.svg?branch=master)](https://coveralls.io/github/CSCfi/metadata-submitter-frontend?branch=master)

Frontend for CSCs Sensitive Data Archive metadata submitter. [See backend for more info](https://github.com/CSCfi/metadata-submitter/)

## Install and run

Requirements:

- Node 16+
- Optionally Docker + docker-compose
- Backend

Install backend from [backend repository](https://github.com/CSCfi/metadata-submitter/).

Install and run frontend either with:

- Docker by running `docker-compose --env-file .env.example up --build` (add `-d` flag to run container in the background).
  - By default, frontend tries to connect to docker-container running the backend. Feel free to modify `docker-compose.yml` if you want to use some other setup;
  - modify `.env.example` if there are other parameters that need to be set up.
- Local node setup by running `pnpm install` followed with `pnpm start`.
  - If `pnpm install` leaves corrupted package-lock.json, try to fix with `pnpm install --frozen-lockfile`

After installing and running, frontend can be found from `http://localhost:3000`.

## Tests

### Unit tests

Run Vitest- and React Testing Library-based tests with `pnpm test`. Check code formatting, TypeScript types and style errors with `pnpm run lint:check` and fix them with `pnpm run lint`. Respectively for formatting errors in json/yaml/css/md -files, use `pnpm run format:check` or `pnpm run format`.

### End-to-end tests

1. Copy env variables from `.env.example` to your `.env` file, these variables are needed to run some of the tests.

```bash
  cp .env.example .env
```

2. Make sure we have latest browser binaries and their dependencies which match the current playwright version

```bash
pnpm dlx playwright install --with-deps
```

OR if you have issue with your PATH

```bash
pnpm exec playwright install --with-deps
```

3. Run the tests in CLI:

```bash
  pnpm test:e2e
```

OR you can run the tests in UI mode:

```bash
  pnpm test:e2e:ui
```

> **Note**
>
> e2e tests running in UI mode could have different result from the CLI. So if you are running the tests in UI mode, it may worth checking how they run in CLI as well, since the tests in Gitlab will be running in CLI.

We're following recommended settings from eslint, react and prettier -packages with couple exceptions, which you can find in `.eslintrc` and `.prettierrc`. Linting, formatting and testing are also configured for you as a git pre-commit, which is recommended to use to avoid fails on CI pipeline.

## Building

Running `pnpm run build` builds the app for production to the `build` folder.

## Architecture

See [architecture](architecture.md).

## License

Metadata submission interface is released under `MIT`, see [LICENSE](LICENSE).

## Contributing

If you want to contribute to a project and make it better, your help is very welcome. For more info about how to contribute, see [CONTRIBUTING](CONTRIBUTING.md).
