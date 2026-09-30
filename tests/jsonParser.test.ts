import { describe, expect, it } from "vitest";
import { parseJson, parseJsonFile } from "../src/parsers/jsonParser.js";

describe("JSON parser", () => {
  it("handles all JSON value types and nesting", () => {
    expect(parseJson('{"text":"ok","number":2.5,"bool":true,"none":null,"array":[1,{"x":false}]}')).toEqual({
      text: "ok",
      number: 2.5,
      bool: true,
      none: null,
      array: [1, { x: false }],
    });
  });

  it("rejects malformed and empty input with useful errors", () => {
    expect(() => parseJson("{broken}")).toThrow(/Invalid JSON/);
    expect(() => parseJson("  ")).toThrow(/empty JSON/);
  });

  it("parses the supplied book data", async () => {
    const books = await parseJsonFile<Array<Record<string, string>>>("src/data/book orders.json");
    expect(books.length).toBeGreaterThan(0);
    expect(books[0]).toHaveProperty("Order ID");
  });

  it("reports file read errors", async () => {
    await expect(parseJsonFile("missing.json")).rejects.toThrow(/Unable to read JSON file/);
  });
});
