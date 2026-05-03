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
  "Source Quality",
  "Source / Website",
  "Notes",
];

const rows = [
  ["Investment Team", "Innopark Ventures", "investments@innoparkventures.com", "Seed to Series B VC", "Good fit: AI/ML, enterprise SaaS, healthtech, deeptech", "Official website", "https://www.innoparkventures.com/", "Hyderabad-based SEBI AIF; official contact email."],
  ["Investment Team", "VC Grid", "hello@vcgrid.in", "VC / family office investment platform", "Moderate fit: private investor network backed by Venture Catalysts", "Official website", "https://vcgrid.in/", "Has startup get-invested form plus public email."],
  ["Investment Team", "Ideamill", "ventures@ideamill.vc", "Climate / space / deeptech venture builder", "Moderate fit: EduOS hardware/offline infra if framed as deeptech impact", "Official website", "https://www.ideamill.vc/", "Official ventures and investment email."],
  ["Investment Team", "Ideamill", "hello@ideamill.vc", "Climate / space / deeptech venture builder", "Moderate fit: general backup route", "Official website", "https://www.ideamill.vc/", "Use only if ventures@ideamill.vc bounces or for general contact."],
  ["Investment Team", "TEN Labs", "hello@tenlabs.in", "Venture studio", "Moderate fit: Pune venture studio looking for AI/domain founders", "Official website", "https://tenlabs.in/", "Not a classic VC fund, but founder/investor support route."],
  ["Investment Team", "Risin Ventures", "info@risin.ventures", "Venture studio / incubation support", "Moderate fit: India and MENA startup support", "Official website", "https://risin.ventures/join-us/", "Official page asks entrepreneurs to send pitch deck."],
  ["Investment Team", "Merak Ventures", "investments@merakventures.com", "Early-stage VC", "Good fit: seed-stage B2B, emerging tech, AI, SaaS", "Public investor database", "https://inforcapital.com/companies/merak-ventures/", "Email listed on InforCapital profile; verify before high-priority outreach."],
  ["Investment Team", "Magma Ventures", "investments@magmaventures.com", "Early-to-growth private investor", "Good fit: SaaS/healthcare/consumer, operating leverage", "Official website", "https://www.magmaventures.com/", "Official pitch section says write to this email."],
  ["Investment Team", "CoCreate Ventures / Aarambh Fund", "analyst@cocreate.ventures", "Venture studio / early-stage deeptech fund", "Good fit: hard tech, innovation, real-economy technology", "Official website", "https://arambh.vc/", "Official site says write to analyst email for issues/apply route."],
  ["Investment Team", "Waveform Ventures", "hello@waveform.vc", "Early-stage angel syndicate / VC", "Strong fit: India-focused seed to Series A, sector agnostic", "Official website", "https://waveform.vc/", "FAQ says founders can write to this email with deck or pitch."],
  ["Investment Team", "ZAR Partners", "admin@zarpartners.com", "Micro VC", "Moderate fit: early-stage, especially trade/logistics/supply chain", "Official website", "https://zarpartners.com/", "Official founder section asks deck to be sent here."],
  ["Investment Team", "GrowthCap Ventures", "pitch@growthcap.vc", "Early-stage VC", "Good fit: AI/deeptech; less direct for education unless AI is emphasized", "LinkedIn / public post", "https://in.linkedin.com/company/growthcap-vc", "Public company update says AI/deeptech founders should write here."],
  ["Investment Team", "GoodWorks Angel Fund", "hello@goodworksvc.in", "Early-stage VC / angel fund", "Good fit: early-stage; portfolio includes education/upskilling", "Official website", "https://goodworksvc.in/", "Official site lists public email."],
  ["Investment Team", "Capital-A", "hello@capital-a.vc", "Early-stage VC", "Moderate fit: manufacturing, climate, deeptech, industrial tech", "Official website", "https://capital-a.vc/about/", "Your old list had a Capital-A personal contact; this is generic public email."],
  ["Investment Team", "Capital-A", "hello@capital-a.in", "Early-stage VC", "Moderate fit: manufacturing, climate, deeptech, industrial tech", "Official website", "https://www.capital-a.in/about-us", "Alternate official domain email; use one Capital-A email, not both, unless needed."],
  ["Investment Team", "DeVC", "hello@devc.com", "Early-stage VC", "Good fit: AI, SaaS, hardware, deeptech", "Public investor database", "https://inforcapital.com/companies/devc/", "Listed on InforCapital profile; verify before high-priority outreach."],
  ["Investment Team", "Catamaran Ventures", "info@catamaranventures.in", "Family office / VC", "Moderate fit: tech, consumer, healthcare; likely high bar", "Public investor database", "https://inforcapital.com/companies/catamaran-ventures/", "Listed on InforCapital profile; public database rather than firm page."],
  ["Investment Team", "Bancroft Ventures", "pitches@bancroftventures.com", "Pre-seed / seed investor", "Moderate fit: says it invests in India and distance learning", "Official website", "https://bancroftventures.com/", "Official site writes email as pitches[@]bancroftventures.com."],
  ["Investment Team", "Bancroft Ventures", "investments@bancroftventures.com", "Pre-seed / seed investor", "Moderate fit: proposal/investment opportunity route", "Official website", "https://bancroftventures.com/", "Use pitches@ for startup pitch first; this is alternate proposal route."],
  ["Investment Team", "StartupXseed", "ideas@startupxseed.in", "Deeptech / early-stage VC", "Good fit: AI/ML, cyber, frontier tech, global focus", "Official website", "https://startupxseed.in/", "Your old list had StartupXseed people; this is generic official deck email."],
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("More Private Emails");
sheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
sheet.getRangeByIndexes(1, 0, rows.length, headers.length).values = rows;
sheet.getRangeByIndexes(0, 0, 1, headers.length).format = {
  fill: "#1F4E79",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
};
sheet.getRangeByIndexes(0, 0, rows.length + 1, headers.length).format.wrapText = true;
sheet.getRange("A:A").format.columnWidthPx = 145;
sheet.getRange("B:B").format.columnWidthPx = 230;
sheet.getRange("C:C").format.columnWidthPx = 250;
sheet.getRange("D:D").format.columnWidthPx = 210;
sheet.getRange("E:E").format.columnWidthPx = 350;
sheet.getRange("F:F").format.columnWidthPx = 160;
sheet.getRange("G:G").format.columnWidthPx = 300;
sheet.getRange("H:H").format.columnWidthPx = 330;
sheet.freezePanes.freezeRows(1);
sheet.tables.add(`A1:H${rows.length + 1}`, true, "MorePrivateEmailInvestorTable");

const notes = workbook.worksheets.add("Notes");
notes.getRange("A1:B7").values = [
  ["Metric", "Value"],
  ["Rows", rows.length],
  ["Direct email rows", rows.length],
  ["Government funding removed", "Yes"],
  ["Form-only rows removed", "Yes"],
  ["Duplicate-firm warning", "Some firms had personal contacts in the earlier campaign; notes identify this."],
  ["Recommended next action", "Review and send one BCC batch, excluding alternate duplicate emails if desired."],
];
notes.getRange("A1:B1").format = { fill: "#1F4E79", font: { bold: true, color: "#FFFFFF" } };
notes.getRange("A:A").format.columnWidthPx = 230;
notes.getRange("B:B").format.columnWidthPx = 520;
notes.getRange("A:B").format.wrapText = true;

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(__dirname, "eduportal_more_private_investor_emails.xlsx"));
