#[cfg(test)]
mod tests {
    use std::fs::File;
    use std::io::{self, Cursor, Read};

    fn read_file_to_u8(path: &str) -> io::Result<Vec<u8>> {
        let mut file = File::open(path)?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer)?;
        Ok(buffer)
    }

    fn parse_u8_to_tar_file(chars: Vec<u8>) -> tar::Archive<Cursor<Vec<u8>>> {
        // 示例 Vec<u8> 表示的 TAR 文件

        // 使用 Cursor 将 Vec<u8> 转换为一个实现 Read trait 的对象
        let cursor = Cursor::new(chars);

        // 创建一个 tar::Archive 实例
        let mut archive = tar::Archive::new(cursor);
        for entry in archive.entries().unwrap() {
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
                        println!("Content length: {}", content.len());
                        println!("Content is {:?}", content);
                    }
                }
                Err(e) => println!("Error reading entry: {}", e),
            }
        }
        archive
    }
    #[test]
    fn test_method() {
        assert_eq!(1, 1);
        match read_file_to_u8("./meta.tar") {
            Err(E) => {
                eprintln!("output error {}", E);
            }
            Ok(vec) => {}
        }
    }
    #[test]
    fn test_method2() {
        // 示例数据
        let vec1 = vec![
            vec!["a".to_string(), "b".to_string()],
            vec!["c".to_string(), "d".to_string()],
        ];
        let vec2 = vec![
            vec!["e".to_string(), "f".to_string()],
            vec!["g".to_string()],
        ];
        let vec3 = vec![vec!["i".to_string(), "j".to_string()]];

        let two_vec = vec![vec3, vec2, vec1];

        // 初始化结果向量
        let mut merged_vecs: Vec<Vec<String>> = Vec::new();

        // 合并每一列
        for vec in two_vec {
            for (i, inner_vec) in vec.into_iter().enumerate() {
                // 如果结果向量的长度不足以容纳当前列，则扩展它
                if i >= merged_vecs.len() {
                    merged_vecs.push(Vec::new());
                }
                merged_vecs[i].extend(inner_vec);
            }
        }

        // 打印结果
        for (i, merged) in merged_vecs.iter().enumerate() {
            println!("Merged column {}: {:?}", i, merged);
        }
    }
}
