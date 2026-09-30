import { describe, expect, it } from "vitest";
import { ParserError, parseFile } from "../src/index.js";

describe("parser engine", () => {
  it.each([
    "src/data/book orders.json",
    "src/data/cake orders.csv",
    "src/data/toy orders.xml",
  ])("selects the correct parser for %s", async (filePath) => {
    await expect(parseFile(filePath)).resolves.toBeDefined();
  });

  it("handles case-insensitive file extensions", async () => {
    await expect(parseFile("anything.YAML")).rejects.toMatchObject({
      name: "ParserError",
      format: "UNKNOWN",
    });
  });

  it("exposes a consistent parser error type", async () => {
    await expect(parseFile("unsupported.txt")).rejects.toBeInstanceOf(ParserError);
  });
});
