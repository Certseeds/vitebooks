use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct PMeta {
    pub pre: Option<Vec<String>>,
    pub post: Option<Vec<String>>,
}
