import { readFile } from "node:fs/promises";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { ParserError } from "../errors/ParserError.js";

export interface XmlOptions {
  /** Convert numeric and boolean element text to their JavaScript equivalents. */
  parseTagValues?: boolean;
  /** Keep XML attributes using the default `@_` prefix. */
  ignoreAttributes?: boolean;
}

/** Parses XML text into a JavaScript object, including nested elements and repeated tags. */
export function parseXml<T = Record<string, unknown>>(source: string, options: XmlOptions = {}): T {
  if (source.trim() === "") {
    throw new ParserError("XML", "Cannot parse an empty XML document.");
  }

  const validation = XMLValidator.validate(source);
  if (validation !== true) {
    const { line, col, msg } = validation.err;
    throw new ParserError("XML", `Invalid XML at line ${line}, column ${col}: ${msg}`);
  }

  try {
    const parser = new XMLParser({
      ignoreAttributes: options.ignoreAttributes ?? false,
      parseTagValue: options.parseTagValues ?? false,
      parseAttributeValue: options.parseTagValues ?? false,
      trimValues: true,
      allowBooleanAttributes: false,
    });
    return parser.parse(source) as T;
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : "Unknown syntax error";
    throw new ParserError("XML", `Invalid XML: ${detail}`, { cause });
  }
}

/** Reads and parses a UTF-8 XML file. */
export async function parseXmlFile<T = Record<string, unknown>>(
  filePath: string,
  options?: XmlOptions,
): Promise<T> {
  let source: string;
  try {
    source = await readFile(filePath, "utf8");
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : "Unknown file error";
    throw new ParserError("XML", `Unable to read XML file \"${filePath}\": ${detail}`, {
      cause,
      filePath,
    });
  }

  try {
    return parseXml<T>(source, options);
  } catch (cause) {
    if (cause instanceof ParserError) {
      throw new ParserError("XML", `${cause.message} (file: ${filePath})`, {
        cause,
        filePath,
      });
    }
    throw cause;
  }
}

export const parseXML = parseXml;
export const parseXMLFile = parseXmlFile;
