export class DuplicateNameError extends Error {
  constructor() {
    super('An active record already uses this name.');
    this.name = 'DuplicateNameError';
  }
}
