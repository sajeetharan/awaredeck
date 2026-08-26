import type { ActiveContext } from '../domain/actions'
import type { ProviderRequest, ProviderResponse } from './provider'

interface DesktopProviderConfig {
  providerId: string
  endpoint: string
  model: string
}

export function isDesktopRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core')
  return tauriInvoke<T>(command, args)
}

export function getDesktopContext(): Promise<ActiveContext> {
  return invoke<ActiveContext>('get_active_context')
}

export function storeDesktopProviderSecret(providerId: string, secret: string): Promise<void> {
  return invoke<void>('store_provider_secret', { request: { providerId, secret } })
}

export function deleteDesktopProviderSecret(providerId: string): Promise<void> {
  return invoke<void>('delete_provider_secret', { providerId })
}

export function runDesktopProvider(
  config: DesktopProviderConfig,
  request: ProviderRequest,
): Promise<ProviderResponse> {
  return invoke<ProviderResponse>('run_provider', {
    request: {
      ...config,
      prompt: request.prompt,
      context: request.context,
    },
  })
}