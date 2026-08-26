import { describe, expect, it } from 'vitest'
import { isDesktopRuntime } from './desktop'

describe('isDesktopRuntime', () => {
  it('returns false outside a Tauri webview', () => {
    expect(isDesktopRuntime()).toBe(false)
  })
})