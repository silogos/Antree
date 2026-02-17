/**
 * Error Handling Utilities
 */

/**
 * Check if error is a foreign key constraint violation
 */
export function isForeignKeyError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('violates foreign key constraint') ||
           error.message.includes('foreign key violation');
  }
  return false;
}

/**
 * Check if error is a unique constraint violation
 */
export function isUniqueConstraintError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('duplicate key') ||
           error.message.includes('unique constraint');
  }
  return false;
}

/**
 * Check if error is a not null constraint violation
 */
export function isNotNullError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('not-null constraint') ||
           error.message.includes('null value in column');
  }
  return false;
}

/**
 * Get user-friendly error message from database error
 */
export function getDatabaseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (isForeignKeyError(error)) {
      return 'This record is referenced by other records and cannot be deleted';
    }
    if (isUniqueConstraintError(error)) {
      return 'A record with this value already exists';
    }
    if (isNotNullError(error)) {
      return 'Required field is missing';
    }
  }
  return 'Database error occurred';
}
