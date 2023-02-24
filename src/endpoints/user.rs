use axum::extract::{Path, State};
use axum::Json;
use axum::response::IntoResponse;
use handlebars::Handlebars;
use uuid::Uuid;

use crate::AppError;
use crate::types::DynDatistRepo;

pub async fn user_create(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
) -> Result<impl IntoResponse, AppError> {
    let user = repo.user_create().await?;

    println!("Created user: {:?}", user);

    Ok(Json(user))
}

pub async fn user_find(
    State((_, repo)): State<(Handlebars<'_>, DynDatistRepo)>,
    Path(user_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    println!("Finding user: {:?}", user_id);
    let user = repo.user_find(user_id).await?;

    Ok(Json(user))
}