use std::time::SystemTime;

use uuid::Uuid;

use crate::types::{CookieStore, DatistRepoError, KeychainEntry, KeychainListEntry, Thread, ThreadEntry, ThreadRepo, ThreadXhrStreamEntry, User};

#[axum::async_trait]
pub trait DatistRepo {
    async fn user_create(&self) -> Result<User, DatistRepoError>;
    async fn user_find(&self, user_id: Uuid) -> Result<User, DatistRepoError>;

    async fn thread_create(&self, user_id: Uuid) -> Result<Thread, DatistRepoError>;
    async fn thread_find(&self, user_id: Uuid, thread_id: Uuid) -> Result<Thread, DatistRepoError>;
    async fn thread_add_entry(&self, user_id: Uuid, thread_id: Uuid, thread_entry: ThreadEntry) -> Result<(), DatistRepoError>;
    async fn thread_get_entries(&self, user_id: Uuid, thread_id: Uuid, page: u32) -> Result<Vec<ThreadEntry>, DatistRepoError>;

    async fn thread_keychain_list_entries(&self, user_id: Uuid, thread_id: Uuid, page: u32) -> Result<Vec<KeychainListEntry>, DatistRepoError>;
    async fn thread_keychain_get_entry(&self, user_id: Uuid, thread_id: Uuid, url: String) -> Result<KeychainEntry, DatistRepoError>;
    async fn thread_keychain_has_entry(&self, user_id: Uuid, thread_id: Uuid, url: String) -> Result<(), DatistRepoError>;
    async fn thread_keychain_add_entry(&self, user_id: Uuid, thread_id: Uuid, keychain_entry: KeychainEntry) -> Result<(), DatistRepoError>;
    async fn thread_keychain_add_url_filter(&self, user_id: Uuid, thread_id: Uuid, url_filter: String) -> Result<(), DatistRepoError>;

    async fn thread_cookie_store_set(&self, user_id: Uuid, thread_id: Uuid, cookie_store: CookieStore) -> Result<(), DatistRepoError>;
    async fn thread_cookie_store_get(&self, user_id: Uuid, thread_id: Uuid) -> Result<CookieStore, DatistRepoError>;

    async fn thread_xhrstream_add_entry(&self, user_id: Uuid, thread_id: Uuid, thread_entry: ThreadXhrStreamEntry) -> Result<(), DatistRepoError>;
    async fn thread_xhrstream_list_entries(&self, user_id: Uuid, thread_id: Uuid, page: u32) -> Result<Vec<ThreadXhrStreamEntry>, DatistRepoError>;
}

#[axum::async_trait]
impl DatistRepo for ThreadRepo {
    /* stored at user:<user_id> */
    async fn user_create(&self) -> Result<User, DatistRepoError> {
        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_micros();

        let user = User {
            id: Uuid::new_v4(),
            created_at: timestamp,
        };

        let key = format!("user:{}", user.id);
        let value = simd_json::to_string(&user)
            .map_err(|_| DatistRepoError::SerializationError)?;

        self.db.put(key, value)
            .map_err(|_| DatistRepoError::DbError)?;

        Ok(user)
    }

    async fn user_find(&self, user_id: Uuid) -> Result<User, DatistRepoError> {
        let key = format!("user:{user_id}");

        let mut value =
            self.db
                .get(key)
                .ok()
                .flatten()
                .ok_or(DatistRepoError::NotFound)?;

        let user =
            simd_json::from_slice(value.as_mut_slice())
                .map_err(|_| DatistRepoError::NotFound)?;

        Ok(user)
    }

    /* stored at user:<user_id>:threads:<tread_id> */
    async fn thread_create(&self, user_id: Uuid) -> Result<Thread, DatistRepoError> {
        self.user_find(user_id).await?;

        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_micros();

        let thread = Thread {
            id: Uuid::new_v4(),
            created_at: timestamp,
        };

        let key = format!("user:{user_id}:threads:{}", thread.id);
        let value = simd_json::to_string(&thread)
            .map_err(|_| DatistRepoError::SerializationError)?;

        self.db.put(key, value)
            .map_err(|_| DatistRepoError::DbError)?;

        Ok(thread)
    }

