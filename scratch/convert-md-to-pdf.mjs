import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { marked } = require("marked");

const [,, inputPath, outputHtmlPath] = process.argv;

if (!inputPath || !outputHtmlPath) {
  console.error("Usage: node convert-md-to-pdf.mjs <input.md> <output.html>");
  process.exit(1);
}

const markdown = fs.readFileSync(inputPath, "utf8");
marked.setOptions({
  gfm: true,
  breaks: false,
  mangle: false,
  headerIds: true,
});

const body = marked.parse(markdown);
const title = path.basename(inputPath, ".md").replace(/_/g, " ");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      color: #172033;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11.2px;
      line-height: 1.52;
    }
    main {
      max-width: 920px;
      margin: 0 auto;
    }
    h1 {
      color: #07111f;
      font-size: 28px;
      line-height: 1.15;
      margin: 0 0 14px;
      padding-bottom: 12px;
      border-bottom: 4px solid #16b8cc;
    }
    h2 {
      color: #0b1730;
      font-size: 18px;
      margin: 25px 0 10px;
      padding-top: 8px;
      page-break-after: avoid;
    }
    h3 {
      color: #0f335f;
      font-size: 14px;
      margin: 18px 0 8px;
      page-break-after: avoid;
    }
    p {
      margin: 7px 0;
    }
    a {
      color: #0f7490;
      text-decoration: none;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px;
      page-break-inside: avoid;
      font-size: 10px;
    }
    th {
      background: #0b1730;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
    }
    th, td {
      border: 1px solid #d8e1ec;
      padding: 6px 7px;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #f6f9fc;
    }
    ul, ol {
      margin: 7px 0 11px 20px;
      padding: 0;
    }
    li {
      margin: 3px 0;
    }
    code {
      font-family: Consolas, "Courier New", monospace;
      background: #eef4f8;
      color: #073b4c;
      padding: 1px 4px;
      border-radius: 4px;
      font-size: 10px;
    }
    pre {
      background: #07111f;
      color: #edf7fb;
      padding: 12px;
      border-radius: 8px;
      overflow: hidden;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 9.5px;
      page-break-inside: avoid;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #16b8cc;
      margin: 10px 0;
      padding: 8px 12px;
      background: #f3fbfd;
      color: #355064;
    }
    hr {
      border: 0;
      border-top: 1px solid #d8e1ec;
      margin: 18px 0;
    }
    strong {
      color: #0b1730;
    }
  </style>
</head>
<body>
  <main>${body}</main>
</body>
</html>`;

fs.writeFileSync(outputHtmlPath, html, "utf8");
