---
title: "How to build stepcode and the documentation"
---

# {{title}}

## Building stepcode

To build **stepcode** into source and binary distributions compatible with, for example, PyPI, you can use the following command:

```sh
uv build
```


## Building our documentation
To build the documentation, you can use:

```sh
uv run src/main.py docs
```