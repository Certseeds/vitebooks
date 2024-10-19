use crate::structs::book::Book;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Meta {
    pub book: Book,
    pub sub: Option<Vec<Book>>,
}
