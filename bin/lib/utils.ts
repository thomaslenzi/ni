/**
 * Try catch utility that returns a default value in case of error
 * @param fn the function to try
 * @param defaultValue the default value to return in case of error
 * @returns the result of the function or the default value
 */
export function tryCatchValue<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn();
  } catch {
    return defaultValue;
  }
}

/**
 * Throw error and exit process
 * @param message the error message
 */
export function throwError(message: string) {
  process.stderr.write(message);
  process.stderr.write("\n");
  process.exit(1);
}
