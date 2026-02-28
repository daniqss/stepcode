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
        {content}
        {navigation}
        <footer>
            {FOOTER}
        </footer>
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
        main.landing ol, main.landing ul {{
            text-align: left;
            display: inline-block;
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }}
        main.landing li {{
            margin-bottom: 0.8rem;
        }}
        </style>
</head>
<body>
    <main class="landing">
        {content}
        {navigation}
        <footer>
            {FOOTER}
        </footer>
    </main>
    
    <script type="module" src="{js_path}"></script>
</body>
</html>"""

# fmt: skip
FOOTER = """
<div class="footer-content">
    <div class="footer-left">
        made with &lt;3 from <code>Aula 2.10</code>
    </div>
    <div class="footer-right">
        <a
            href="https://github.com/daniqss/stepcode"
            target="_blank" aria-label="GitHub repository"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                class="bi bi-github"
                viewBox="0 0 16 16"
            >
                <path
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
                />
            </svg>
        </a>
    </div>
</div>
"""  # noqa: E501


def get_asset_path(current_file_path, asset_target):
    env = os.environ.get('STEPCODE_ENV', 'development')

    # check for build environment to check for correct static files paths
    if env == 'production':
        source_dir = os.path.dirname(current_file_path)
        rel_path = os.path.relpath(asset_target, source_dir)
        return rel_path.replace('\\', '/')
    else:
        source_dir = os.path.dirname(current_file_path)
        rel_path = os.path.relpath(asset_target, source_dir)
        return rel_path.replace('\\', '/')


def flatten_tree(node):
    files = []
    if isinstance(node, FileNode):
        files.append(node)
    elif isinstance(node, DirNode):
        for child in node.children:
            files.extend(flatten_tree(child))
    return files


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


def render_navigation(prev_node, next_node, current_page_path):
    html = '<div class="navigation">'

    if prev_node:
        target_html = prev_node.path.replace('.md', '.html')
        current_dir = os.path.dirname(current_page_path)
        rel_link = os.path.relpath(target_html, current_dir).replace('\\', '/')
        title = prev_node.page.meta.get(
            'title', prev_node.name.replace('.md', '').replace('-', ' ').title()
        )
        html += f'<a href="{rel_link}" class="prev">← {title}</a>'

    if next_node:
        target_html = next_node.path.replace('.md', '.html')
        current_dir = os.path.dirname(current_page_path)
        rel_link = os.path.relpath(target_html, current_dir).replace('\\', '/')
        title = next_node.page.meta.get(
            'title', next_node.name.replace('.md', '').replace('-', ' ').title()
        )

        html += f'<a href="{rel_link}" class="next">{title} →</a>'

    html += '</div>'
    return html


def process_node(node, output_root, site_root, flat_tree, current_path=''):
    if isinstance(node, DirNode):
        if node.path:
            os.makedirs(os.path.join(output_root, node.path), exist_ok=True)
        for child in node.children:
            process_node(child, output_root, site_root, flat_tree)

    elif isinstance(node, FileNode):
        output_file = os.path.join(output_root, node.path.replace('.md', '.html'))
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        css_relative_path = get_asset_path(node.path, 'static/base.css')
        js_relative_path = get_asset_path(node.path, 'static/js/index.js')

        nav_html = render_nav_tree(site_root, node.path)

        # Calculate prev/next
        prev_node = None
        next_node = None
        for i, f_node in enumerate(flat_tree):
            if f_node.path == node.path:
                if i > 0:
                    prev_node = flat_tree[i - 1]
                if i < len(flat_tree) - 1:
                    next_node = flat_tree[i + 1]
                break

        navigation_html = render_navigation(prev_node, next_node, node.path)

        title = node.page.meta.get(
            'title', os.path.splitext(node.name)[0].replace('-', ' ').title()
        )

        if node.path == 'index.md':
            html = INDEX_LAYOUT.format(
                title=title,
                content=node.page.render(),
                css_path=css_relative_path,
                js_path=js_relative_path,
                navigation=navigation_html,
                FOOTER=FOOTER,
            )
        else:
            html = LAYOUT.format(
                title=title,
                content=node.page.render(),
                css_path=css_relative_path,
                js_path=js_relative_path,
                nav_tree=nav_html,
                navigation=navigation_html,
                FOOTER=FOOTER,
            )

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f'written {node.path} -> {output_file}')


def write_output(root_node: DirNode, output_path: str) -> None:
    if os.path.exists(output_path):
        shutil.rmtree(output_path)
    os.makedirs(output_path)

    flat_tree = flatten_tree(root_node)
    process_node(root_node, output_path, root_node, flat_tree)

    if os.path.exists('static'):
        shutil.copytree('static', os.path.join(output_path, 'static'))
        print('copied static directory')
    else:
        print('Warning: static directory not found in root directory')
