use keyring::Entry;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;
use url::Url;

const KEYRING_SERVICE: &str = "com.awaredeck.app";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ActiveContext {
    application: String,
    title: String,
    content_type: String,
    selection: String,
    language: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct StoreSecretRequest {
    provider_id: String,
    secret: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProviderExecutionRequest {
    provider_id: String,
    endpoint: String,
    model: String,
    prompt: String,
    context: String,
}

#[derive(Serialize)]
struct ProviderExecutionResponse {
    content: String,
}

fn validate_provider_id(provider_id: &str) -> Result<(), String> {
    if provider_id.is_empty()
        || provider_id.len() > 64
        || !provider_id.chars().all(|character| character.is_ascii_alphanumeric() || character == '-')
    {
        return Err("Provider identifier is invalid.".into());
    }
    Ok(())
}

fn validate_endpoint(endpoint: &str) -> Result<Url, String> {
    let url = Url::parse(endpoint).map_err(|_| "Provider endpoint is not a valid URL.")?;
    let local_http = url.scheme() == "http"
        && matches!(url.host_str(), Some("localhost" | "127.0.0.1" | "[::1]"));
    if url.scheme() != "https" && !local_http {
        return Err("Provider endpoints must use HTTPS unless they are local.".into());
    }
    Ok(url)
}

#[tauri::command]
fn get_active_context(app: AppHandle) -> Result<ActiveContext, String> {
    let selection = app.clipboard().read_text().map_err(|_| "Clipboard text is unavailable.")?;
    let looks_like_code = selection.contains('{')
        || selection.contains(';')
        || ["const ", "let ", "function ", "class ", "import ", "export "]
            .iter()
            .any(|token| selection.contains(token));

    Ok(ActiveContext {
        application: "Desktop clipboard".into(),
        title: "Native context capture".into(),
        content_type: if looks_like_code { "code" } else { "text" }.into(),
        selection,
        language: if looks_like_code { "Detected code" } else { "Plain text" }.into(),
    })
}

#[tauri::command]
fn store_provider_secret(request: StoreSecretRequest) -> Result<(), String> {
    validate_provider_id(&request.provider_id)?;
    if request.secret.is_empty() || request.secret.len() > 16_384 {
        return Err("Provider secret is empty or too large.".into());
    }
    Entry::new(KEYRING_SERVICE, &request.provider_id)
        .and_then(|entry| entry.set_password(&request.secret))
        .map_err(|_| "The operating system credential vault rejected the secret.".into())
}

#[tauri::command]
fn delete_provider_secret(provider_id: String) -> Result<(), String> {
    validate_provider_id(&provider_id)?;
    Entry::new(KEYRING_SERVICE, &provider_id)
        .and_then(|entry| entry.delete_credential())
        .map_err(|_| "The provider credential could not be removed.".into())
}

#[tauri::command]
async fn run_provider(request: ProviderExecutionRequest) -> Result<ProviderExecutionResponse, String> {
    validate_provider_id(&request.provider_id)?;
    let mut endpoint = validate_endpoint(&request.endpoint)?;
    endpoint.set_path(&format!("{}/chat/completions", endpoint.path().trim_end_matches('/')));
    let api_key = Entry::new(KEYRING_SERVICE, &request.provider_id)
        .and_then(|entry| entry.get_password())
        .map_err(|_| "No credential is stored for this provider.".to_string())?;

    let response = reqwest::Client::new()
        .post(endpoint)
        .bearer_auth(api_key)
        .json(&json!({
            "model": request.model,
            "messages": [
                { "role": "system", "content": "Follow the requested action using only the supplied context." },
                { "role": "user", "content": format!("{}\n\nContext:\n{}", request.prompt, request.context) }
            ]
        }))
        .send()
        .await
        .map_err(|_| "The provider request could not be completed.".to_string())?;
    let status = response.status();
    let payload: Value = response.json().await.map_err(|_| "The provider returned invalid JSON.".to_string())?;

    if !status.is_success() {
        return Err(payload.pointer("/error/message").and_then(Value::as_str)
            .unwrap_or("The provider rejected the request.").to_string());
    }
    let content = payload.pointer("/choices/0/message/content").and_then(Value::as_str)
        .map(str::trim).filter(|value| !value.is_empty())
        .ok_or_else(|| "The provider returned an empty response.".to_string())?;
    Ok(ProviderExecutionResponse { content: content.into() })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            get_active_context,
            store_provider_secret,
            delete_provider_secret,
            run_provider
        ])
        .run(tauri::generate_context!())
        .expect("error while running AwareDeck");
}

#[cfg(test)]
mod tests {
    use super::{validate_endpoint, validate_provider_id};

    #[test]
    fn accepts_https_and_local_http_endpoints() {
        assert!(validate_endpoint("https://api.example.com/v1").is_ok());
        assert!(validate_endpoint("http://localhost:11434/v1").is_ok());
    }

    #[test]
    fn rejects_remote_plaintext_endpoints() {
        assert!(validate_endpoint("http://api.example.com/v1").is_err());
    }

    #[test]
    fn restricts_provider_identifiers() {
        assert!(validate_provider_id("openai-compatible").is_ok());
        assert!(validate_provider_id("../../credential").is_err());
    }
}