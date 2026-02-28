# Contributing Guide

First of all, thank you for considering contributing to this project.
We welcome contributions of all kinds: bug reports, feature requests, documentation improvements, and code contributions.

---

## Before You Start

Please make sure to:

- Read the README carefully
- Check existing issues to avoid duplicates
- Follow the Code of Conduct

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

## 🛠 Development Setup

### 1. Fork the repository

### 2. Clone your fork

```bash
git clone git@github.com:daniqss/stepcode.git
cd project-name
```

### 3. Install dependencies

```bash
#TODO
```

### 4. Run in development mode

```bash
#TODO
```

### 5. Build the project

```bash
#TODO
```

## Project Architecture Overview

The project is divided into clearly separated domains:

#TODO

## Commit Guidelines

We follow **Conventional Commits**.

Allowed types:

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `docs:` Documentation only changes
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

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

If you modify: #TODO

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

Python:

```bash
# inspect errors
ruff check .
# inspect and fix errors
ruff check --fix .
# format code
ruff format .
```

## Breaking Changes

Breaking changes must:

- Be clearly documented in the PR
- Include migration notes if necessary
- Follow Semantic Versioning

## Thank you

Your contributions help improve the project and make it more useful for everyone.
We apreciate your time and effort.
