extern crate core;

use std::{io, net::SocketAddr, sync::Arc};
use std::path::PathBuf;

use axum::{
    extract::State,
    http::StatusCode,
    Json,
    response::{IntoResponse, Response},
    Router,
};
use axum::extract::DefaultBodyLimit;
use axum::handler::Handler;
use axum::routing::{get, get_service, post};
use handlebars::Handlebars;
use simd_json::json;
use tower_http::services::ServeDir;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::endpoints::thread::{thread_action_interaction_add_entry, thread_action_interaction_list_entries, thread_action_typing_add_entry, thread_action_typing_list_entries, thread_add_entry, thread_cookie_store_get, thread_cookie_store_set, thread_create, thread_find, thread_get_entries, thread_keychain_add_entry, thread_keychain_add_url_filter, thread_keychain_get_entry, thread_keychain_has_entry, thread_keychain_list_entries, thread_reconcile_cs, thread_xhrstream_add_entry, thread_xhrstream_list_entries};
use crate::endpoints::user::{user_create, user_find};
use crate::types::{DatistRepoError, DynDatistRepo, ThreadRepo};

mod repo;

mod endpoints;
mod types;

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "example_error_handling_and_dependency_injection=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let mut handlebars = Handlebars::new();

    if std::env::var("DEBUG").is_ok() {
        handlebars.set_strict_mode(true);
    }

    handlebars
        .register_template_file("index", PathBuf::from("templates/index.hbs"))
        .unwrap();

    handlebars
        .register_template_file("onboard", PathBuf::from("templates/onboard.hbs"))
        .unwrap();

    handlebars
        .register_template_file("base", PathBuf::from("templates/base.hbs"))
        .unwrap();

    let serve_dir = get_service(ServeDir::new("assets")).handle_error(handle_error);

    let db = rocksdb::DB::open_default("./db").unwrap();

    let user_repo = Arc::new(ThreadRepo {
        db: Arc::new(db),
    }) as DynDatistRepo;

    let app = Router::new()
        .route("/", get(index))
        .route("/onboard", get(onboard))
        .route("/user", post(user_create))
        .route("/u/:user_id", get(user_find))
        .route("/u/:user_id/t", post(thread_create))
        .route("/u/:user_id/t/:thread_id/trcs", get(thread_reconcile_cs))
        .route("/u/:user_id/t/:thread_id", get(thread_find))
        .route("/u/:user_id/t/:thread_id", post(thread_add_entry.layer(DefaultBodyLimit::max(1024 * 1024 * 10))))
        .route("/u/:user_id/t/:thread_id/:page", get(thread_get_entries))
        .route("/u/:user_id/t/:thread_id/k", post(thread_keychain_add_entry.layer(DefaultBodyLimit::max(1024 * 1024 * 10))))
        .route("/u/:user_id/t/:thread_id/k/get", post(thread_keychain_get_entry))
        .route("/u/:user_id/t/:thread_id/k/has", post(thread_keychain_has_entry))
        .route("/u/:user_id/t/:thread_id/k/:page", get(thread_keychain_list_entries))
        .route("/u/:user_id/t/:thread_id/k/uf", post(thread_keychain_add_url_filter))
        .route("/u/:user_id/tc/:thread_id", post(thread_cookie_store_set.layer(DefaultBodyLimit::max(1024 * 1024 * 30))))
        .route("/u/:user_id/tc/:thread_id/get", post(thread_cookie_store_get))
        .route("/u/:user_id/tx/:thread_id", post(thread_xhrstream_add_entry.layer(DefaultBodyLimit::max(1024 * 1024 * 50))))
        .route("/u/:user_id/tx/:thread_id/:page", get(thread_xhrstream_list_entries))
        .route("/u/:user_id/at/:thread_id", post(thread_action_typing_add_entry.layer(DefaultBodyLimit::max(1024 * 1024 * 50))))
        .route("/u/:user_id/at/:thread_id/:page", get(thread_action_typing_list_entries))
        .route("/u/:user_id/ct/:thread_id", post(thread_action_interaction_add_entry.layer(DefaultBodyLimit::max(1024 * 1024 * 50))))
        .route("/u/:user_id/ct/:thread_id/:page", get(thread_action_interaction_list_entries))
        .nest_service("/assets", serve_dir.clone())
        .fallback_service(serve_dir)
        .with_state((handlebars, user_repo));

    let listen_addr =
        std::env::var("LISTEN")
            .unwrap_or_else(|_|
                "127.0.0.1:3000".to_string()
            );

    let listen_addr: SocketAddr =
        listen_addr
        .parse()
        .expect("Unable to parse socket address");

    tracing::debug!("listening on {}", listen_addr);

    axum::Server::bind(&listen_addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn handle_error(_err: io::Error) -> impl IntoResponse {
    (StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong...")
}

async fn index(
    State((handlebars, _user_repo)): State<(Handlebars<'_>, DynDatistRepo)>,
) -> Result<Response<String>, AppError> {
    let response = handlebars
        .render("index", &json!({}))
        .map_err(|_| AppError::TemplateError)?;

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "text/html")
        .body(response)
        .unwrap())
}

async fn onboard(
    State((handlebars, _user_repo)): State<(Handlebars<'_>, DynDatistRepo)>,
) -> Result<Response<String>, AppError> {
    let response = handlebars
        .render("onboard", &json!({}))
        .map_err(|_| AppError::TemplateError)?;

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "text/html")
        .body(response)
        .unwrap())
}

pub enum AppError {
    UserRepo(DatistRepoError),
    TemplateError,
    AssetError,
}

impl From<DatistRepoError> for AppError {
    fn from(inner: DatistRepoError) -> Self {
        AppError::UserRepo(inner)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::UserRepo(DatistRepoError::NotFound) =>
                (StatusCode::NOT_FOUND, "Entity not found"),
            AppError::UserRepo(DatistRepoError::InvalidUsername) =>
                (StatusCode::UNPROCESSABLE_ENTITY, "Invalid username"),
            AppError::UserRepo(DatistRepoError::DbError) =>
                (StatusCode::INTERNAL_SERVER_ERROR, "RocksDB error"),
            AppError::UserRepo(DatistRepoError::SerializationError) =>
                (StatusCode::INTERNAL_SERVER_ERROR, "Serialization error"),
            AppError::UserRepo(DatistRepoError::InternalError) =>
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal error"),
            AppError::TemplateError => (StatusCode::INTERNAL_SERVER_ERROR, "Template error"),
            AppError::AssetError => (StatusCode::INTERNAL_SERVER_ERROR, "Asset error"),
        };

        let body = Json(json!({
            "error": error_message,
        }));

        (status, body).into_response()
    }
}

