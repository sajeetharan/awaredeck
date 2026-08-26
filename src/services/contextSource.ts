import type { ActiveContext } from '../domain/actions'

export interface ContextSource {
  getActiveContext(): Promise<ActiveContext>
}

export const mockContext: ActiveContext = {
  application: 'Visual Studio Code',
  title: 'src/services/actionExecutor.ts',
  contentType: 'code',
  language: 'TypeScript',
  selection: `export async function execute(action: Action) {
  return provider.run(action.prompt)
}`,
}

export class MockContextSource implements ContextSource {
  async getActiveContext(): Promise<ActiveContext> {
    return mockContext
  }
}