## How to contribute

If you're reading this, it means you saw something that is not right, you want to add a new feature or your manager asked you to contribute to this. In any case we are glad and it would be awesome if you can contribute.

### Testing

We have a handful of unit tests and integration tests. In our Git workflow unit tests are run on every Push and Pull Request, while integration tests run on every Pull Request.

We use [Cypress](https://www.cypress.io/) for e2e testing, which are run against the develop branch of [metadata-submitter backend](https://github.com/CSCfi/metadata-submitter).

### Submitting Issues

We have templates for submitting new issues, that you can fill out. For example if you found a bug, use the following [template to report a bug](https://github.com/CSCfi/metadata-submitter-frontend/issues/new?template=bug_report.md).

### Submitting changes

When you made some changes you are happy with please send a [GitHub Pull Request to metadata-submitter](https://github.com/CSCfi/metadata-submitter-frontend/pull/new/dev) to `develop` branch with a clear list of what you've done (read more about [pull requests](https://help.github.com/en/articles/about-pull-requests)). When you create that Pull Request, we will forever be in your debt if you include unit tests. For extra bonus points you can always use add some more integration tests.

Please follow our Git branches model and coding conventions (both below), and make sure all of your commits are atomic (preferably one feature per commit) and it is recommended a Pull Request addresses one functionality or fixes one bug.

Always write a clear log message for your commits, and if there is an issue open, reference that issue. This guide might help: [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/).

Once submitted, the Pull Request will go through a review process, meaning we will judge your code :smile:.

#### Git Branches

We use `develop` branch as the main developopment branch and `master` as the releases branch.
All Pull Requests related to features should be done against `develop` branch, releases Pull Requests should be done against `master` branch.

Give your branch a short descriptive name (like the names between the `<>` below) and prefix the name with something representative for that branch:

- `feature/<feature-name>` - used when an enhancement or new feature was implemented
- `docs/<what-the-docs>` - missing docs or keeping them up to date
- `bugfix/<caught-it>` - solved a bug
- `test/<thank-you>` - adding missing tests for a feature, we would prefer they would come with the `feature` but still `thank you`
- `refactor/<that-name-is-confusing>` - well we hope we don't mess anything and we don't get to use this
- `hotfix/<oh-no>` - for when things needed to be fixed yesterday.

### Coding conventions

We do optimize for readability, and it would be awesome if you go through the code and see what conventions we've used so far, some are also explained here:

- Indentation should be 2 _spaces_
- Semi-colon should only be used when necessary
- 120 character limit is almost strict, but can be broken in documentation when hyperlinks go over the limits
- We follow recommended code style settings from [eslint](https://eslint.org/docs/rules/),[prettier](https://prettier.io/docs/) and [react](https://github.com/yannickcr/eslint-plugin-react) with some small exceptions. Exceptions are stated in config files for `eslint` and `prettier`.
- Static type errors are should be checked with [flow](https://flow.org/en/docs/)
- We encourage you to use javascript libraries if it makes code more readable and simplifies program logic
- Tools to help you:
  - Linting, formatting and type checking is configured to be run with `npm`, see `script` inside `package.json` for possible options
  - Repository has a pre-configured pre-commit hook for git, use that to handle checks before you commit to your branch.

Thanks,
CSC developers
