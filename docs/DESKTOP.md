# AwareDeck desktop development

The desktop shell uses Tauri 2 and preserves the same React application used by GitHub Pages. Native functionality is loaded dynamically, so `npm run dev` remains a browser-only workflow.

## Windows prerequisites

- Node.js 22 or later
- Rust stable installed through `rustup`
- Visual Studio 2022 Build Tools with **Desktop development with C++**
- Microsoft Edge WebView2 Runtime

Verify the environment:

```powershell
rustc --version
cargo --version
npx tauri info
```

## Run the desktop shell

```powershell
npm install
npm run desktop:dev
```

Build a Windows installer with:

```powershell
npm run desktop:build
```

## Native boundaries

The React application may invoke only commands listed in `src-tauri/permissions/awaredeck.toml` and granted by `src-tauri/capabilities/default.json`.

- `get_active_context` reads clipboard text after the user selects **Capture desktop**.
- `store_provider_secret` writes a provider credential to the OS credential vault through the Rust `keyring` crate.
- `delete_provider_secret` removes that credential.
- `run_provider` retrieves the credential inside Rust and performs the reviewed request without returning the secret to JavaScript.

Provider identifiers are restricted, remote endpoints require HTTPS, and command code does not log context, prompts, responses, or secrets. Browser mode keeps provider configuration in tab memory only and never uses the native credential vault.

## Current limitation

The first native context source intentionally reads clipboard text only. Foreground-window and editor selection capture should be added through explicit integrations rather than broad accessibility or input-monitoring permissions.