# Third-Party Dependencies and Licenses

This project uses several third-party libraries to function correctly. This document provides a list of these dependencies and their respective licenses.

## Python Dependencies

These libraries are used for the static site generator.

- **[python-frontmatter](https://github.com/eyeseast/python-frontmatter)** (MIT): Used for parsing frontmatter from Markdown files.
- **[markdown](https://github.com/Python-Markdown/markdown)** (BSD-3-Clause): Used for converting Markdown content to HTML.

## JavaScript Dependencies (Interpreter)

These libraries are used by the pseudocode interpreter.

- **[format](https://github.com/Tidwell/format)** (MIT): String formatting utility.
- **[lint](https://github.com/omni-group/lint)** (Apache-2.0): A generic linter used in the interpreter's toolset.

## Development Dependencies

These libraries are used for development, linting, and formatting of the project.

- **[@eslint/js](https://github.com/eslint/eslint)** (MIT): Official ESLint recommended configurations.
- **[eslint](https://github.com/eslint/eslint)** (MIT): Pluggable JavaScript linter.
- **[eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)** (MIT): Turns off unnecessary or conflicting ESLint rules when using Prettier.
- **[eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)** (MIT): Runs Prettier as an ESLint rule.
- **[globals](https://github.com/sindresorhus/globals)** (MIT): Global identifiers for different JavaScript environments.
- **[prettier](https://github.com/prettier/prettier)** (MIT): Opinionated code formatter.

---

### GPL-3.0 Compatibility

As this project is licensed under the **GPL-3.0**, all third-party dependencies are checked for compatibility. The MIT, BSD-3-Clause, and Apache-2.0 licenses are compatible with the GPL-3.0 license.
