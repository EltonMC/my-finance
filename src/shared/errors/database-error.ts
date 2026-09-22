import { DuplicateNameError } from './duplicate-name';

type DatabaseError = { message: string; code?: string };

export function throwIfDatabaseError(error: DatabaseError | null): void {
  if (error?.code === '23505') throw new DuplicateNameError();
  if (error) throw error;
}
