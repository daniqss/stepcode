# stepcode

**stepcode** is a specialized tool for generating static books that feature interactive, step-by-step pseudocode execution. Designed for educators and students, it provides a powerful way to visualize algorithm logic and program flow directly in the browser.

## Key Features

- **Static Site Generation**: Transforms Markdown content into a structured, interactive educational book.
- **Interactive Pseudocode**: Features an integrated interpreter that allows users to step through code execution line-by-line.
- **Visual State Tracking**: Automatically tracks and displays variable state changes during execution.

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

## Project Structure

- `content/`: Contains the Markdown source files and configuration for the book.
- `src/`: Python source code for the site generator.
- `static/`: Frontend assets (CSS, JavaScript, and the interpreter core).
- `interpreter/`: Command-line interface for the pseudocode interpreter and tests.

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
