// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Book {
    pub chinese_name: String,
    pub english_name: String,
    pub r#type: String,
    pub authors: Vec<String>,
}
