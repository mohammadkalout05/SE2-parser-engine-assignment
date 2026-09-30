import { readFile } from "node:fs/promises";
import { ParserError } from "../errors/ParserError.js";

export type CsvRecord = Record<string, string>;

export interface CsvOptions {
  delimiter?: string;
  skipEmptyLines?: boolean;
  trimHeaders?: boolean;
}

function tokenize(source: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field.length !== 0) {
        throw new ParserError("CSV", "Invalid CSV: a quote must begin at the start of a field.");
      }
      quoted = true;
    } else if (character === delimiter) {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) {
    throw new ParserError("CSV", "Invalid CSV: unterminated quoted field.");
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/** Parses a CSV document into objects keyed by its header row. */
export function parseCsv(source: string, options: CsvOptions = {}): CsvRecord[] {
  if (source.trim() === "") {
    throw new ParserError("CSV", "Cannot parse an empty CSV document.");
  }

  const delimiter = options.delimiter ?? ",";
  if (delimiter.length !== 1 || delimiter === '"' || delimiter === "\r" || delimiter === "\n") {
    throw new ParserError("CSV", "The CSV delimiter must be one non-quote character.");
  }

  const skipEmptyLines = options.skipEmptyLines ?? true;
  const rows = tokenize(source.replace(/^\uFEFF/, ""), delimiter).filter(
    (row) => !skipEmptyLines || row.some((value) => value.trim() !== ""),
  );
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => (options.trimHeaders ?? true ? header.trim() : header));
  if (headers.some((header) => header === "")) {
    throw new ParserError("CSV", "Invalid CSV: header names cannot be empty.");
  }
  if (new Set(headers).size !== headers.length) {
    throw new ParserError("CSV", "Invalid CSV: header names must be unique.");
  }

  return rows.slice(1).map((values, rowIndex) => {
    if (values.length !== headers.length) {
      throw new ParserError(
        "CSV",
        `Invalid CSV: row ${rowIndex + 2} has ${values.length} fields; expected ${headers.length}.`,
      );
    }
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

/** Reads and parses a UTF-8 CSV file. */
export async function parseCsvFile(filePath: string, options?: CsvOptions): Promise<CsvRecord[]> {
  let source: string;
  try {
    source = await readFile(filePath, "utf8");
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : "Unknown file error";
    throw new ParserError("CSV", `Unable to read CSV file \"${filePath}\": ${detail}`, {
      cause,
      filePath,
    });
  }

  try {
    return parseCsv(source, options);
  } catch (cause) {
    if (cause instanceof ParserError) {
      throw new ParserError("CSV", `${cause.message} (file: ${filePath})`, {
        cause,
        filePath,
      });
    }
    throw cause;
  }
}

export const parseCSV = parseCsv;
export const parseCSVFile = parseCsvFile;
