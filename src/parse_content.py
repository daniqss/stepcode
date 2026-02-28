import os
import re
import sys
import tomllib
from dataclasses import dataclass

from frontmatter import Frontmatter
from markdown import markdown


@dataclass
class SiteConfig:
    name: str
    author: str


def parse_config(config_path: str) -> SiteConfig:
    toml_path = os.path.join(config_path, 'stepcode.toml')

    if not os.path.exists(toml_path):
        print(f"Error: config file not found at '{toml_path}'")
        sys.exit(1)

    try:
        with open(toml_path, 'rb') as f:
            data = tomllib.load(f)
    except tomllib.TOMLDecodeError as e:
        print(f"Error: could not parse '{toml_path}': {e}")
        sys.exit(1)

    errors = []

    site_data = data.get('site')
    if not site_data:
        errors.append('missing [site] section')
    else:
        if 'name' not in site_data:
            errors.append("missing 'name' field in [site]")
        if 'author' not in site_data:
            errors.append("missing 'author' field in [site]")

    if errors:
        print('Error: invalid config file:')
        for err in errors:
            print(f'  - {err}')
        sys.exit(1)

    assert site_data is not None

    return SiteConfig(
        name=site_data['name'],
        author=site_data['author'],
    )


@dataclass
class Page:
    meta: dict[str, str]
    content: str

    def render(self) -> str:
        if not self.meta:
            return self.content

        def replacer(match: re.Match) -> str:
            key = match.group(1).strip()
            return self.meta.get(key, match.group(0))

        return re.sub(r'\{\{(.+?)\}\}', replacer, self.content)


def parse_content_folder(content_path: str) -> dict[str, Page]:
    results = {}
    for root, dirs, files in os.walk(content_path):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, content_path)

                with open(filepath, 'r', encoding='utf-8') as f:
                    raw = f.read()

                fm = Frontmatter.read(raw)
                body = fm['body'] if fm['body'] else raw
                html = markdown(body, extensions=['fenced_code', 'tables'])

                page = Page(
                    meta=fm['attributes'] or {},
                    content=html,
                )

                results[relative_path] = page
                print(f'parsed {relative_path}')

    return results
