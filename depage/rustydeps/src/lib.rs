pub mod metas;
pub mod structs;
pub use crate::metas::meta;
pub use crate::structs::belong_type;
pub use crate::structs::book::Book;
pub use crate::structs::deps::Deps;
pub use crate::structs::meta::Meta;
pub use crate::structs::search_type::SearchType;
pub use crate::structs::series::Series;
use serde_json;
use std::collections::{BTreeMap, HashMap, HashSet};
use std::io::{Cursor, Read};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert(&format!("Hello, {}!", meta::output_string()));
}

#[wasm_bindgen]
pub fn outer_function_from_cn(content: &[u8], chinese_name: String) -> String {
    let books = parse_u8_to_books(Vec::from(content));
    let result = parse_book_dependencies(
        books,
        SearchType {
            name: Some(chinese_name),
            enname: None,
            series: None,
        },
    );
    let response = serde_json::to_string(&result);
    response.unwrap()
}

#[wasm_bindgen]
pub fn get_authors(content: &[u8]) -> String {
    let books = parse_u8_to_books(Vec::from(content));
    let result = author::authors(books);
    let response = serde_json::to_string(&result);
    response.unwrap()
}

#[wasm_bindgen]
pub fn get_author_books(content: &[u8], author_name: String) -> String {
    let books = parse_u8_to_books(Vec::from(content));
    let result = author::author_books(books, author_name);
    let response = serde_json::to_string(&result);
    response.unwrap()
}

#[wasm_bindgen]
pub fn get_faction_keywords(content: &[u8]) -> String {
    let books = parse_u8_to_books(Vec::from(content));
    let result = faction_keywords::keywords(books);
    let response = serde_json::to_string(&result);
    response.unwrap()
}

#[wasm_bindgen]
pub fn get_faction_keywords_map(content: &[u8]) -> String {
    let books = parse_u8_to_books(Vec::from(content));
    let result = faction_keywords::keywords_books(books);
    let response = serde_json::to_string(&result);
    response.unwrap()
}

mod author {
    use crate::Book;
    use std::collections::HashMap;

    pub fn authors(books: Vec<Book>) -> HashMap<String, i32> {
        let mut authors: HashMap<String, i32> = HashMap::new();
        for book in books {
            for author in book.authors {
                if let Some(count) = authors.get_mut(&author) {
                    *count += 1;
                } else {
                    authors.insert(author, 1);
                }
            }
        }
        authors
    }
    pub fn author_books(books: Vec<Book>, author_name: String) -> Vec<String> {
        let mut author_books: Vec<String> = Vec::new();
        for book in books {
            for author in book.clone().authors {
                if author == author_name {
                    author_books.push(book.clone().chinese_name);
                }
            }
        }
        author_books
    }
}

mod faction_keywords {
    use crate::Book;
    use std::collections::HashMap;
    pub fn keywords(books: Vec<Book>) -> HashMap<String, i32> {
        let mut keywords_map: HashMap<String, i32> = HashMap::new();
        for book in books {
            if let Some(keywords) = book.faction_keywords {
                for keyword in keywords {
                    if let Some(count) = keywords_map.get_mut(&keyword) {
                        *count += 1;
                    } else {
                        keywords_map.insert(keyword, 1);
                    }
                }
            }
        }
        keywords_map
    }

    // 但是这个我想用一个不同的方式, 输入是一个Vec<Book>, 输出一个Map<KeyWord,Vec<Book>>
    // 返回上层后, 按不同的keyword对应Vec<Book>的交集进行输出.
    pub fn keywords_books(books: Vec<Book>) -> HashMap<String, Vec<Book>> {
        let mut keyword_to_contained_books: HashMap<String, Vec<Book>> = HashMap::new();
        for book in books {
            if let Some(keywords) = book.clone().faction_keywords {
                for keyword in keywords {
                    if let Some(books) = keyword_to_contained_books.get_mut(&keyword) {
                        books.push(book.clone());
                    } else {
                        keyword_to_contained_books.insert(keyword, vec![book.clone()]);
                    }
                }
            }
        }
        keyword_to_contained_books
    }
}

