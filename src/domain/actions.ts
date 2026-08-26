export type RiskLevel = 'read' | 'write' | 'external'

export interface ActiveContext {
  application: string
  title: string
  contentType: 'code' | 'text' | 'table'
  selection: string
  language?: string
}

export interface DeckAction {
  id: string
  label: string
  description: string
  prompt: string
  preview: string
  risk: RiskLevel
  contexts: ActiveContext['contentType'][]
  applications?: string[]
}

export interface ActionResult {
  actionId: string
  status: 'completed'
  completedAt: string
}

const actionCatalog: DeckAction[] = [
  {
    id: 'review-code',
    label: 'Review selection',
    description: 'Find correctness, security, and maintainability issues.',
    prompt: 'Review the selected code. Prioritize concrete defects and explain the smallest safe fix.',
    preview: 'Produces review notes only. No files are changed.',
    risk: 'read',
    contexts: ['code'],
    applications: ['Visual Studio Code'],
  },
  {
    id: 'explain-code',
    label: 'Explain code',
    description: 'Summarize intent, data flow, and important edge cases.',
    prompt: 'Explain the selected code concisely, including data flow and edge cases.',
    preview: 'Produces an explanation only. No files are changed.',
    risk: 'read',
    contexts: ['code'],
  },
  {
    id: 'write-tests',
    label: 'Draft tests',
    description: 'Propose focused tests for the selected behavior.',
    prompt: 'Draft focused tests for the selected code, covering the highest-risk branches.',
    preview: 'Would create a neighboring test file after approval.',
    risk: 'write',
    contexts: ['code'],
  },
  {
    id: 'refactor-code',
    label: 'Refactor safely',
    description: 'Prepare a minimal readability refactor with a diff.',
    prompt: 'Refactor the selection for clarity without changing public behavior. Return a minimal diff.',
    preview: 'Would replace the current selection after approval.',
    risk: 'write',
    contexts: ['code'],
  },
  {
    id: 'summarize-text',
    label: 'Summarize',
    description: 'Reduce the selection to decisions and key points.',
    prompt: 'Summarize the selected text into decisions, key points, and unresolved questions.',
    preview: 'Produces a summary only. The source remains unchanged.',
    risk: 'read',
    contexts: ['text'],
  },
  {
    id: 'rewrite-text',
    label: 'Rewrite clearly',
    description: 'Tighten the selection while preserving its meaning.',
    prompt: 'Rewrite the selected text for clarity and brevity while preserving meaning and tone.',
    preview: 'Would replace the current selection after approval.',
    risk: 'write',
    contexts: ['text'],
  },
]

export function suggestActions(context: ActiveContext, limit = 6): DeckAction[] {
  return actionCatalog
    .filter((action) => action.contexts.includes(context.contentType))
    .sort((left, right) => {
      const leftMatch = left.applications?.includes(context.application) ? 1 : 0
      const rightMatch = right.applications?.includes(context.application) ? 1 : 0
      return rightMatch - leftMatch
    })
    .slice(0, limit)
}

export function executeAction(
  action: DeckAction,
  approved: boolean,
  now = new Date(),
): ActionResult {
  if (action.risk !== 'read' && !approved) {
    throw new Error('Approval is required for actions that can change or send data.')
  }

  return {
    actionId: action.id,
    status: 'completed',
    completedAt: now.toISOString(),
  }
}