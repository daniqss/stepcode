import os
import shutil

from parse_content import DirNode, FileNode

LAYOUT = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="{css_path}">
</head>
<body>
    <nav>
        <h3>Table of Contents</h3>
        {nav_tree}
    </nav>
    <main>
        <h1>{title}</h1>
        {content}
    </main>
    <script type="module" src="{js_path}"></script>
</body>
</html>"""


INDEX_LAYOUT = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="{css_path}">
    <style>
        body {{
            display: block;
        }}
        nav {{
            display: none;
        }}
        main.landing {{
            max-width: 900px;
            margin: 0 auto;
            padding: 4rem 2rem;
            text-align: center;
        }}
        main.landing h1 {{
            border: none;
            font-size: 3.5rem;
            margin-bottom: 0.5rem;
        }}
        main.landing a.button {{
            display: inline-block;
            background-color: var(--accent-color);
            color: #fff;
            padding: 0.8rem 1.5rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 2rem;
            border-bottom: none;
        }}
        main.landing a.button:hover {{
            opacity: 0.9;
            border-bottom: none;
        }}
    </style>
</head>
<body>
    <main class="landing">
        {content}
    </main>
    <script type="module" src="{js_path}"></script>
</body>
</html>"""


def render_nav_tree(node, current_page_path):
    html = ''

    if isinstance(node, DirNode):
        if node.name != 'root':
            html += f'<li><strong>{node.name.capitalize()}</strong></li>'

        if node.children:
            html += '<ul>'
            for child in node.children:
                html += render_nav_tree(child, current_page_path)
            html += '</ul>'

    elif isinstance(node, FileNode):
        target_html = node.path.replace('.md', '.html')
        current_dir = os.path.dirname(current_page_path)

        rel_link = os.path.relpath(target_html, current_dir).replace('\\', '/')

        is_active = "class='active'" if node.path == current_page_path else ''

        title = node.page.meta.get('title', node.name.replace('.md', '').replace('-', ' ').title())
        html += f"<li><a href='{rel_link}' {is_active}>{title}</a></li>"

    return html


def process_node(node, output_root, site_root, current_path=''):
    if isinstance(node, DirNode):
        if node.path:
            os.makedirs(os.path.join(output_root, node.path), exist_ok=True)
        for child in node.children:
            process_node(child, output_root, site_root)

    elif isinstance(node, FileNode):
        output_file = os.path.join(output_root, node.path.replace('.md', '.html'))
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        depth = node.path.count(os.sep) + node.path.count('/')
        css_relative_path = '../' * depth + 'static/base.css'
        js_relative_path = '../' * depth + 'static/js/index.js'

        nav_html = render_nav_tree(site_root, node.path)

        title = node.page.meta.get(
            'title', os.path.splitext(node.name)[0].replace('-', ' ').title()
        )

        if node.path == 'index.md':
            html = INDEX_LAYOUT.format(
                title=title,
                content=node.page.render(),
                css_path=css_relative_path,
                js_path=js_relative_path,
            )
        else:
            html = LAYOUT.format(
                title=title,
                content=node.page.render(),
                css_path=css_relative_path,
                js_path=js_relative_path,
                nav_tree=nav_html,
            )

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f'written {node.path} -> {output_file}')


def write_output(root_node: DirNode, output_path: str) -> None:
    if os.path.exists(output_path):
        shutil.rmtree(output_path)
    os.makedirs(output_path)

    process_node(root_node, output_path, root_node)

    if os.path.exists('static'):
        shutil.copytree('static', os.path.join(output_path, 'static'))
        print('copied static directory')
    else:
        print('Warning: static directory not found in root directory')
