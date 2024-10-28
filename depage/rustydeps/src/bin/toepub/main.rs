pub mod structs;
pub use crate::structs::meta::Meta;

use crate::structs::book::Book;
use clap::Parser;
use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Parser)]
#[command(name = "toepub")]
#[command(author = "Certseeds")]
#[command(version = "0.1")]
#[command(about = "a tool read epub.toml and pandoc path to epub", long_about = None)]
struct Cli {
    // 注意下面的注释是三个斜杠!!!
    /// use which method
    #[arg(short, long)]
    path: Option<String>,
}
const LONG_NOVEL: &str = "长篇小说";
const NOVEL_LIST: &str = "小说集";
const MID_NOVEL: &str = "中篇小说";
const SHORT_NOVEL: &str = "短篇小说";

fn main() {
    let cli = Cli::parse();
    let path = cli.path.unwrap_or_else(|| String::from("."));
    let exist_path = match check_path(path) {
        Some(meta) => meta,
        None => {
            return;
        }
    };
    println!("{:?}", exist_path);
    let meta = match parse_toml_to_object(exist_path.clone()) {
        Some(meta) => meta,
        None => {
            return;
        }
    };
    let files = meta_to_deal(meta.clone(), exist_path);
    toepub(meta.clone(), files);
}
pub fn toepub(meta: Meta, files: Vec<String>) {
    let mut args = Vec::new();
    args.push(String::from("--from=markdown-smart"));
    if cfg!(target_os = "windows") {
        args.push(String::from("--file-scope=true"));
    } else {
        args.push(String::from("--file-scope"));
    }
    args.push(format!("-o {}.epub", meta.book.chinese_name.clone()));
    args.extend(files);
    args.push(format!(
        "--metadata=title:{}",
        meta.book.chinese_name.clone()
    ));
    args.push(format!(
        "--metadata=author:\"{}\"",
        meta.book.authors.join(",")
    ));
    args.push(String::from("--metadata=language:zh-CN"));
    println!("{:?}", args);
    // Execute the `ls` command (or `dir` on Windows)
    let output = if cfg!(target_os = "windows") {
        Command::new("powershell")
            .arg("pandoc")
            .args(args)
            .output()
            .expect("failed to execute process")
    } else {
        Command::new("pandoc")
            .args(args)
            .output()
            .expect("failed to execute process")
    };

    // Check if the command was successful
    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        println!("Command output:\n{}", stdout);
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        eprintln!("Command failed:\n{}", stderr);
    }
    return;
}

pub fn meta_to_deal(meta: Meta, dir: PathBuf) -> Vec<String> {
    let type_name = meta.book.r#type.clone();
    if type_name == LONG_NOVEL {
        parse_long_novel(meta.clone(), dir)
    } else if type_name.ends_with(NOVEL_LIST) {
        return parse_novel_list(meta.clone(), dir);
    } else {
        println!("error type ");
        return vec![];
    }
}

pub fn parse_long_novel(_meta: Meta, path: PathBuf) -> Vec<String> {
    let mut results = Vec::new();
    results.push(String::from(path.join("organize.md").to_str().unwrap()));
    results.push(String::from(path.join("meta.md").to_str().unwrap()));
    results.push(String::from(path.join("base.md").to_str().unwrap()));
    let src_path = path.join("src");
    match fs::read_dir(&src_path) {
        Ok(entries) => {
            for entry in entries {
                match entry {
                    Ok(entry) => results.push(String::from(entry.path().to_str().unwrap())),
                    Err(e) => eprintln!("Error reading entry: {}", e),
                }
            }
        }
        Err(e) => eprintln!("Error reading directory: {}", e),
    }
    println!("{:?}", results);
    results
}

pub fn parse_novel_list(meta: Meta, path: PathBuf) -> Vec<String> {
    let mut results = Vec::new();
    results.push(String::from(path.join("organize.md").to_str().unwrap()));
    results.push(String::from(path.join("meta.md").to_str().unwrap()));
    results.push(String::from(path.join("base.md").to_str().unwrap()));
    for sub in meta.sub.unwrap() {
        let result = match sub.r#type.as_str() {
            MID_NOVEL => parse_mid_novel(sub.clone(), path.clone()),
            SHORT_NOVEL => parse_short_novel(sub.clone(), path.clone()),
            _ => {
                return vec![];
            }
        };
        results.extend_from_slice(result.as_slice());
    }
    println!("{:?}", results);
    results
}
pub fn parse_mid_novel(book: Book, path: PathBuf) -> Vec<String> {
    let mut results = Vec::new();
    let cn_name = book.chinese_name;
    let path = path.join(cn_name);
    if !path.exists() {
        return vec![];
    }
    results.push(String::from(path.join("meta.md").to_str().unwrap()));
    results.push(String::from(path.join("base.md").to_str().unwrap()));
    let src_path = path.join("src");
    match fs::read_dir(&src_path) {
        Ok(entries) => {
            for entry in entries {
                match entry {
                    Ok(entry) => results.push(String::from(entry.path().to_str().unwrap())),
                    Err(e) => eprintln!("Error reading entry: {}", e),
                }
            }
        }
        Err(e) => eprintln!("Error reading directory: {}", e),
    }
    println!("{:?}", results);
    results
}
pub fn parse_short_novel(book: Book, path: PathBuf) -> Vec<String> {
    let mut results = Vec::new();
    let cn_name = book.chinese_name;
    let path = path.join(cn_name);
    if !path.exists() {
        return vec![];
    }
    results.push(String::from(path.join("meta.md").to_str().unwrap()));
    results.push(String::from(path.join("base.md").to_str().unwrap()));
    results.push(String::from(path.join("src.md").to_str().unwrap()));
    println!("{:?}", results);
    results
}

pub fn check_path(path: String) -> Option<PathBuf> {
    Some(Path::new(path.as_str()).to_path_buf())
}

pub fn parse_toml_to_object(dir: PathBuf) -> Option<Meta> {
    let toml_path = dir.join("meta.toml");
    println!("toml_path is {:?}", toml_path);
    let file = File::open(toml_path);
    if let Err(e) = file {
        eprintln!("error is {}", e);
        return None;
    }
    let mut file = file.unwrap();

    let mut buffer = String::new();
    if let Err(e) = file.read_to_string(&mut buffer) {
        eprintln!("error is {}", e);
        return None;
    }
    let meta = match toml::from_str::<Meta>(buffer.as_str()) {
        Ok(meta) => meta,
        Err(e) => {
            eprintln!("error is {}", e);
            return None;
        }
    };
    println!("{:?}", meta);
    Some(meta)
}
