// stepcode: specialized tool for generating static books with interactive pseudocode.
// Copyright (C) 2026  stepcode authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use crate::tree::{DirNode, FileNode, Node};
use std::fs;
use std::path::Path;

const LAYOUT: &str = r###"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="{css_path}">
    {user_css_link}
</head>
<body>
    <nav>
        <a href="{index_path}"><h2>Index</h2></a>
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
</html>"###;

const INDEX_LAYOUT: &str = r###"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="{css_path}">
    {user_css_link}
    <style>
        body {
            display: block;
        }
        nav {
            display: none;
        }
        main.landing {
            max-width: 900px;
            margin: 0 auto;
            padding: 4rem 2rem;
            text-align: center;
        }
        main.landing h1 {
            border: none;
            font-size: 3.5rem;
            margin-bottom: 0.5rem;
        }
        main.landing a.button {
            display: inline-block;
            background-color: var(--accent-color);
            color: #fff;
            padding: 0.8rem 1.5rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 2rem;
            border-bottom: none;
        }
        main.landing a.button:hover {
            opacity: 0.9;
            border-bottom: none;
        }
        main.landing ol, main.landing ul {
            text-align: left;
            display: inline-block;
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }
        main.landing li {
            margin-bottom: 0.8rem;
        }
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
</html>"###;

const FOOTER: &str = r###"
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
"###;

pub fn get_asset_path(current_file_path: &str, asset_target: &str) -> String {
    let mut parts: Vec<&str> = current_file_path.split('/').collect();
    if !parts.is_empty() {
        parts.pop(); // Remove the filename to get the directory
    }

    if parts.is_empty() {
        asset_target.to_string()
    } else {
        let prefix = vec![".."; parts.len()].join("/");
        format!("{}/{}", prefix, asset_target)
    }
}

pub fn flatten_tree<'a>(node: &'a Node) -> Vec<&'a FileNode> {
    let mut files = Vec::new();
    match node {
        Node::File(f) => files.push(f),
        Node::Dir(d) => {
            for child in &d.children {
                files.extend(flatten_tree(child));
            }
        }
    }
    files
}

pub fn render_nav_tree(node: &Node, current_page_path: &str) -> String {
    let mut html = String::new();

    match node {
        Node::Dir(d) => {
            if d.name != "root" {
                let name = d.name.clone();
                let capitalized = if !name.is_empty() {
                    let mut c = name.chars();
                    match c.next() {
                        None => String::new(),
                        Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
                    }
                } else {
                    name
                };
                html.push_str(&format!("<li><strong>{}</strong></li>", capitalized));
            }

            if !d.children.is_empty() {
                html.push_str("<ul>");
                for child in &d.children {
                    html.push_str(&render_nav_tree(child, current_page_path));
                }
                html.push_str("</ul>");
            }
        }
        Node::File(f) => {
            let target_html = f.path.replace(".md", ".html");
            let rel_link = get_asset_path(current_page_path, &target_html);
            let is_active = if f.path == current_page_path {
                "class='active'"
            } else {
                ""
            };

            let default_title = f.name.replace(".md", "").replace("-", " ");
            let capitalized_title = if !default_title.is_empty() {
                let mut title_parts = Vec::new();
                for part in default_title.split_whitespace() {
                    let mut c = part.chars();
                    if let Some(first) = c.next() {
                        title_parts.push(first.to_uppercase().collect::<String>() + c.as_str());
                    }
                }
                title_parts.join(" ")
            } else {
                default_title
            };

            let title = f.page.meta.title.clone().unwrap_or(capitalized_title);
            html.push_str(&format!(
                "<li><a href='{}' {}>{}</a></li>",
                rel_link, is_active, title
            ));
        }
    }
    html
}

pub fn render_navigation(
    prev_node: Option<&FileNode>,
    next_node: Option<&FileNode>,
    current_page_path: &str,
) -> String {
    let mut html = String::from("<div class=\"navigation\">");

    if let Some(prev) = prev_node {
        let target_html = prev.path.replace(".md", ".html");
        let rel_link = get_asset_path(current_page_path, &target_html);

        let default_title = prev.name.replace(".md", "").replace("-", " ");
        let capitalized_title = if !default_title.is_empty() {
            let mut title_parts = Vec::new();
            for part in default_title.split_whitespace() {
                let mut c = part.chars();
                if let Some(first) = c.next() {
                    title_parts.push(first.to_uppercase().collect::<String>() + c.as_str());
                }
            }
            title_parts.join(" ")
        } else {
            default_title
        };
        let title = prev.page.meta.title.clone().unwrap_or(capitalized_title);

        html.push_str(&format!(
            "<a href=\"{}\" class=\"prev\">← {}</a>",
            rel_link, title
        ));
    }

    if let Some(next) = next_node {
        let target_html = next.path.replace(".md", ".html");
        let rel_link = get_asset_path(current_page_path, &target_html);

        let default_title = next.name.replace(".md", "").replace("-", " ");
        let capitalized_title = if !default_title.is_empty() {
            let mut title_parts = Vec::new();
            for part in default_title.split_whitespace() {
                let mut c = part.chars();
                if let Some(first) = c.next() {
                    title_parts.push(first.to_uppercase().collect::<String>() + c.as_str());
                }
            }
            title_parts.join(" ")
        } else {
            default_title
        };
        let title = next.page.meta.title.clone().unwrap_or(capitalized_title);

        html.push_str(&format!(
            "<a href=\"{}\" class=\"next\">{} →</a>",
            rel_link, title
        ));
    }

    html.push_str("</div>");
    html
}

