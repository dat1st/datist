use std::collections::{BTreeSet, HashSet};
use axum::extract::{Path, State};
use axum::Json;
use axum::response::IntoResponse;
use handlebars::Handlebars;
use url::Host;
use uuid::Uuid;

use crate::AppError;
use crate::types::{CookieStore, DynDatistRepo, KeychainEntry, ThreadEntry, ThreadXhrStreamEntry};

pub async fn thread_create(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path(user_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let thread = repo.thread_create(user_id).await?;

    println!("Created thread for user {}: {:?}", user_id, thread);

    Ok(Json(thread))
}

pub async fn thread_find(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    println!("Finding thread for user {}: {}", user_id, thread_id);

    Ok(
        Json(
            repo.thread_find(
                user_id,
                thread_id,
            ).await?
        )
    )
}

pub async fn thread_add_entry(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
    Json(data): Json<ThreadEntry>,
) -> Result<impl IntoResponse, AppError> {
    println!("Adding thread entry for user {}: {}", user_id, thread_id);

    repo.thread_add_entry(user_id, thread_id, data).await?;

    Ok(Json("ok"))
}

pub async fn thread_get_entries(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id, page)): Path<(Uuid, Uuid, u32)>,
) -> Result<impl IntoResponse, AppError> {
    println!("Finding thread entries for user {}: {} page {}", user_id, thread_id, page);

    Ok(
        Json(
            repo.thread_get_entries(
                user_id,
                thread_id,
                page,
            ).await?
        )
    )
}

pub async fn thread_keychain_add_entry(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
    Json(data): Json<KeychainEntry>,
) -> Result<impl IntoResponse, AppError> {
    println!("Finding thread for user {}: {}", user_id, thread_id);

    repo.thread_keychain_add_entry(
        user_id,
        thread_id,
        data,
    ).await?;

    Ok(Json("ok"))
}

pub async fn thread_keychain_list_entries(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id, page)): Path<(Uuid, Uuid, u32)>,
) -> Result<impl IntoResponse, AppError> {
    println!("Finding thread keychain entries for user {}: {} page {}", user_id, thread_id, page);

    Ok(
        Json(
            repo.thread_keychain_list_entries(
                user_id,
                thread_id,
                page,
            ).await?
        )
    )
}

pub async fn thread_keychain_get_entry(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
    Json(data): Json<String>,
) -> Result<impl IntoResponse, AppError> {
    println!("Getting thread keychain entry {} for user {}: {}", &data, user_id, thread_id);

    Ok(
        Json(
            repo.thread_keychain_get_entry(
                user_id,
                thread_id,
                data,
            ).await?,
        ),
    )
}

pub async fn thread_keychain_has_entry(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
    Json(data): Json<String>,
) -> Result<impl IntoResponse, AppError> {
    println!("Getting thread keychain entry {} for user {}: {}", &data, user_id, thread_id);

    Ok(
        Json(
            repo.thread_keychain_has_entry(
                user_id,
                thread_id,
                data,
            ).await?,
        ),
    )
}

pub async fn thread_keychain_add_url_filter(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
    Json(data): Json<Vec<String>>,
) -> Result<impl IntoResponse, AppError> {
    println!("Adding keychain url filter for user {}: {} - {:?}", user_id, thread_id, data);

    for url in data {
        repo.thread_keychain_add_url_filter(
            user_id,
            thread_id,
            url,
        ).await?;
    }

    Ok(Json("ok"))
}

pub async fn thread_cookie_store_set(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
    Json(cookie_store): Json<CookieStore>,
) -> Result<impl IntoResponse, AppError> {
    println!("Setting thread cookie store for user {}: {}", user_id, thread_id);

    repo.thread_cookie_store_set(
        user_id,
        thread_id,
        cookie_store,
    ).await?;

    Ok(Json("ok"))
}

pub async fn thread_cookie_store_get(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    println!("Getting thread cookie store for user {}: {}", user_id, thread_id);

    Ok(
        Json(
            repo.thread_cookie_store_get(
                user_id,
                thread_id,
            ).await?
        )
    )
}

pub async fn thread_xhrstream_add_entry(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
    Json(data): Json<ThreadXhrStreamEntry>,
) -> Result<impl IntoResponse, AppError> {
    println!("Adding thread xhrstream entry for user {}: {}", user_id, thread_id);

    repo.thread_xhrstream_add_entry(
        user_id,
        thread_id,
        data,
    ).await?;

    Ok(Json("ok"))
}

pub async fn thread_xhrstream_list_entries(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id, page)): Path<(Uuid, Uuid, u32)>,
) -> Result<impl IntoResponse, AppError> {
    println!("Finding thread xhrstream entries for user {}: {} page {}", user_id, thread_id, page);

    Ok(
        Json(
            repo.thread_xhrstream_list_entries(
                user_id,
                thread_id,
                page,
            ).await?
        )
    )
}

pub async fn thread_reconcile_cs(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path((user_id, thread_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    let mut urls = BTreeSet::new();

    let mut page = 0;
    let mut has_entries = true;

    while has_entries {
        let entries =
            repo.thread_get_entries(
                user_id,
                thread_id,
                page,
            ).await?;

        for entry in entries.iter() {
            let origin = url::Url::parse(&entry.url);

            if origin.is_err() {
                continue;
            }

            let origin = origin.unwrap();

            match origin.host() {
                Some(Host::Domain(domain)) => {
                    urls.insert(format!("{}://{}/", origin.scheme(), domain));
                },
                _ => {},
            }
        }

        has_entries = entries.len() > 0;

        page += 1;
    }

    Ok(
        Json(
            urls,
        )
    )
}