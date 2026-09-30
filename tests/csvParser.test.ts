import { describe, expect, it } from "vitest";
import { parseCsv, parseCsvFile } from "../src/parsers/csvParser.js";

describe("CSV parser", () => {
  it("handles quoted commas, escaped quotes, embedded newlines, CRLF, and a BOM", () => {
    const csv = '\uFEFFname,note\r\n"Doe, Jane","said ""hello""\nand left"\r\n';
    expect(parseCsv(csv)).toEqual([{ name: "Doe, Jane", note: 'said "hello"\nand left' }]);
  });

  it("rejects malformed rows, quotes, and headers", () => {
    expect(() => parseCsv("a,b\n1")).toThrow(/row 2/);
    expect(() => parseCsv('a\n"unfinished')).toThrow(/unterminated/);
    expect(() => parseCsv("a,a\n1,2")).toThrow(/unique/);
    expect(() => parseCsv(" ")).toThrow(/empty CSV/);
  });

  it("supports an alternate delimiter", () => {
    expect(parseCsv("a;b\n1;2", { delimiter: ";" })).toEqual([{ a: "1", b: "2" }]);
  });

  it("parses the supplied cake data", async () => {
    const cakes = await parseCsvFile("src/data/cake orders.csv");
    expect(cakes.length).toBeGreaterThan(0);
    expect(cakes[0]).toHaveProperty("id");
  });

  it("reports file read errors", async () => {
    await expect(parseCsvFile("missing.csv")).rejects.toThrow(/Unable to read CSV file/);
  });
});
