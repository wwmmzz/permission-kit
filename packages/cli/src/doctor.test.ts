import { describe, expect, it } from 'vitest'
import { runDoctor } from './doctor'

describe('runDoctor', () => {
  it('reports the workspace as healthy', async () => {
    const report = await runDoctor(process.cwd())

    expect(report.ok).toBe(true)
    expect(report.issues.some((item) => item.level === 'error')).toBe(false)
  })
})
