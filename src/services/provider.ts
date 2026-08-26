export interface ProviderRequest {
  prompt: string
  context: string
}

export interface ProviderResponse {
  content: string
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
    return { content: `Preview generated for: ${request.prompt}` }
  }
}