# stepcode

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Python: 3.14+](https://img.shields.io/badge/python-3.14+-blue.svg)](https://www.python.org/downloads/)
[![Node: 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

![Example](assets/gifstepcode.gif)

**stepcode** is a specialized tool for generating static books that feature interactive, step-by-step pseudocode execution. Designed for educators and students, it provides a powerful way to visualize algorithm logic and program flow directly in the browser.

---

## Why stepcode?

Learning to code often feels abstract. **stepcode** bridges the gap between static theory and dynamic execution by allowing students to:

1.  **Visualize State**: See exactly how variables change as each line of code is executed.
2.  **Control the Pace**: Step through complex algorithms line-by-line, forwards and backwards.
3.  **Learn through Context**: Read high-quality educational content side-by-side with live code execution.

---

## Key Features

- **Static Site Generation**: Transforms simple Markdown files into a professional, structured educational book.
- **Interactive Pseudocode**: A custom-built interpreter allows users to "play" the code directly in their browser.
- **Visual State Tracking**: Real-time display of variable values and program counter.
- **CLI Debugging**: Run and debug pseudocode files locally in the terminal with the included CLI tool.

## Prerequisites

- **Python** (>= 3.14)
- **uv** (Python package manager)
- **Node.js** (for the CLI and serving the site)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/stepcode.git
   cd stepcode
   ```

2. Install Python dependencies:
   ```bash
   uv sync
   ```

## Usage

### Generating the Book

To build the static site from the content directory:

```bash
uv run src/main.py content
```

The output will be generated in the `dist` directory.

### Serving the Book

To view the generated book locally, use a static file server:

```bash
npx serve dist
```

### Running the CLI Interpreter

Debug your pseudocode directly in the terminal:

```bash
node interpreter/cli.js path/to/your-code.pseudocode
```

## Project Structure

```bash
stepcode
├── .github/                # GitHub templates for issues and PRs
├── content/                # Source content for the book
│   ├── chapters/           # Markdown files for each lesson/chapter
│   ├── index.md            # Landing page content
│   └── stepcode.toml       # Book configuration and chapter order
├── interpreter/            # CLI version of the pseudocode interpreter
│   ├── cli.js              # Command-line interface entry point
│   └── tests/              # Unit tests for the parser and interpreter
├── src/                    # Site generator source code (Python)
│   ├── generate.py         # HTML generation logic and layouts
│   ├── main.py             # Main entry point for the generator
│   └── parse_content.py    # Logic for parsing Markdown and config files
├── static/                 # Assets for the generated site
│   ├── base.css            # Global styles
│   └── js/                 # Interpreter logic (Lexer, Parser, Runtime)
├── pyproject.toml          # Python project configuration and dependencies
├── package.json            # Node.js scripts and development dependencies
├── flake.nix               # Nix development environment configuration
└── LICENSE.txt             # GPL-3.0 License details
```

## Roadmap

- [ ] **Complex Data Structures**: Support for arrays, lists, and objects in the interpreter.
- [ ] **Multi-language Support**: Export generated books to different programming languages.
- [ ] **Interactive Quizzes**: Embed assessments directly into the generated chapters.
- [ ] **Theme Support**: Custom CSS themes for the generated static books.

## Development

### Running Tests

To run the interpreter tests:

```bash
cd interpreter
npm test
```

### Formatting and Linting

```bash
# Lint the project
npm run lint

# Format the code
npm run format
```

## License

This project is licensed under the GPL-3.0-only License. See `LICENSE.txt` for details.