    /* stored at user:<user_id>:threads:<tread_id> */
    async fn thread_find(&self, user_id: Uuid, thread_id: Uuid) -> Result<Thread, DatistRepoError> {
        let key = format!("user:{user_id}:threads:{thread_id}");

        let mut value =
            self.db
                .get(key)
                .ok()
                .flatten()
                .ok_or(DatistRepoError::NotFound)?;

        let thread =
            simd_json::from_slice(value.as_mut_slice())
                .map_err(|_| DatistRepoError::SerializationError)?;

        Ok(thread)
    }

    /* stored at user:<user_id>:threads:<tread_id>:<unix time since epoch> */
    async fn thread_add_entry(&self, user_id: Uuid, thread_id: Uuid, thread_entry: ThreadEntry) -> Result<(), DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_micros();

        let key = format!("user:{user_id}:threads:{thread_id}:entries:{timestamp}");

        let thread_entry = ThreadEntry {
            created_utc: Some(timestamp),
            ..thread_entry
        };

        let value = simd_json::to_string(&thread_entry)
            .map_err(|_| DatistRepoError::SerializationError)?;

        self.db.put(key, value)
            .map_err(|_| DatistRepoError::DbError)?;

        Ok(())
    }

    /* stored at user:<user_id>:threads:<tread_id>:keychain */
    async fn thread_get_entries(&self, user_id: Uuid, thread_id: Uuid, page: u32) -> Result<Vec<ThreadEntry>, DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        // iterate over all keys in the keychain and in steps of 50, return items at page * 50
        let mut entries = Vec::new();

        let from = format!("user:{user_id}:threads:{thread_id}:entries:");
        let to = format!("user:{user_id}:threads:{thread_id}:entries:{}", u64::MAX);

        let iter =
            self.db.iterator(
                rocksdb::IteratorMode::From(
                    to.as_bytes(),
                    rocksdb::Direction::Reverse,
                ),
            )
                .filter_map(|v| v.ok());

        let mut i = 0;

        for (key, mut value) in iter {
            if key.as_ref() < from.as_bytes() {
                break;
            }

            if i >= page * 50 && i < (page + 1) * 50 {
                let entry: ThreadEntry = simd_json::from_slice(value.as_mut())
                    .map_err(|_| DatistRepoError::SerializationError)?;

                entries.push(entry);
            }

            i += 1;
        }

        Ok(entries)
    }

    /* stored at user:<user_id>threads:<tread_id>:keychain:<unix time since epoch> */
    async fn thread_keychain_list_entries(&self, user_id: Uuid, thread_id: Uuid, page: u32) -> Result<Vec<KeychainListEntry>, DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        // iterate over all keys in the keychain and in steps of 50, return items at page * 50
        let mut entries = Vec::new();

        let from = format!("user:{user_id}:threads:{thread_id}:keychain:");
        let to = format!("user:{user_id}:threads:{thread_id}:keychain;");

        let iter =
            self.db.iterator(
                rocksdb::IteratorMode::From(
                    to.as_bytes(),
                    rocksdb::Direction::Reverse,
                ),
            )
                .filter_map(|v| v.ok());

        let mut i = 0;

        for (key, mut value) in iter {
            if key.as_ref() < from.as_bytes() {
                break;
            }

            if i >= page * 50 && i < (page + 1) * 50 {
                let entry: KeychainEntry =
                    simd_json::from_slice(value.as_mut())
                        .map_err(|_| DatistRepoError::SerializationError)?;

                entries.push(
                    KeychainListEntry {
                        url: entry.url,
                        created_utc: entry.created_utc,
                    }
                );
            }

            i += 1;
        }

        Ok(entries)
    }

    async fn thread_keychain_get_entry(
        &self,
        user_id: Uuid,
        thread_id: Uuid,
        url: String,
    ) -> Result<KeychainEntry, DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        let key = format!("user:{user_id}:threads:{thread_id}:keychain:{url}");

        let mut value =
            self.db
                .get(key)
                .ok()
                .flatten()
                .ok_or(DatistRepoError::NotFound)?;

        let user =
            simd_json::from_slice(value.as_mut_slice())
                .map_err(|_| DatistRepoError::NotFound)?;

        Ok(user)
    }

    async fn thread_keychain_has_entry(
        &self,
        user_id: Uuid,
        thread_id: Uuid,
        url: String,
    ) -> Result<(), DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        let key = format!("user:{user_id}:threads:{thread_id}:keychain:{url}");

        let exists = self.db.key_may_exist(key);

        if !exists {
            return Err(DatistRepoError::NotFound);
        }

        Ok(())
    }

    /* stored at user:<user_id>:keychain:filters -- filters is a Vec<String> */
    async fn thread_keychain_add_entry(
        &self,
        user_id: Uuid,
        thread_id: Uuid,
        keychain_entry: KeychainEntry,
    ) -> Result<(), DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_micros();

        let key =
            format!(
                "user:{user_id}:threads:{thread_id}:keychain:{}",
                &keychain_entry.url,
            );

        let keychain_entry = KeychainEntry {
            created_utc: Some(timestamp),
            ..keychain_entry
        };

        let value =
            simd_json::to_string(&keychain_entry)
                .map_err(|_| DatistRepoError::SerializationError)?;

        self.db.put(key, value)
            .map_err(|_| DatistRepoError::DbError)?;

        Ok(())
    }

    async fn thread_keychain_add_url_filter(
        &self,
        user_id: Uuid,
        thread_id: Uuid,
        url_filter: String,
    ) -> Result<(), DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        let key = format!("user:{user_id}:threads:{thread_id}:keychain:filters");

        let mut filters =
            self.db
                .get(&key)
                .ok()
                .flatten()
                .and_then(|mut v|
                    simd_json::from_slice::<Vec<String>>(
                        v.as_mut_slice(),
                    ).ok())
                .unwrap_or(Vec::new());

        filters.push(url_filter);

        let value = simd_json::to_string(&filters)
            .map_err(|_| DatistRepoError::SerializationError)?;

        self.db.put(key, value)
            .map_err(|_| DatistRepoError::DbError)?;

        Ok(())
    }

    async fn thread_cookie_store_set(&self, user_id: Uuid, thread_id: Uuid, cookie_store: CookieStore) -> Result<(), DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        let key = format!("user:{user_id}:threads:{thread_id}:cookie_store");

        let value = simd_json::to_string(&cookie_store)
            .map_err(|_| DatistRepoError::SerializationError)?;

        self.db.put(key, value)
            .map_err(|_| DatistRepoError::DbError)?;

        Ok(())
    }

    async fn thread_cookie_store_get(&self, user_id: Uuid, thread_id: Uuid) -> Result<CookieStore, DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        let key = format!("user:{user_id}:threads:{thread_id}:cookie_store");

        Ok(
            self.db
                .get(key)
                .ok()
                .flatten()
                .map(|mut v|
                         simd_json::from_slice::<'_, CookieStore>(
                             v.as_mut_slice(),
                         )
                             .ok(),
                )
                .flatten()
                .unwrap_or(CookieStore::new())
        )
    }

    async fn thread_xhrstream_add_entry(&self, user_id: Uuid, thread_id: Uuid, xhrstream_entry: ThreadXhrStreamEntry) -> Result<(), DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_micros();

        let key = format!("user:{user_id}:threads:{thread_id}:stream:{timestamp}");

        let xhrstream_entry = ThreadXhrStreamEntry {
            created_utc: Some(timestamp),
            ..xhrstream_entry
        };

        let value = simd_json::to_string(&xhrstream_entry)
            .map_err(|_| DatistRepoError::SerializationError)?;

        self.db.put(key, value)
            .map_err(|_| DatistRepoError::DbError)?;

        Ok(())
    }

    async fn thread_xhrstream_list_entries(&self, user_id: Uuid, thread_id: Uuid, page: u32) -> Result<Vec<ThreadXhrStreamEntry>, DatistRepoError> {
        self.thread_find(user_id, thread_id).await?;

        // iterate over all keys in the keychain and in steps of 50, return items at page * 50
        let mut entries = Vec::new();

        let from = format!("user:{user_id}:threads:{thread_id}:stream:");
        let to = format!("user:{user_id}:threads:{thread_id}:stream:{}", u64::MAX);

        let iter =
            self.db.iterator(
                rocksdb::IteratorMode::From(
                    to.as_bytes(),
                    rocksdb::Direction::Reverse,
                ),
            )
                .filter_map(|v| v.ok());

        let mut i = 0;

        for (key, mut value) in iter {
            if key.as_ref() < from.as_bytes() {
                break;
            }

            if i >= page * 50 && i < (page + 1) * 50 {
                let entry: ThreadXhrStreamEntry = simd_json::from_slice(value.as_mut())
                    .map_err(|_| DatistRepoError::SerializationError)?;

                entries.push(entry);
            }

            i += 1;
        }

        Ok(entries)
    }
}