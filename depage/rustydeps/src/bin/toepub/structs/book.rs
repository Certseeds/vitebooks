use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Book {
    pub chinese_name: String,
    pub english_name: String,
    pub r#type: String,
    pub authors: Vec<String>,
}
