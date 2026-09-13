import { describe, expect, it } from 'vitest'
import {
  calculateExpectedPoints,
  deriveCycleDate,
  isStatementPayable,
  statementAmountDue,
} from './financial-rules'

describe('financial rules', () => {
  it('calculates an estimated point amount from saved card inputs', () => {
    expect(calculateExpectedPoints(100_00, 2.2, 5)).toBe(44)
    expect(calculateExpectedPoints(-100_00, 2.2, 5)).toBe(-44)
  })

  it('uses the final calendar day when a configured billing day is unavailable', () => {
    expect(deriveCycleDate('2026-02-10', 31)).toBe('2026-02-28')
    expect(deriveCycleDate('2026-09-10', 31)).toBe('2026-09-30')
  })

  it('allows full payment only for a closed unpaid statement with a positive due amount', () => {
    expect(isStatementPayable('closed', 12_500)).toBe(true)
    expect(isStatementPayable('open', 12_500)).toBe(false)
    expect(isStatementPayable('paid', 12_500)).toBe(false)
    expect(isStatementPayable('closed', 0)).toBe(false)
  })

  it('derives statement due amount from debits and credits', () => {
    expect(statementAmountDue([10_000, 5_000, -2_000])).toBe(13_000)
  })
})
