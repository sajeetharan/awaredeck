import { describe, expect, it } from 'vitest'
import { executeAction, suggestActions, type ActiveContext } from './actions'

const codeContext: ActiveContext = {
  application: 'Visual Studio Code',
  title: 'executor.ts',
  contentType: 'code',
  language: 'TypeScript',
  selection: 'provider.run(action.prompt)',
}

describe('suggestActions', () => {
  it('prioritizes an application-specific code review action', () => {
    const suggestions = suggestActions(codeContext)

    expect(suggestions[0].id).toBe('review-code')
    expect(suggestions.every((action) => action.contexts.includes('code'))).toBe(true)
  })
})

describe('executeAction', () => {
  it('requires approval for an action that writes', () => {
    const writeAction = suggestActions(codeContext).find((action) => action.risk === 'write')

    expect(writeAction).toBeDefined()
    expect(() => executeAction(writeAction!, false)).toThrow('Approval is required')
  })

  it('allows a read-only action without approval', () => {
    const readAction = suggestActions(codeContext)[0]
    const result = executeAction(readAction, false, new Date('2026-08-26T10:00:00Z'))

    expect(result).toEqual({
      actionId: 'review-code',
      status: 'completed',
      completedAt: '2026-08-26T10:00:00.000Z',
    })
  })
})