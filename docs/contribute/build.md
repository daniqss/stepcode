---
title: 'Building stepcode'
---

# {{title}}

## Building stepcode

**stepcode** is available in pre-compiled binary form on the [GitHub Releases](https://github.com/daniqss/stepcode/releases) page. However, if you want to build it from source, you can follow the instructions below.

```sh
cargo build --release
```

## Building our documentation

To build the documentation, you can use:

```sh
cargo run -- docs
# or
stepcode docs
```

## Using nix

If you are a [nix](https://nixos.org/) user, you can use the `devShell` provided by the `flake.nix` to easily set up a development environment with all the necessary dependencies. To enter the development shell, run:

```sh
nix develop .
```

To try the program without installing it, you can run:

```sh
nix run github:daniqss/stepcode -- <YOUR_BOOK_FOLDER>
``` 
