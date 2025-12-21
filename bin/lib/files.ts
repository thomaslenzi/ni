import fs from "fs";
import path from "path";
import slugify from "slugify";

/**
 * Create an empty file at "ni"
 * @param outputId the output identifier
 * @returns the file name and null (as a placeholder for stream)
 */
export function createFileSync(outputId: string): [string, null] {
  // Create directory if it doesn't exist
  fs.mkdirSync(path.join(process.cwd(), "ni", "output"), { recursive: true });
  // Create file
  const filePath = path.join(
    process.cwd(),
    "ni",
    "output",
    `${slugify(outputId, { lower: false, trim: true })}.txt`,
  );
  fs.writeFileSync(filePath, "", { flag: "w+" });
  // Return file name and null as placeholder for stream
  return [filePath, null] as const;
}

/**
 * Create a writable file stream at "ni"
 * @param outputId the output identifier
 * @returns the file name and the writable stream
 */
export function createFileStream(outputId: string): [string, fs.WriteStream] {
  // Create directory if it doesn't exist
  fs.mkdirSync(path.join(process.cwd(), "ni", "output"), { recursive: true });
  // Create writable stream
  const filePath = path.join(
    process.cwd(),
    "ni",
    "output",
    `${slugify(outputId, { lower: false, trim: true })}.txt`,
  );
  const file = fs.createWriteStream(filePath, { flags: "w+" });
  // Return file name and writable stream
  return [filePath, file] as const;
}
