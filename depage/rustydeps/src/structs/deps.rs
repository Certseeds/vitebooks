use crate::structs::belong_type;
use crate::structs::search_type::SearchType;

use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
#[serde(untagged)]
pub enum Deps {
    Name(String),
    NameMap {
        name: Option<String>,
        #[serde(rename = "enname")]
        english_name: Option<String>,
        #[serde(rename = "belongto")]
        belong: Option<belong_type::BelongType>,
    },
}
impl Deps {
    pub fn to_search_type(self) -> SearchType {
        match self {
            Deps::Name(name) => SearchType {
                name: Some(name),
                enname: None,
                belongto: None,
            },
            Deps::NameMap {
                name,
                english_name,
                belong,
            } => SearchType {
                name,
                enname: english_name,
                belongto: belong,
            },
        }
    }
}
