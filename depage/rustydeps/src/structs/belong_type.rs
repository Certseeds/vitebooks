// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

use crate::structs::series;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct BelongType {
    pub name: Option<String>,
    #[serde(rename = "enname")]
    pub english_name: Option<String>,
    pub series: Option<series::Series>,
}
