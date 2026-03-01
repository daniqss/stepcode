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

pub mod generate;
pub mod parse;
pub mod tree;

use std::env;
use std::fs;
use std::path::Path;

fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        println!("Usage: stepcode <BOOK_DIR>");
        return Err("Invalid number of arguments".into());
    }

    let base_path = &args[1];
    let base_path_obj = Path::new(base_path);

    let config_path = base_path_obj.join("stepcode.toml");
    if !config_path.exists() {
        eprintln!("Error: config file not found at '{:?}'", config_path);
        std::process::exit(1);
    }

    let content = match fs::read_to_string(&config_path) {
        Ok(c) => c,
        Err(e) => return Err(format!("Error reading config file: {}", e).into()),
    };

    let config = match parse::parse_config(&content) {
        Ok(c) => c,
        Err(e) => return Err(format!("Error parsing config: {}", e).into()),
    };

    println!("Book: {} by {}\n", config.book.name, config.book.author);

    let site_tree = tree::build_site_tree(&config, base_path_obj);

    println!("resulting site tree");
    tree::print_tree(&tree::Node::Dir(site_tree.clone()), 0);

    generate::write_output(&site_tree, "dist", base_path);

    Ok(())
}
