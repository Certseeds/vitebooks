const PKG_NAME: &str = env!("CARGO_PKG_NAME");
const PKG_VERSION: &str = env!("CARGO_PKG_VERSION");
const PKG_DESCRIPTION: &str = env!("CARGO_PKG_DESCRIPTION");
const PKG_AUTHORS: &str = env!("CARGO_PKG_AUTHORS");
const PKG_REPOSITORY: &str = env!("CARGO_PKG_REPOSITORY");

pub fn output_string() -> String {
    let string = format!(
        "
support by
PKG_NAME: {}
PKG_VERSION: {}
PKG_DESCRIPTION: {}
PKG_AUTHORS: {}
PKG_REPOSITORY: {}
        ",
        PKG_NAME, PKG_VERSION, PKG_DESCRIPTION, PKG_AUTHORS, PKG_REPOSITORY
    );
    string
}
