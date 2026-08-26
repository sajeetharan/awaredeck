export interface ProviderRequest {
  prompt: string
  context: string
}

export interface ProviderResponse {
  content: string
}

export interface OpenAICompatibleConfig {
  endpoint: string
  model: string
  apiKey: string
}

export interface AiProvider {
  id: string
  name: string
  run(request: ProviderRequest): Promise<ProviderResponse>
}

export class PreviewProvider implements AiProvider {
  readonly id = 'preview'
  readonly name = 'Preview mode'

  async run(request: ProviderRequest): Promise<ProviderResponse> {
    const excerpt = request.context.trim().slice(0, 240)
    return {
      content: `Preview result\n\n${request.prompt}\n\nContext received:\n${excerpt}`,
    }
  }
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

export class OpenAICompatibleProvider implements AiProvider {
  readonly id = 'openai-compatible'
  readonly name = 'OpenAI compatible'
  private readonly config: OpenAICompatibleConfig
  private readonly fetcher: typeof fetch

  constructor(
    config: OpenAICompatibleConfig,
    fetcher: typeof fetch = fetch,
  ) {
    this.config = config
    this.fetcher = fetcher
  }

  async run(request: ProviderRequest): Promise<ProviderResponse> {
    const endpoint = this.config.endpoint.replace(/\/$/, '')
    const response = await this.fetcher(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: 'Follow the requested action using only the supplied context.' },
          { role: 'user', content: `${request.prompt}\n\nContext:\n${request.context}` },
        ],
      }),
    })

    const payload = await response.json() as ChatCompletionResponse
    if (!response.ok) {
      throw new Error(payload.error?.message ?? `Provider request failed (${response.status}).`)
    }

    const content = payload.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('Provider returned an empty response.')
    }

    return { content }
  }
}