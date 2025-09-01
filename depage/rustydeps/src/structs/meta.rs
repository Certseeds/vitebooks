// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

use crate::structs::book::Book;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Meta {
    pub book: Book,
    pub sub: Option<Vec<Book>>,
}
