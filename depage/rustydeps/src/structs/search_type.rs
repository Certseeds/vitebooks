// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

use crate::Series;

pub struct SearchType {
    pub name: Option<String>,
    pub enname: Option<String>,
    pub series: Option<Series>,
}
