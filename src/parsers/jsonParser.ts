import { readFile } from "node:fs/promises";
import { ParserError } from "../errors/ParserError.js";

/** Parses JSON text, preserving every JSON data type. */
export function parseJson<T = unknown>(source: string): T {
  if (source.trim() === "") {
    throw new ParserError("JSON", "Cannot parse an empty JSON document.");
  }

  try {
    return JSON.parse(source) as T;
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : "Unknown syntax error";
    throw new ParserError("JSON", `Invalid JSON: ${detail}`, { cause });
  }
}

/** Reads and parses a UTF-8 JSON file. */
export async function parseJsonFile<T = unknown>(filePath: string): Promise<T> {
  let source: string;

  try {
    source = await readFile(filePath, "utf8");
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : "Unknown file error";
    throw new ParserError("JSON", `Unable to read JSON file \"${filePath}\": ${detail}`, {
      cause,
      filePath,
    });
  }

  try {
    return parseJson<T>(source);
  } catch (cause) {
    if (cause instanceof ParserError) {
      throw new ParserError("JSON", `${cause.message} (file: ${filePath})`, {
        cause,
        filePath,
      });
    }
    throw cause;
  }
}

export const parseJSON = parseJson;
export const parseJSONFile = parseJsonFile;
