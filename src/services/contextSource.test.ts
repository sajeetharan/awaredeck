import { describe, expect, it } from 'vitest'
import { contextFromClipboard } from './contextSource'

describe('contextFromClipboard', () => {
  it('classifies source-like clipboard content as code', () => {
    expect(contextFromClipboard('export function run() { return true; }').contentType).toBe('code')
  })

  it('classifies prose clipboard content as text', () => {
    expect(contextFromClipboard('Summarize the decisions from this meeting.').contentType).toBe('text')
  })
})