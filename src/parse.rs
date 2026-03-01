use pulldown_cmark::{Parser, html};
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize, Default)]
pub struct Config {
    pub book: BookConfig,
}

#[derive(Debug, Deserialize, Default)]
pub struct BookConfig {
    pub name: String,
    pub author: String,
    pub chapters: Vec<String>,
}

#[derive(Debug, Deserialize, Default, Clone)]
pub struct Frontmatter {
    pub title: Option<String>,
    #[serde(flatten)]
    pub extra: HashMap<String, String>,
}

/// parse the configuration from a TOML string
pub fn parse_config(content: &str) -> Result<Config, toml::de::Error> {
    toml::from_str(content)
}

pub struct ParsedMarkdown {
    pub frontmatter: Frontmatter,
    pub html_content: String,
}

/// parse markdown content, extracting frontmatter and converting the markdown to HTML
pub fn parse_markdown(content: &str) -> ParsedMarkdown {
    let mut frontmatter = Frontmatter::default();
    let mut markdown_content = content;

    if content.starts_with(
        "---
",
    ) || content.starts_with(
        "---
",
    ) {
        if let Some(end_idx) = content[4..]
            .find(
                "---
",
            )
            .map(|i| i + 4)
            .or_else(|| {
                content[4..]
                    .find(
                        "---
",
                    )
                    .map(|i| i + 4)
            })
        {
            let fm_text = &content[4..end_idx];
            if let Ok(fm) = serde_yaml::from_str::<Frontmatter>(fm_text) {
                frontmatter = fm;
            }
            // skip past the frontmatter and the closing '---'
            markdown_content = &content[end_idx + 4..];
        }
    }

    // parse markdown to HTML
    let mut options = pulldown_cmark::Options::empty();
    options.insert(pulldown_cmark::Options::ENABLE_TABLES);
    options.insert(pulldown_cmark::Options::ENABLE_STRIKETHROUGH);
    options.insert(pulldown_cmark::Options::ENABLE_TASKLISTS);
    let parser = Parser::new_ext(markdown_content, options);
    let mut html_content = String::new();
    html::push_html(&mut html_content, parser);

    ParsedMarkdown {
        frontmatter,
        html_content,
    }
}
