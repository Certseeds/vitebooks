// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct PMeta {
    pub pre: Option<Vec<String>>,
    pub post: Option<Vec<String>>,
}
