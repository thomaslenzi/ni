import fs from "fs";
import path from "path";
import slugify from "slugify";

/**
 * Create an empty file at "out/category/tool_key.txt"
 * @param category the category
 * @param tool the tool
 * @param key the key
 * @returns the file name and null (as a placeholder for stream)
 */
export function createFileSync(
  category: string,
  tool: string,
  key: string,
): [string, null] {
  // Create directory if it doesn't exist
  fs.mkdirSync(path.join(process.cwd(), "out", category), { recursive: true });
  // Create file
  const fileName = path.join(
    process.cwd(),
    "out",
    category,
    `${tool}_${slugify(key)}.txt`,
  );
  fs.writeFileSync(fileName, "", { flag: "w+" });
  // Return file name and null as placeholder for stream
  return [fileName, null] as const;
}

/**
 * Create a writable file stream at "out/category/tool_key.txt"
 * @param category the category
 * @param tool the tool
 * @param key the key
 * @returns the file name and the writable stream
 */
export function createFileStream(
  category: string,
  tool: string,
  key: string,
): [string, fs.WriteStream] {
  // Create directory if it doesn't exist
  fs.mkdirSync(path.join(process.cwd(), "out", category), { recursive: true });
  // Create writable stream
  const fileName = path.join(
    process.cwd(),
    "out",
    category,
    `${tool}_${slugify(key)}.txt`,
  );
  const file = fs.createWriteStream(fileName, { flags: "w+" });
  // Return file name and writable stream
  return [fileName, file] as const;
}
