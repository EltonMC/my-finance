import { describe, expect, it } from 'vitest'
import { createInstallmentPlan } from './installments'

describe('createInstallmentPlan', () => {
  it('keeps every centavo in the plan and applies its remainder to the final installment', () => {
    expect(createInstallmentPlan(10_001, 3)).toEqual([3_333, 3_333, 3_335])
  })
})
