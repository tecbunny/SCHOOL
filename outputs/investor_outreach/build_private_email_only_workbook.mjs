import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "file:///C:/Users/tecbu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const headers = [
  "Name",
  "Firm",
  "Email",
  "Category",
  "Fit for EduPortal",
  "Verification / Note",
  "Source / LinkedIn / Website",
];

const rows = [
  [
    "Investment Team",
    "AIDGE Ventures",
    "pitch@aidge.ventures",
    "Pre-seed / Seed VC",
    "Strong fit: India tech, pre-seed/seed, sector-agnostic",
    "Official site says submit deck via pitch email",
    "https://www.aidge.ventures/",
  ],
  [
    "Investment Team",
    "2am VC",
    "pitch@2amvc.com",
    "Early-stage VC",
    "Strong fit: India-only early-stage fund",
    "Official pitch page lists email",
    "https://www.2amvc.com/pitch",
  ],
  [
    "Investment Team",
    "Aavishkaar Capital",
    "funds@aavishkaar.in",
    "Impact VC",
    "Strong fit: Bharat, essential services, impact",
    "Official contact page for entrepreneurs raising equity",
    "https://aavishkaarcapital.in/contact-us/",
  ],
  [
    "Investment Team",
    "pi Ventures",
    "info@piventures.in",
    "Deeptech / AI VC",
    "Good fit for AI/offline infrastructure angle",
    "Official FAQ says startups can submit pitch decks to email",
    "https://www.piventures.in/",
  ],
  [
    "Investment Team",
    "Motus Ventures",
    "info@motusventures.com",
    "AI / Deeptech VC",
    "Moderate fit: AI/deeptech global investor",
    "Official contact page",
    "https://motusventures.com/contact-us/",
  ],
  [
    "Investment Team",
    "DFW Angels",
    "info@dfw-angels.com",
    "Angel network",
    "Moderate fit: angel network route",
    "Official contact page",
    "https://www.dfw-angels.com/",
  ],
  [
    "Investment Team",
    "30 Second Pitch",
    "info@30secondpitch.com",
    "Pitch platform / angel access",
    "Moderate fit: pitch-distribution platform",
    "Official site asks founders to submit via email",
    "https://www.30secondpitch.com/",
  ],
  [
    "Investment Team",
    "Foreground Capital",
    "pitch@foreground.vc",
    "Impact / private VC",
    "Weak-to-moderate fit: impact investor; not education-focused",
    "Official pitch email on contact page",
    "https://foreground.vc/contact/",
  ],
  [
    "Investment Team",
    "ZAS Ventures",
    "hello@zas.ventures",
    "Global/India angel/VC network",
    "Moderate fit: India/US/EMEA investor network",
    "Official site lists contact email",
    "https://zas.ventures/",
  ],
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Private Email Only");
sheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
sheet.getRangeByIndexes(1, 0, rows.length, headers.length).values = rows;
sheet.getRangeByIndexes(0, 0, 1, headers.length).format = {
  fill: "#1F4E79",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
};
sheet.getRangeByIndexes(0, 0, rows.length + 1, headers.length).format.wrapText = true;
sheet.getRange("A:A").format.columnWidthPx = 145;
sheet.getRange("B:B").format.columnWidthPx = 220;
sheet.getRange("C:C").format.columnWidthPx = 225;
sheet.getRange("D:D").format.columnWidthPx = 180;
sheet.getRange("E:E").format.columnWidthPx = 340;
sheet.getRange("F:F").format.columnWidthPx = 280;
sheet.getRange("G:G").format.columnWidthPx = 300;
sheet.freezePanes.freezeRows(1);
sheet.tables.add(`A1:G${rows.length + 1}`, true, "PrivateEmailInvestorTable");

const notes = workbook.worksheets.add("Notes");
notes.getRange("A1:B5").values = [
  ["Metric", "Value"],
  ["Total private email rows", rows.length],
  ["Government/grant rows removed", "Yes"],
  ["Form-only rows removed", "Yes"],
  ["Already emailed on 2026-05-03", "Yes"],
];
notes.getRange("A1:B1").format = { fill: "#1F4E79", font: { bold: true, color: "#FFFFFF" } };
notes.getRange("A:A").format.columnWidthPx = 230;
notes.getRange("B:B").format.columnWidthPx = 160;

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(__dirname, "eduportal_private_investor_emails_only.xlsx"));
