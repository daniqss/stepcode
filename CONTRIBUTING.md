# Contributing Guide

First of all, thank you for considering contributing to this project.
We welcome contributions of all kinds: bug reports, feature requests, documentation improvements, and code contributions.

---

## Before You Start

Please make sure to:

- Read the README carefully
- Check existing issues to avoid duplicates
- Follow the [Code of Conduct](./CODE_OF_CONDUCT.md)
- Review our [Governance model](./GOVERNANCE.md)

## Reporting Bugs

As a user, you must follow our issue template `bug_report.yaml` when reporting bugs. This helps us understand and reproduce the issue more effectively.

When reporting a bug, please include:

- A clear and descriptive title
- A detailed description of the issue
- Steps to reproduce the bug
- Expected and actual behavior
- Any relevant screenshots or logs if needed

## Suggesting Features

Feature requests should follow our issue template `feature_request.yaml` and include:

- Clear explanation of the problem
- Proposed solution
- Alternatives considered (if any)
- Example use cases

Please keep the scope aligned with the project's goals.

## Development Workflow

To contribute to **stepcode**, please follow this general workflow to ensure a smooth review process.

### 1. Environment Setup

Before starting, ensure you have followed the installation instructions in the [README.md](./README.md). This includes setting up the **Rust** toolchain (`cargo`) and installing the necessary Node.js dependencies for the interpreter.

If you use Nix, you can simply run `nix develop` or use `direnv` to automatically enter the development shell with all tools pre-installed.

### 2. Create a Branch

Always create a new branch for your work. Use a descriptive name that follows our naming conventions:

- `feat/your-feature-name`
- `fix/your-bug-fix`
- `docs/your-doc-change`

```bash
git checkout -b feat/short-description
```

### 3. Implementation and Local Testing

While working on your changes, make sure to:

- **Test the interpreter**: If you modify the core logic, run the tests in the `interpreter` directory.
  ```bash
  cd interpreter && npm test
  ```
- **Build the book**: Verify that the site generator still works as expected.
  ```bash
  cargo run -- docs
  ```

### 4. Code Quality

Before committing, you must ensure your code follows the project's style guidelines. We use `eslint` and `prettier` for JavaScript, and `cargo fmt` and `cargo clippy` for Rust.

```bash
# JavaScript linting and formatting
npm run lint
npm run format

# Rust linting and formatting
cargo clippy --fix
cargo fmt
```

### 5. Submit a Pull Request

Once your changes are ready and verified:

1. Push your branch to your fork.
2. Open a Pull Request against the `main` branch of the original repository.
3. Fill out the PR template completely so we understand the context of your changes.

## Commit Guidelines

We follow **Conventional Commits**.

Allowed types:

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `docs:` Documentation only changes
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `style:` Style changes in the code

Clear and meaningful commit messages are required.
You may be asked to rebase unclear commits.

## Pull Requests

Before submitting a pull request:

- Ensure the project builds successfully
- Run all tests
- Keep PRs focused and small
- Update documentation if necessary

PR descriptions should clearly explain:

- What changed
- Why it changed
- Any breaking changes

Large PRs without explanation may be rejected.

## Testing Guidelines

All new features should include tests when possible.

## Code Style Guidelines

- Keep functions small and focused
- Prefer clarity over cleverness
- Avoid unnecessary abstractions
- Use descriptive variable and function names
- Respect the project’s formatting and lint rules

### Linting and Formatting

Before commiting make sure to execute the following commands.

Javascript:

```bash
# inspect errors
npm run lint
# format code
npm run format
```

Rust:

```bash
# inspect errors
cargo clippy
# inspect and fix errors
cargo clippy --fix
# format code
cargo fmt
```

or 

```bash
nix fmt
```

## Breaking Changes

Breaking changes must:

- Be clearly documented in the PR
- Include migration notes if necessary
- Follow Semantic Versioning

## Thank you

Your contributions help improve the project and make it more useful for everyone.
We apreciate your time and effort.
