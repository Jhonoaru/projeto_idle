use serde::Deserialize;
use serde_json::Value;
use sqlx::SqlitePool;
use tauri_plugin_sql::{DbInstances, DbPool};

#[derive(Deserialize)]
pub struct Statement {
    query: String,
    values: Vec<Value>,
}

#[tauri::command]
pub async fn save_transaction(
    instances: tauri::State<'_, DbInstances>,
    db: String,
    statements: Vec<Statement>,
) -> Result<(), String> {
    let instances = instances.0.read().await;
    match instances.get(&db) {
        Some(DbPool::Sqlite(pool)) => execute_batch(pool, statements).await,
        _ => Err("SQLite database is not loaded".into()),
    }
}

async fn execute_batch(pool: &SqlitePool, statements: Vec<Statement>) -> Result<(), String> {
    let mut transaction = pool.begin().await.map_err(|error| error.to_string())?;
    for statement in statements {
        let mut query = sqlx::query(&statement.query);
        for value in statement.values {
            query = match value {
                Value::Null => query.bind(Option::<String>::None),
                Value::Bool(value) => query.bind(value),
                Value::Number(value) => {
                    if let Some(integer) = value.as_i64() {
                        query.bind(integer)
                    } else {
                        query.bind(value.as_f64())
                    }
                }
                Value::String(value) => query.bind(value),
                _ => return Err("Unsupported SQL value".into()),
            };
        }
        if let Err(error) = query.execute(&mut *transaction).await {
            transaction
                .rollback()
                .await
                .map_err(|rollback| rollback.to_string())?;
            return Err(error.to_string());
        }
    }
    transaction
        .commit()
        .await
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn failed_save_rolls_back_and_next_save_succeeds() {
        tauri::async_runtime::block_on(async {
            let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
            sqlx::query("CREATE TABLE save (id INTEGER PRIMARY KEY, gold INTEGER)")
                .execute(&pool)
                .await
                .unwrap();
            sqlx::query("INSERT INTO save VALUES (1, 100)")
                .execute(&pool)
                .await
                .unwrap();
            let statement = |query: &str| Statement {
                query: query.into(),
                values: vec![],
            };
            assert!(execute_batch(
                &pool,
                vec![
                    statement("DELETE FROM save"),
                    statement("INSERT INTO save VALUES (1, 200)"),
                    statement("INSERT INTO save VALUES (1, 300)")
                ]
            )
            .await
            .is_err());
            let gold: i64 = sqlx::query_scalar("SELECT gold FROM save")
                .fetch_one(&pool)
                .await
                .unwrap();
            assert_eq!(gold, 100);
            execute_batch(
                &pool,
                vec![
                    statement("DELETE FROM save"),
                    Statement {
                        query: "INSERT INTO save VALUES ($1, $2)".into(),
                        values: vec![Value::from(1), Value::from(400)],
                    },
                ],
            )
            .await
            .unwrap();
            let gold: i64 = sqlx::query_scalar("SELECT gold FROM save")
                .fetch_one(&pool)
                .await
                .unwrap();
            assert_eq!(gold, 400);
        });
    }
}
