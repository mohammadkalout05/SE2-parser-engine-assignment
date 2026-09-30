import { describe, expect, it } from "vitest";
import { parseXml, parseXmlFile } from "../src/parsers/xmlParser.js";

describe("XML parser", () => {
  it("handles nested elements, arrays, attributes, entities, and CDATA", () => {
    const result = parseXml<{ root: Record<string, unknown> }>(
      '<root active="true"><item id="1">one &amp; two</item><item id="2"><![CDATA[<raw>]]></item></root>',
    );
    expect(result.root).toEqual({
      item: [
        { "#text": "one & two", "@_id": "1" },
        { "#text": "<raw>", "@_id": "2" },
      ],
      "@_active": "true",
    });
  });

  it("can convert element and attribute primitives", () => {
    expect(parseXml('<root enabled="true"><count>3</count></root>', { parseTagValues: true })).toEqual({
      root: { count: 3, "@_enabled": true },
    });
  });

  it("rejects malformed and empty XML", () => {
    expect(() => parseXml("<root><child></root>")).toThrow(/Invalid XML/);
    expect(() => parseXml("  ")).toThrow(/empty XML/);
  });

  it("parses the supplied toy data", async () => {
    const toys = await parseXmlFile<{ data: { row: unknown[] } }>("src/data/toy orders.xml");
    expect(toys.data.row.length).toBeGreaterThan(0);
  });

  it("reports file read errors", async () => {
    await expect(parseXmlFile("missing.xml")).rejects.toThrow(/Unable to read XML file/);
  });
});
