import { InvalidArgumentError } from "commander";

/**
 * Parses a positive integer from a string or throw an error
 * @param value the string to parse
 * @returns the positive integer
 */
export function argPInt(value: string): number {
  const v = Number(value);
  if (!Number.isInteger(v) || v <= 0)
    throw new InvalidArgumentError("Should be a positive integer.");
  return v;
}

/**
 * Parses a positive integer or zero from a string or throw an error
 * @param value the string to parse
 * @returns the positive integer or zero
 */
export function argPZInt(value: string): number {
  const v = Number(value);
  if (!Number.isInteger(v) || v < 0)
    throw new InvalidArgumentError("Should be a positive integer or zero.");
  return v;
}
