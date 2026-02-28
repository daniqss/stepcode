import markdown
import os
import shutil

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


def parse_content_folder(content_path: str) -> dict[str, str]:
    results = {}
    for root, dirs, files in os.walk(content_path):
        for file in files:
            if file.endswith(".md"):
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, content_path)

                with open(filepath, "r", encoding="utf-8") as f:
                    html = markdown.markdown(
                        f.read(), extensions=["fenced_code", "tables"]
                    )

                results[relative_path] = html
                print(f"parsed {relative_path}")

    return results


def write_output(parsed: dict[str, str], output_path: str) -> None:
    if os.path.exists(output_path):
        shutil.rmtree(output_path)
    os.makedirs(output_path)

    for relative_path, content in parsed.items():
        output_file = os.path.join(output_path, relative_path).replace(".md", ".html")
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        depth = relative_path.count(os.sep)
        css_relative_path = "../" * depth + "base.css"

        title = os.path.splitext(os.path.basename(relative_path))[0]

        html = LAYOUT.format(title=title, content=content, css_path=css_relative_path)

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(html)

        print(f"written {relative_path} -> {output_file}")

    if os.path.exists("static/base.css"):
        shutil.copy("static/base.css", os.path.join(output_path, "base.css"))
        print("copied base.css")
    else:
        print("Warning: base.css not found in root directory")


if __name__ == "__main__":
    parsed = parse_content_folder("content")
    write_output(parsed, "dist")