pub fn process_node(
    node: &Node,
    output_root: &Path,
    site_root: &Node,
    flat_tree: &[&FileNode],
    has_user_css: bool,
) {
    match node {
        Node::Dir(d) => {
            if !d.path.is_empty() {
                let dir_path = output_root.join(&d.path);
                let _ = fs::create_dir_all(dir_path);
            }
            for child in &d.children {
                process_node(child, output_root, site_root, flat_tree, has_user_css);
            }
        }

        Node::File(f) => {
            let relative_html_path = f.path.replace(".md", ".html");
            let output_file = output_root.join(&relative_html_path);

            if let Some(parent) = output_file.parent() {
                let _ = fs::create_dir_all(parent);
            }

            let css_relative_path = get_asset_path(&f.path, "static/base.css");
            let js_relative_path = get_asset_path(&f.path, "static/index.js");
            let index_relative_path = get_asset_path(&f.path, "index.html");

            let user_css_link = if has_user_css {
                let user_css_relative_path = get_asset_path(&f.path, "static/user.css");
                format!(
                    "<link rel=\"stylesheet\" href=\"{}\">",
                    user_css_relative_path
                )
            } else {
                String::new()
            };

            let nav_html = render_nav_tree(site_root, &f.path);

            let mut prev_node: Option<&FileNode> = None;
            let mut next_node: Option<&FileNode> = None;

            for (i, f_node) in flat_tree.iter().enumerate() {
                if f_node.path == f.path {
                    if i > 0 {
                        prev_node = Some(flat_tree[i - 1]);
                    }
                    if i < flat_tree.len() - 1 {
                        next_node = Some(flat_tree[i + 1]);
                    }
                    break;
                }
            }

            let navigation_html = render_navigation(prev_node, next_node, &f.path);

            let default_title = f.name.replace(".md", "").replace("-", " ");
            let capitalized_title = if !default_title.is_empty() {
                let mut title_parts = Vec::new();
                for part in default_title.split_whitespace() {
                    let mut c = part.chars();
                    if let Some(first) = c.next() {
                        title_parts.push(first.to_uppercase().collect::<String>() + c.as_str());
                    }
                }
                title_parts.join(" ")
            } else {
                default_title
            };
            let title = f.page.meta.title.clone().unwrap_or(capitalized_title);

            let html = if f.path == "index.md" {
                INDEX_LAYOUT
                    .replace("{title}", &title)
                    .replace("{content}", &f.page.render())
                    .replace("{css_path}", &css_relative_path)
                    .replace("{user_css_link}", &user_css_link)
                    .replace("{js_path}", &js_relative_path)
                    .replace("{navigation}", &navigation_html)
                    .replace("{FOOTER}", FOOTER)
            } else {
                LAYOUT
                    .replace("{title}", &title)
                    .replace("{content}", &f.page.render())
                    .replace("{css_path}", &css_relative_path)
                    .replace("{user_css_link}", &user_css_link)
                    .replace("{js_path}", &js_relative_path)
                    .replace("{index_path}", &index_relative_path)
                    .replace("{nav_tree}", &nav_html)
                    .replace("{navigation}", &navigation_html)
                    .replace("{FOOTER}", FOOTER)
            };

            fs::write(&output_file, html).expect("Unable to write file");
            println!("written {} -> {:?}", f.path, output_file);
        }
    }
}

pub fn write_output(root_node: &DirNode, output_path: &str, base_path: &str) {
    let output_root = Path::new(output_path);
    if output_root.exists() {
        let _ = fs::remove_dir_all(output_root);
    }
    let _ = fs::create_dir_all(output_root);

    let static_dest = output_root.join("static");
    let _ = fs::create_dir_all(&static_dest);

    let base_dir = Path::new(base_path);
    let user_css_path = base_dir.join("user.css");
    let has_user_css = user_css_path.exists();
    if has_user_css {
        let _ = fs::copy(&user_css_path, static_dest.join("user.css"));
        println!("copied user.css");
    }

    let root_node_val = Node::Dir(root_node.clone());
    let flat_tree = flatten_tree(&root_node_val);
    process_node(
        &root_node_val,
        output_root,
        &root_node_val,
        &flat_tree,
        has_user_css,
    );

    let base_css = include_str!("../static/base.css");
    let index_js = include_str!("../static/index.js");
    let _ = fs::write(static_dest.join("base.css"), base_css);
    let _ = fs::write(static_dest.join("index.js"), index_js);
    println!("copied embedded base.css and index.js");

    let interpreter_js = include_str!("../interpreter/static/interpreter.js");
    let lexer_js = include_str!("../interpreter/static/lexer.js");
    let parser_js = include_str!("../interpreter/static/parser.js");
    let _ = fs::write(static_dest.join("interpreter.js"), interpreter_js);
    let _ = fs::write(static_dest.join("lexer.js"), lexer_js);
    let _ = fs::write(static_dest.join("parser.js"), parser_js);
    println!("copied embedded interpreter files");
}
