# How to use stepcode

Creating a static book with **stepcode** is as simple as writing standard Markdown.

## Creating Chapters

To add a new chapter, simply create a `.md` file in the `content/chapters/` directory. The tool will automatically detect it and generate the corresponding HTML.

## Writing Pseudocode

To enable step-by-step execution for your pseudocode, wrap your code blocks with the `stepcode` language identifier:

````markdown
```stepcode
x := 5
y := 10
result := x + y
```
````

The interpreter will parse these blocks and provide the interactive stepping functionality in the generated static site.

## Building the Book

Instructions on how to build and host your book can be found in the [README.md](https://github.com/javier-v/stepcode) of the repository.
