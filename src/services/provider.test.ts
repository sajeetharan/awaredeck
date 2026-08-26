import { describe, expect, it, vi } from 'vitest'
import { OpenAICompatibleProvider, PreviewProvider } from './provider'

describe('PreviewProvider', () => {
  it('returns a deterministic local result containing the request context', async () => {
    const provider = new PreviewProvider()
    const response = await provider.run({ prompt: 'Review this.', context: 'const ready = true' })

    expect(response.content).toContain('Preview result')
    expect(response.content).toContain('const ready = true')
  })
})

describe('OpenAICompatibleProvider', () => {
  it('posts a chat completion request and returns its content', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: 'No defects found.' } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    const provider = new OpenAICompatibleProvider({
      endpoint: 'https://example.test/v1/',
      model: 'test-model',
      apiKey: 'session-only-key',
    }, fetcher)

    const response = await provider.run({ prompt: 'Review this.', context: 'const ready = true' })

    expect(response.content).toBe('No defects found.')
    expect(fetcher).toHaveBeenCalledWith('https://example.test/v1/chat/completions', expect.objectContaining({
      method: 'POST',
    }))
  })
})