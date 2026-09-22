export function createInstallmentPlan(totalCentavos: number, installmentCount: number): number[] {
  if (!Number.isInteger(totalCentavos) || totalCentavos <= 0) {
    throw new Error('Installment total must be a positive integer number of centavos.');
  }

  if (!Number.isInteger(installmentCount) || installmentCount < 1) {
    throw new Error('Installment count must be a positive integer.');
  }

  const baseInstallment = Math.floor(totalCentavos / installmentCount);
  const finalInstallment = totalCentavos - baseInstallment * (installmentCount - 1);

  return Array.from({ length: installmentCount }, (_, index) =>
    index === installmentCount - 1 ? finalInstallment : baseInstallment,
  );
}
