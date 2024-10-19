use crate::structs::belong_type::BelongType;

pub struct SearchType {
    pub name: Option<String>,
    pub enname: Option<String>,
    pub belongto: Option<BelongType>,
}
