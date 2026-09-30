export type SupportedFormat = "CSV" | "JSON" | "XML" | "UNKNOWN";

/** A consistent error type exposed by every parser in the engine. */
export class ParserError extends Error {
  public readonly format: SupportedFormat;
  public readonly filePath?: string;

  public constructor(
    format: SupportedFormat,
    message: string,
    options: { cause?: unknown; filePath?: string } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ParserError";
    this.format = format;
    this.filePath = options.filePath;
  }
}
