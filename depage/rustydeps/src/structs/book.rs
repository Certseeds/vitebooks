use crate::structs::deps::Deps;
use crate::structs::series::Series;
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Book {
    pub chinese_name: String,
    pub english_name: String,
    pub r#type: String,
    pub series: Option<Series>,
    pub authors: Vec<String>,
    pub recommended_reading: Option<Vec<Deps>>,
    pub faction_keywords: Option<Vec<String>>,
}
