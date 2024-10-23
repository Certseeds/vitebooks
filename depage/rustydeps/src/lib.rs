pub mod structs;
pub use crate::structs::belong_type;
pub use crate::structs::book::Book;
pub use crate::structs::deps::Deps;
pub use crate::structs::meta::Meta;
pub use crate::structs::search_type::SearchType;
pub use crate::structs::series::Series;
use serde_json;
use std::collections::HashMap;
use std::io::{Cursor, Read};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub fn outer_function_from_cn(content: &[u8], chinese_name: String) -> String {
    let books = parse_u8_to_books(Vec::from(content));
    let result = parse_book_dependencies(
        books,
        SearchType {
            name: Some(chinese_name),
            enname: None,
            belongto: None,
        },
    );
    let response = serde_json::to_string(&result);
    response.unwrap()
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
                    Err(E) => {
                        eprintln!("error is {}", E);
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
                Some(resultBook) => {
                    println!("book is {:?}", resultBook);
                    results
                        .get_mut(0)
                        .unwrap()
                        .push(resultBook.chinese_name.clone());
                    match resultBook.recommended_reading.clone() {
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
                            results.extend(rec_results);
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
                    let enname_extend = enname + "-暂未收录`";
                    results.get_mut(0).unwrap().push(enname_extend);
                    return results;
                }
                Some(resultBook) => {
                    let cnname_extend = resultBook.clone().chinese_name + "-暂未收录";
                    match search_type.belongto {
                        None => {
                            results.get_mut(0).unwrap().push(cnname_extend);
                            return results;
                        }
                        Some(belongto) => match &resultBook.series {
                            None => {
                                results.get_mut(0).unwrap().push(cnname_extend);
                                return results;
                            }
                            Some(series) => {
                                if let Some(series_in) = belongto.series {
                                    if series_in.hashcode() != series.hashcode() {
                                        results.get_mut(0).unwrap().push(cnname_extend);
                                        return results;
                                    }
                                }
                            }
                        },
                    }

                    results
                        .get_mut(0)
                        .unwrap()
                        .push(resultBook.chinese_name.clone());
                    match resultBook.recommended_reading.clone() {
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
                            results.extend(rec_results);
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
        assert_eq!(1, 1);
        match read_file_to_u8("./meta.tar") {
            Err(E) => {
                eprintln!("output error {}", E);
            }
            Ok(vec) => {
                let result = outer_function_from_cn(vec.as_slice(), String::from("无所畏惧"));
                println!("{:?}", result)
            }
        }
    }
}
