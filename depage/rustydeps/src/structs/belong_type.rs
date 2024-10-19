use crate::structs::series;
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct BelongType {
    pub name: Option<String>,
    #[serde(rename = "enname")]
    pub english_name: Option<String>,
    pub series: Option<series::Series>,
}