pub fn parse_u8_to_books(chars: Vec<u8>) -> Vec<Book> {
    let reader = Cursor::new(chars);
    let mut tar = tar::Archive::new(reader);
    let mut books_collection: Vec<Book> = Vec::new();
    for entry in tar.entries().unwrap() {
        match entry {
            Ok(mut entry) => {
                // 获取文件路径
                match entry.path() {
                    Ok(path) => println!("File: {}", path.display()),
                    Err(e) => println!("Error getting path: {}", e),
                }
                // 如果需要，可以读取文件内容
                let mut content = Vec::new();
                if let Err(e) = entry.read_to_end(&mut content) {
                    println!("Error reading content: {}", e);
                } else {
                    println!("Content length: {:?}", content);
                }
                match toml::from_str::<Meta>(std::str::from_utf8(&content).unwrap()) {
                    Err(e) => {
                        eprintln!("error is {}", e);
                    }
                    Ok(mut book) => {
                        println!("parse book meta success");
                        match &mut book.sub {
                            None => {}
                            Some(subs) => {
                                for sub in subs {
                                    println!("{:?}", sub);
                                    let sub = match &book.book.series {
                                        None => {
                                            continue;
                                        }
                                        Some(ser) => {
                                            sub.series = Some(ser.clone());
                                            sub
                                        }
                                    };
                                    books_collection.push(sub.clone());
                                }
                            }
                        };
                        println!("book details is {:?}", book);
                        books_collection.push(book.book.clone());
                    }
                };
            }
            Err(e) => println!("Error reading entry: {}", e),
        }
    }
    for book in books_collection.clone() {
        println!("print ln each book is {:?}", book)
    }
    books_collection
}

fn merge_vecs(vecs: Vec<Vec<Vec<String>>>) -> Vec<Vec<String>> {
    let mut merged_vecs: Vec<Vec<String>> = Vec::new();
    // 合并每一列
    for vec in vecs {
        for (i, inner_vec) in vec.into_iter().enumerate() {
            // 如果结果向量的长度不足以容纳当前列，则扩展它
            if i >= merged_vecs.len() {
                merged_vecs.push(Vec::new());
            }
            merged_vecs[i].extend(inner_vec);
        }
    }
    merged_vecs
}

fn remove_repeat_from_start_to_end(vecs: Vec<Vec<String>>) -> Vec<Vec<String>> {
    let mut pre_books: HashMap<String, bool> = HashMap::new();
    let mut book_index = BTreeMap::new();
    for (i, vec) in vecs.iter().enumerate() {
        book_index.insert(i, vec.clone());
    }
    for (i, vec) in vecs.iter().enumerate() {
        for book in vec {
            pre_books.insert(book.clone(), true);
        }
        for (j, vec) in vecs.iter().enumerate().skip(i + 1) {
            let new_vec: Vec<String> = vec
                .iter()
                .filter(|book| !pre_books.contains_key(*book))
                .cloned()
                .collect();
            book_index.insert(j, new_vec);
        }
    }

    let return_values = book_index
        .into_iter()
        .map(|(_, y)| y)
        .filter(|x| !x.is_empty())
        .map(|x| {
            let set: HashSet<_> = x.into_iter().collect();
            set.into_iter().collect()
        })
        .collect();

    return_values
}

// 查找时可以用
// 中文名
// 英文名+ belong-series信息
// 当然, 更多最好, 但是只会用必要的进行查询

