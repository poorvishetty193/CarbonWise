import { ERROR_MESSAGES } from './constants';

/**
 * Narrows an unknown catch value to a human-readable string safe for logging.
 * @param error - The unknown value from a catch block
 * @returns A safe string message, never throws
 * @throws {never} This function does not throw.
 */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Type guard narrowing unknown to Error.
 * @param error - The unknown value to check
 * @returns True if the value is an Error instance
 * @throws {never} This function does not throw.
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Wraps an unknown catch value in an Error if it is not one already.
 * @param error - The unknown value from a catch block
 * @returns An Error instance safe for re-throwing
 * @throws {never} This function does not throw.
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(toErrorMessage(error));
}
