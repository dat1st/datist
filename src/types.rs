use std::sync::Arc;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::repo::DatistRepo;

pub struct ThreadRepo {
    pub db: Arc<rocksdb::DB>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ThreadEntry {
    pub url: String,
    pub data: ThreadPayload,
    pub created_utc: Option<u128>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ThreadXhrStreamEntry {
    pub url: String,
    pub data: ThreadXhrStreamPayload,
    pub created_utc: Option<u128>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ThreadXhrStreamPayload {
    pub raw: Option<Vec<String>>,
    pub formData: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ThreadPayload {
    pub h: Vec<(String, String)>,
    pub c: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct KeychainEntry {
    pub url: String,
    pub data: KeychainPayload,
    pub created_utc: Option<u128>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct KeychainListEntry {
    pub url: String,
    pub created_utc: Option<u128>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct KeychainPayload {
    pub a: A,
    pub b: Vec<String>,
    pub c: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct A {
    pub l: std::collections::HashMap<String, String>,
    pub s: std::collections::HashMap<String, String>,
}

pub type DynDatistRepo = Arc<dyn DatistRepo + Send + Sync>;

#[derive(Debug, Deserialize, Serialize)]
pub struct Thread {
    pub id: Uuid,
    pub created_at: u128,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct User {
    pub id: Uuid,
    pub created_at: u128,
}

pub type CookieStore = Vec<Cookie>;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Cookie {
    pub domain: String,
    pub expiration_date: Option<f64>,
    pub host_only: bool,
    pub http_only: bool,
    pub name: String,
    pub path: String,
    pub same_site: String,
    pub secure: bool,
    pub session: bool,
    pub store_id: String,
    pub value: String,
}

/// Errors that can happen when using the user repo.
#[derive(Debug)]
pub enum DatistRepoError {
    #[allow(dead_code)]
    NotFound,
    #[allow(dead_code)]
    InvalidUsername,
    #[allow(dead_code)]
    InternalError,
    #[allow(dead_code)]
    SerializationError,
    #[allow(dead_code)]
    DbError,
}