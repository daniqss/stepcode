import os
import shutil
from parse_content import Page

LAYOUT = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="{css_path}">
</head>
<body>
    <main>
        {content}
    </main>
</body>
</html>"""


def write_output(parsed: dict[str, Page], output_path: str) -> None:
    if os.path.exists(output_path):
        shutil.rmtree(output_path)
    os.makedirs(output_path)

    for relative_path, page in parsed.items():
        output_file = os.path.join(output_path, relative_path).replace(".md", ".html")
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        depth = relative_path.count(os.sep)
        css_relative_path = "../" * depth + "base.css"

        title = page.meta.get(
            "title", os.path.splitext(os.path.basename(relative_path))[0]
        )

        html = LAYOUT.format(
            title=title, content=page.render(), css_path=css_relative_path
        )

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(html)

        print(f"written {relative_path} -> {output_file}")

    if os.path.exists("static/base.css"):
        shutil.copy("static/base.css", os.path.join(output_path, "base.css"))
        print("copied base.css")
    else:
        print("Warning: base.css not found in root directory")
