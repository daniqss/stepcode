---
title: 'Create your own book'
---

# {{title}}

Creating a static book with **stepcode** is as simple as writing standard Markdown.

## Cloning the Repository

As **stepcode** is made in Python, you must clone the repository and install the dependencies to use it. You can do this with the following commands:

```sh
git clone
cd stepcode
```

To easily manage dependencies and virtual environments, we recommend using [uv](https://docs.astral.sh/uv/). To install the dependencies and run the project, use:

```sh
uv sync
uv run src/main.py
```

## Creating Your Book

To create your book, create a folder. There you must have a `stepcode.toml`:

```toml
[book]
name = "My book"
author = "Me of course"

chapters = [
    # here you must list all the chapters of your book, in order.
    "blog/first-post.md",
    "blog/second-post.md",

    "cooking/first-recipe.md",
]
```

and a index.md in the root of the folder:

```markdown
---
title: 'My book'
---

# {{title}}

Hi
```

This examples are available in the [template](https://github.com/daniqss/stepcode/tree/main/template) folder of the repository.

### nix
If you are a [nix](https://nixos.org/download/) user, the repo flake exposes a `devShell` to download all the dependencies and have a ready to use environment. You can enter it with:

```sh
nix develop .
```

# Template
Furthermore, the template book is available using:

```sh
nix flake new --template github:daniqss/stepcode#book my-book
```

## Building the Book

Instructions on how to build and host your book can be found in the [README.md](https://github.com/daniqss/stepcode?tab=readme-ov-file#usage) of the repository.

After using

```sh
uv run src/main.py <YOUR_FOLDER>
```

### In Github Pages

If you want to host your book on Github Pages, you can copy our [workflow](https://github.com/daniqss/stepcode/blob/main/.github/workflows/release.yaml)
If you're using the template, it already contains a workflow that will automatically build and deploy your book to Github Pages on every push to the `main` branch. You can customize it as you wish, but make sure to update the path to the book in the workflow.
