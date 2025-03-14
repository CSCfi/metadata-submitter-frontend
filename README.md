# SD Submit UI

[![Unit tests and coverage](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/unittests.yml/badge.svg)](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/unittests.yml)
![Code style check](https://github.com/CSCfi/metadata-submitter-frontend/workflows/Code%20style%20check/badge.svg)
[![Static type checks](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/typechecks.yml/badge.svg)](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/typechecks.yml)
[![End-to-end tests](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/e2etests.yml/badge.svg)](https://github.com/CSCfi/metadata-submitter-frontend/actions/workflows/e2etests.yml)
[![Coverage Status](https://coveralls.io/repos/github/CSCfi/metadata-submitter-frontend/badge.svg?branch=master)](https://coveralls.io/github/CSCfi/metadata-submitter-frontend?branch=master)

SD Submit UI, also known as metadata submission frontend provides graphical user interface (GUI) for filling in and submitting metadata. This frontend repository is tightly coupled with backend repository called [SD Submit API](https://github.com/CSCfi/metadata-submitter/).

## 💻 Development

<details><summary>Click to expand</summary>

### Prerequisites

- Node 20+
- pnpm
- Backend

Install pnpm that suits your machine from [pnpm installation](https://pnpm.io/installation).

Install and run backend from [SD Submit API repository](https://github.com/CSCfi/metadata-submitter/).

### Running

After the backend is up and running, install and run frontend with:

```bash
pnpm install

pnpm start
```

If `pnpm install` leaves corrupted pnpm-lock.yaml, try to fix with `pnpm i --frozen-lockfile`.

After installing and running, frontend can be found from `http://localhost:3000`.

</details>

## 🛠️ Contributing

<details><summary>Click to expand</summary>

Development team members should check internal [contributing guidelines for Gitlab](https://gitlab.ci.csc.fi/groups/sds-dev/-/wikis/Guides/Contributing).

If you are not part of CSC and our development team, your help is nevertheless very welcome. Please see [contributing guidelines for Github](CONTRIBUTING.md).

</details>

## 🧪 Testing

<details><summary>Click to expand</summary>

### Code format check

You can find the rules for checking in `eslint.config.js` and `.prettierrc`. Linting, formatting and unit testing are also configured for you as a git pre-commit, which is recommended to use to avoid fails on CI pipeline.

- For checking code quality and fixing potential bugs:

```
pnpm run lint:check

pnpm run lint
```

- For checking code formats and fixing formatting errors in json/yaml/css/md -files:

```
pnpm run format:check

pnpm run format
```

### Unit tests

Unit tests and components are run by Vitest and React Testing Library using these commands:

- For watching real-time code changes:

```bash
pnpm test
```

- Without watching the code changes:

```bash
pnpm test:no-watch
```

- For a summary of test coverage:

```bash
pnpm test:coverage
```

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

</details>

## Deployment

<details><summary>Click to expand</summary>

To build the frontend for deployment, run:

```
pnpm run build
```

The static files are put in the `build` folder.

</details>

## 📜 Repository' structure

<details><summary>Click to expand</summary>

To have an overview of this repository, see [STRUCTURE](STRUCTURE.md).

</details>

## 📜 License

<details><summary>Click to expand</summary>

Metadata submission UI is released under `MIT`, see [LICENSE](LICENSE).

</details>