fn parse_book_dependencies(books: Vec<Book>, search_type: SearchType) -> Vec<Vec<String>> {
    let mut cn_map: HashMap<String, Book> = HashMap::new();
    let mut en_map: HashMap<String, Book> = HashMap::new();
    let mut series_map: HashMap<u64, Book> = HashMap::new();
    let mut results: Vec<Vec<String>> = Vec::new();
    for book in books.clone() {
        cn_map.insert(book.chinese_name.clone(), book.clone());
        en_map.insert(book.english_name.clone(), book.clone());
        match &book.series {
            None => {}
            Some(s) => {
                series_map.insert(s.hashcode(), book.clone());
            }
        }
    }
    match search_type.name {
        None => {}
        Some(chinese_name) => {
            let book = cn_map.get(&chinese_name);
            results.push(Vec::new());
            match book {
                None => {
                    println!("暂未收录 {}", chinese_name);
                    let enname_extend = chinese_name + "-暂未收录";
                    results.get_mut(0).unwrap().push(enname_extend);
                    return results;
                }
                Some(result_book) => {
                    println!("book is {:?}", result_book);
                    results
                        .get_mut(0)
                        .unwrap()
                        .push(result_book.chinese_name.clone());
                    match result_book.recommended_reading.clone() {
                        None => {}
                        Some(recommendeds) => {
                            let mut recs: Vec<Vec<Vec<String>>> = Vec::new();
                            for recommended in recommendeds {
                                let search_type2 = recommended.to_search_type();
                                let rec = parse_book_dependencies(books.clone(), search_type2);
                                println!("rec invoke result is: {:?}", rec);
                                recs.push(rec);
                            }
                            let rec_results = merge_vecs(recs);
                            let filter_results = remove_repeat_from_start_to_end(rec_results);
                            results.extend(filter_results);
                        }
                    }
                }
            };
        }
    }
    match search_type.enname {
        None => {}
        Some(enname) => {
            let book = en_map.get(&enname);
            results.push(Vec::new());

            match book {
                None => {
                    println!("暂未收录 {}", enname);
                    let enname_extend = enname + "-暂未收录";
                    results.get_mut(0).unwrap().push(enname_extend);
                    return results;
                }
                Some(result_book) => {
                    let cnname_extend = result_book.clone().chinese_name + "-暂未收录";
                    match search_type.series {
                        None => {
                            results.get_mut(0).unwrap().push(cnname_extend);
                            return results;
                        }
                        Some(series_out) => match &result_book.series {
                            None => {
                                results.get_mut(0).unwrap().push(cnname_extend);
                                return results;
                            }
                            Some(series) => {
                                if series_out.hashcode() != series.hashcode() {
                                    results.get_mut(0).unwrap().push(cnname_extend);
                                    return results;
                                }
                            }
                        },
                    }

                    results
                        .get_mut(0)
                        .unwrap()
                        .push(result_book.chinese_name.clone());
                    match result_book.recommended_reading.clone() {
                        None => {}
                        Some(recommenders) => {
                            let mut recs: Vec<Vec<Vec<String>>> = Vec::new();
                            for recommended in recommenders {
                                let search_type2 = recommended.to_search_type();
                                let rec = parse_book_dependencies(books.clone(), search_type2);
                                println!("rec invoke result is: {:?}", rec);
                                recs.push(rec);
                            }
                            let rec_results = merge_vecs(recs);
                            let filter_results = remove_repeat_from_start_to_end(rec_results);
                            results.extend(filter_results);
                        }
                    }
                }
            }
        }
    }
    results
}
#[cfg(test)]
mod tests {
    pub use crate::metas::meta;
    use crate::outer_function_from_cn;
    use std::fs::File;
    use std::io::{self, Read};
    fn read_file_to_u8(path: &str) -> io::Result<Vec<u8>> {
        let mut file = File::open(path)?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer)?;
        Ok(buffer)
    }
    #[test]
    fn test_method() {
        println!("{}", meta::output_string());
        assert_eq!(1, 1);
        match read_file_to_u8("./meta.tar") {
            Err(e) => {
                eprintln!("output error {}", e);
            }
            Ok(vec) => {
                let result = outer_function_from_cn(vec.as_slice(), String::from("法洛斯"));
                println!("{:?}", result)
            }
        }
    }
    #[test]
    fn test_authors() {
        use crate::{get_author_books, get_authors};
        println!("{}", meta::output_string());
        assert_eq!(1, 1);
        match read_file_to_u8("./meta.tar") {
            Err(e) => {
                eprintln!("output error {}", e);
            }
            Ok(vec) => {
                let result = get_authors(vec.as_slice());
                let book_names = get_author_books(vec.as_slice(), String::from("Nick Kyme"));
                println!("{:?}", result);
                println!("{:?}", book_names);
            }
        }
    }
    #[test]
    fn test_keywords() {
        use crate::{get_faction_keywords, get_faction_keywords_map};
        println!("{}", meta::output_string());
        assert_eq!(1, 1);
        match read_file_to_u8("./meta.tar") {
            Err(e) => {
                eprintln!("output error {}", e);
            }
            Ok(vec) => {
                let result = get_faction_keywords(vec.as_slice());
                let book_names = get_faction_keywords_map(vec.as_slice());
                println!("{:?}", result);
                println!("{:?}", book_names);
            }
        }
    }
}
