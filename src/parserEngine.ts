import { extname } from "node:path";
import { ParserError } from "./errors/ParserError.js";
import { parseCsvFile, type CsvOptions, type CsvRecord } from "./parsers/csvParser.js";
import { parseJsonFile } from "./parsers/jsonParser.js";
import { parseXmlFile, type XmlOptions } from "./parsers/xmlParser.js";

export type ParsedFile = unknown | CsvRecord[] | Record<string, unknown>;

export interface ParserEngineOptions {
  csv?: CsvOptions;
  xml?: XmlOptions;
}

/** Selects a parser from the file extension and returns its JavaScript representation. */
export async function parseFile(filePath: string, options: ParserEngineOptions = {}): Promise<ParsedFile> {
  switch (extname(filePath).toLowerCase()) {
    case ".csv":
      return parseCsvFile(filePath, options.csv);
    case ".json":
      return parseJsonFile(filePath);
    case ".xml":
      return parseXmlFile(filePath, options.xml);
    default:
      throw new ParserError(
        "UNKNOWN",
        `Unsupported file format for \"${filePath}\". Expected .csv, .json, or .xml.`,
        { filePath },
      );
  }
}
