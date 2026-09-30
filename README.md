# Multi-Format Parser Engine

A TypeScript parser engine for CSV, JSON, and XML files. It converts each supported format into JavaScript objects and reports malformed input through a consistent `ParserError` type.

## Setup and verification

```bash
npm install
npm run check
```

The supplied assignment data is in `src/data`. Build output is written to `dist`.

## Usage

```ts
import { parseFile, parseJsonFile, parseXmlFile } from "./src/index.js";

const data = await parseFile("src/data/book orders.json");

// Individual parsers are also available when the format is already known.
const json = await parseJsonFile("example.json");
const xml = await parseXmlFile("example.xml", { parseTagValues: true });
```

The CSV parser supports quoted fields, escaped quotes, embedded newlines, CRLF line endings, BOMs, custom delimiters, and strict row validation. The XML parser preserves nested structures, repeated elements, attributes, entities, and CDATA. JSON values retain their native types.

## Project structure

```text
src/
  data/          Supplied CSV, JSON, and XML files
  errors/        Shared ParserError
  parsers/       Format-specific parsers
  parserEngine.ts
tests/           Unit, edge-case, integration, and error tests
```
