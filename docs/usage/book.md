---
title: 'Create your own book'
---

# {{title}}

Creating a static book with **stepcode** is as simple as writing standard Markdown.

## Installation

You can get the **stepcode** binary in several ways:

### GitHub Releases
Download the pre-compiled binary for your architecture from the [GitHub Releases](https://github.com/daniqss/stepcode/releases) page.

### Using Nix
If you are a [Nix](https://nixos.org/) user, you can run **stepcode** directly without installing it:

```sh
nix run github:daniqss/stepcode -- <YOUR_BOOK_FOLDER>
```

Or enter a development shell with all dependencies ready:

```sh
nix develop github:daniqss/stepcode
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

You can also add custom css to override the default stepcode theme, just create a `user.css` file in the root of your book folder and it will be automatically included in the generated site.

```css
:root {
  --accent-color: rgb(60, 101, 162);
}
```

## Building the Book

Instructions on how to build and host your book can be found in the [README.md](https://github.com/daniqss/stepcode?tab=readme-ov-file#usage) of the repository. If you don't want to deal with the setup locally, just use the template that we provide, which will automatically build and deploy your book to GitHub Pages on every push to the `main` branch.

```sh
stepcode <YOUR_FOLDER>
```

### In GitHub Pages

If you want to host your book on Github Pages, you can copy our [workflow](https://github.com/daniqss/stepcode/blob/main/.github/workflows/release.yaml)
If you're using the template, it already contains a workflow that will automatically build and deploy your book to Github Pages on every push to the `main` branch. You can customize it as you wish, but make sure to update the path to the book in the workflow.
