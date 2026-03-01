use crate::parse::{Config, Frontmatter, parse_markdown};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone)]
pub struct Page {
    pub meta: Frontmatter,
    pub content: String,
    pub raw_path: String,
}

impl Page {
    pub fn render(&self) -> String {
        let mut result = self.content.clone();
        if let Some(title) = &self.meta.title {
            result = result.replace("{{title}}", title);
            result = result.replace("{{ title }}", title);
        }
        for (key, value) in &self.meta.extra {
            result = result.replace(&format!("{{{{{}}}}}", key), value);
            result = result.replace(&format!("{{{{ {} }}}}", key), value);
        }
        result
    }
}

#[derive(Debug, Clone)]
pub enum Node {
    File(FileNode),
    Dir(DirNode),
}

impl Node {
    pub fn name(&self) -> &str {
        match self {
            Node::File(f) => &f.name,
            Node::Dir(d) => &d.name,
        }
    }

    pub fn path(&self) -> &str {
        match self {
            Node::File(f) => &f.path,
            Node::Dir(d) => &d.path,
        }
    }
}

#[derive(Debug, Clone)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub page: Page,
}

#[derive(Debug, Clone)]
pub struct DirNode {
    pub name: String,
    pub path: String,
    pub children: Vec<Node>,
}

impl DirNode {
    pub fn new(name: String, path: String) -> Self {
        Self {
            name,
            path,
            children: Vec::new(),
        }
    }

    pub fn add_child(&mut self, node: Node) {
        self.children.push(node);
    }

    pub fn get_child_mut(&mut self, name: &str) -> Option<&mut DirNode> {
        for child in &mut self.children {
            if let Node::Dir(d) = child {
                if d.name == name {
                    return Some(d);
                }
            }
        }
        None
    }
}

pub fn load_page_content(full_path: &Path, relative_path: &str) -> Page {
    let raw = fs::read_to_string(full_path)
        .unwrap_or_else(|_| panic!("Error: Chapter file not found: {:?}", full_path));

    let parsed = parse_markdown(&raw);

    Page {
        meta: parsed.frontmatter,
        content: parsed.html_content,
        raw_path: relative_path.to_string(),
    }
}

pub fn build_site_tree(config: &Config, content_root: &Path) -> DirNode {
    let mut root = DirNode::new("root".to_string(), "".to_string());

    let index_path = content_root.join("index.md");
    if index_path.exists() {
        let page_obj = load_page_content(&index_path, "index.md");
        let file_node = FileNode {
            name: "index.md".to_string(),
            path: "index.md".to_string(),
            page: page_obj,
        };
        root.add_child(Node::File(file_node));
        println!("Loaded: index.md");
    }

    for chapter_path in &config.book.chapters {
        let clean_path = chapter_path.replace("\\", "/");
        let parts: Vec<&str> = clean_path.split('/').collect();

        if parts.is_empty() {
            continue;
        }

        let filename = parts.last().unwrap().to_string();
        let directories = &parts[0..parts.len() - 1];

        // mutable reference to the current directory node, starting at root
        let mut current_node = &mut root;
        let mut accumulated_path = String::new();

        for dir_name in directories {
            if !accumulated_path.is_empty() {
                accumulated_path.push('/');
            }
            accumulated_path.push_str(dir_name);

            // Si no existe el directorio hijo, lo creamos temporalmente
            let exists = current_node.get_child_mut(dir_name).is_some();
            if !exists {
                let new_dir = DirNode::new(dir_name.to_string(), accumulated_path.clone());
                current_node.add_child(Node::Dir(new_dir));
            }
            current_node = current_node.get_child_mut(dir_name).unwrap();
        }

        let full_sys_path = content_root.join(&clean_path);
        let page_obj = load_page_content(&full_sys_path, &clean_path);

        let file_node = FileNode {
            name: filename,
            path: clean_path.clone(),
            page: page_obj,
        };
        current_node.add_child(Node::File(file_node));
        println!("Loaded: {}", clean_path);
    }

    root
}

pub fn print_tree(node: &Node, level: usize) {
    let indent = "  ".repeat(level);
    let icon = match node {
        Node::Dir(_) => "📁",
        Node::File(_) => "📄",
    };
    println!("{}{} {}", indent, icon, node.name());

    if let Node::Dir(d) = node {
        for child in &d.children {
            print_tree(child, level + 1);
        }
    }
}
