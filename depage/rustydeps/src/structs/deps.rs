// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

use crate::structs::belong_type;
use crate::structs::search_type::SearchType;

use crate::Series;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Clone, Serialize)]
#[serde(untagged)]
pub enum Deps {
    Name(String),
    NameMap {
        name: Option<String>,
        #[serde(rename = "enname")]
        english_name: Option<String>,
        #[serde(rename = "series")]
        series: Option<Series>,
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
                series: None,
            },
            Deps::NameMap {
                name,
                english_name,
                belong,
                series,
            } => SearchType {
                name,
                enname: english_name,
                series: if let Some(series) = series {
                    Some(series)
                } else if let Some(belong) = belong {
                    belong.series
                } else {
                    None
                },
            },
        }
    }
}
