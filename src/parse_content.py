# stepcode: specialized tool for generating static books with interactive pseudocode.
# Copyright (C) 2026  stepcode authors
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import os
import re
import sys
import tomllib
from dataclasses import dataclass, field
from typing import List, Optional, Union

from frontmatter import Frontmatter
from markdown import markdown


@dataclass
class Page:
    """Content of every markdown"""

    meta: dict
    content: str
    raw_path: str

    def render(self) -> str:
        if not self.meta:
            return self.content

        def replacer(match: re.Match) -> str:
            key = match.group(1).strip()
            return str(self.meta.get(key, match.group(0)))

        return re.sub(r'\{\{(.+?)\}\}', replacer, self.content)


@dataclass
class Node:
    name: str
    path: str


@dataclass
class FileNode(Node):
    page: Page


@dataclass
class DirNode(Node):
    children: List[Union['DirNode', 'FileNode']] = field(default_factory=list)

    def add_child(self, node: Union['DirNode', 'FileNode']):
        self.children.append(node)

    def get_child(self, name: str) -> Optional[Union['DirNode', 'FileNode']]:
        for child in self.children:
            if child.name == name:
                return child
        return None


@dataclass
class SiteConfig:
    name: str
    author: str
    chapters: List[str]


def parse_config(config_path: str) -> SiteConfig:
    toml_path = os.path.join(config_path, 'stepcode.toml')

    if not os.path.exists(toml_path):
        sys.exit(f"Error: config file not found at '{toml_path}'")

    try:
        with open(toml_path, 'rb') as f:
            data = tomllib.load(f)
    except tomllib.TOMLDecodeError as e:
        sys.exit(f"Error: could not parse '{toml_path}': {e}")

    book_data = data.get('book')
    if not book_data:
        sys.exit('Error: missing [book] section in TOML')

    required = ['name', 'author', 'chapters']
    for field_name in required:
        if field_name not in book_data:
            sys.exit(f"Error: missing '{field_name}' in [book] section")

    return SiteConfig(
        name=book_data['name'],
        author=book_data['author'],
        chapters=book_data['chapters'],
    )


def load_page_content(full_path: str, relative_path: str) -> Page:
    if not os.path.exists(full_path):
        sys.exit(f'Error: Chapter file not found: {full_path}')

    with open(full_path, 'r', encoding='utf-8') as f:
        raw = f.read()

    fm = Frontmatter.read(raw)
    body = fm['body'] if fm['body'] else raw
    html = markdown(body, extensions=['fenced_code', 'tables'])

    return Page(meta=fm['attributes'] or {}, content=html, raw_path=relative_path)


def build_site_tree(config: SiteConfig, content_root: str) -> DirNode:
    root = DirNode(name='root', path='')

    index_path = os.path.join(content_root, 'index.md')
    if os.path.exists(index_path):
        page_obj = load_page_content(index_path, 'index.md')
        file_node = FileNode(name='index.md', path='index.md', page=page_obj)
        root.add_child(file_node)
        print('Loaded: index.md')

    for chapter_path in config.chapters:
        clean_path = os.path.normpath(chapter_path)
        parts = clean_path.split(os.sep)

        filename = parts[-1]
        directories = parts[:-1]

        current_node = root

        accumulated_path = ''
        for dir_name in directories:
            accumulated_path = os.path.join(accumulated_path, dir_name)

            found_node = current_node.get_child(dir_name)

            if found_node and isinstance(found_node, DirNode):
                current_node = found_node
            else:
                new_dir = DirNode(name=dir_name, path=accumulated_path)
                current_node.add_child(new_dir)
                current_node = new_dir

        full_sys_path = os.path.join(content_root, clean_path)
        page_obj = load_page_content(full_sys_path, clean_path)

        file_node = FileNode(name=filename, path=clean_path, page=page_obj)
        current_node.add_child(file_node)
        print(f'Loaded: {clean_path}')

    return root


def print_tree(node: Node, level: int = 0):
    indent = '  ' * level
    icon = '📁' if isinstance(node, DirNode) else '📄'
    print(f'{indent}{icon} {node.name}')

    if isinstance(node, DirNode):
        for child in node.children:
            print_tree(child, level + 1)
