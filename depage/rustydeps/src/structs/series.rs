use serde::{Deserialize, Serialize};
use std::hash::{DefaultHasher, Hash, Hasher};

#[derive(Debug, Deserialize, Clone, Hash, Eq, PartialEq, Serialize)]
pub struct Series {
    pub name: String,
    pub order: i64,
}
impl Series {
    pub fn hashcode(&self) -> u64 {
        let mut s = DefaultHasher::new();
        self.name.hash(&mut s);
        self.order.hash(&mut s);
        let hashcode = s.finish();
        hashcode
    }
}
