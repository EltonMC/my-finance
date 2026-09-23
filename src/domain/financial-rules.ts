export type StatementStatus = 'open' | 'closed' | 'paid';

export function calculateExpectedPoints(amountCentavos: number, pointsPerUsd: number, brlPerUsd: number): number {
  if (!Number.isInteger(amountCentavos)) {
    throw new Error('Amount must be an integer number of centavos.');
  }

  if (!Number.isFinite(pointsPerUsd) || pointsPerUsd <= 0) {
    throw new Error('Points per USD must be greater than zero.');
  }

  if (!Number.isFinite(brlPerUsd) || brlPerUsd <= 0) {
    throw new Error('BRL per USD must be greater than zero.');
  }

  const amountInBrl = amountCentavos / 100;
  return roundToTwoDecimals((amountInBrl / brlPerUsd) * pointsPerUsd);
}

export function deriveCycleDate(referenceDate: string, configuredDay: number): string {
  if (!Number.isInteger(configuredDay) || configuredDay < 1 || configuredDay > 31) {
    throw new Error('Configured day must be an integer between 1 and 31.');
  }

  const [year, month] = referenceDate.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) {
    throw new Error('Reference date must be an ISO calendar date.');
  }

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(configuredDay, lastDay);
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

export function isStatementPayable(status: StatementStatus, amountDueCentavos: number): boolean {
  return status === 'closed' && amountDueCentavos > 0;
}

export function statementAmountDue(eventAmountsCentavos: number[]): number {
  return eventAmountsCentavos.reduce((total, amount) => total + amount, 0);
}

function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
