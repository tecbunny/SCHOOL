import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "file:///C:/Users/tecbu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const removeHeaders = ["Email", "Reason", "Action"];
const removeRows = [
  ["pitches@bancroftventures.com", "Hard bounce: user does not exist", "Remove"],
  ["investments@bancroftventures.com", "Hard bounce: user does not exist", "Remove"],
  ["hello@tenlabs.in", "Hard bounce: address not found", "Remove"],
  ["shivani.pandey@juagrisciences.com", "Hard bounce: recipient not found / routing loop", "Remove"],
  ["shruti.malhotra@onetaploan.com", "Hard bounce: address not found", "Remove"],
  ["Investmentbusinessplan@kalaari.com", "Hard bounce: address not found", "Remove"],
  ["Webinfo@gabrielvp.com", "Hard bounce: address not found", "Remove"],
  ["info@jamcracker.com", "Hard bounce: address not found", "Remove"],
  ["apac-info@brocade.com", "Hard bounce: address not found", "Remove"],
  ["pm@tiehyderabad.org", "Hard bounce: address not found", "Remove"],
  ["gm@tiehyderabad.org", "Hard bounce: address not found", "Remove"],
  ["pd@tiehyderabad.org", "Hard bounce: address not found", "Remove"],
  ["info@jaingroup.info", "Hard bounce: domain not found", "Remove"],
  ["nealuvinfo@nealuv.com", "Hard bounce: domain not found", "Remove"],
  ["info-india@lsvp.com", "Hard bounce: address not found", "Remove"],
  ["infoindia@matrixpartners.com", "Hard bounce: address not found", "Remove"],
  ["jeevesh@blume.vc", "Hard bounce: address not found", "Remove"],
  ["Kishore.kumarm@rblbank.com", "Hard bounce: address not found", "Remove"],
  ["sumit@kalaari.com", "Hard bounce: address not found", "Remove"],
  ["rohit.shankar@t-hub.co", "Hard bounce: address not found", "Remove"],
  ["neeraj@wefoundercircle.com", "Hard bounce: address not found", "Remove"],
  ["amit@unicornivc.com", "Hard bounce: address not found", "Remove"],
  ["bikram@unicornivc.com", "Hard bounce: address not found", "Remove"],
  ["prithvireddy@vuvpfund.com", "Hard bounce: address not found", "Remove"],
  ["manav@emvo.ai", "Hard bounce: address not found", "Remove"],
  ["anush.r@startupxseed.in", "Hard bounce: address not found", "Remove"],
  ["apoorv@shecapital.vc", "Hard bounce: address not found", "Remove"],
  ["sirish@silverneedle.vc", "Hard bounce: address not found", "Remove"],
  ["abhishek@peercapital.in", "Hard bounce: address not found", "Remove"],
  ["shobhankita.reddy@specialeinvest.com", "Hard bounce: address not found", "Remove"],
  ["hello@sucseedindovation.co", "Hard bounce: domain not found", "Remove"],
  ["badri@specialeinvest.com", "Hard bounce: address not found", "Remove"],
  ["kajal.n@quantumvaluecfo.com", "Hard bounce: address not found", "Remove"],
  ["apurva.chawla@letsventure.com", "Hard bounce: address not found", "Remove"],
  ["priyanka.sawant@invascent.com", "Hard bounce: address not found", "Remove"],
  ["snanti@letsventure.com", "Hard bounce: address not found", "Remove"],
  ["charu@omidyarnetwork.in", "Hard bounce: address not found", "Remove"],
  ["harish@focusprism.com", "Temporary bounce: inbox full", "Pause / retry later only if high priority"],
  ["arun@gmail.com", "Temporary bounce: inbox full", "Pause / retry later only if high priority"],
];

const altHeaders = ["Original / Firm", "Replacement Email", "Status", "Source / Website", "Notes"];
const altRows = [
  ["TiE Hyderabad old addresses", "info@tiehyderabad.org", "Official alternative", "https://hyderabad.tie.org/contact-us/", "Use instead of pm@, gm@, and pd@ tiehyderabad.org."],
  ["TiE Hyderabad programs", "cm-mro@tiehyderabad.org", "Official alternative", "https://hyderabad.tie.org/contact-us/", "Charter membership/program route; use only if relevant."],
  ["TiE Hyderabad programs", "am-mro@tiehyderabad.org", "Official alternative", "https://hyderabad.tie.org/contact-us/", "Associate membership/program route; use only if relevant."],
  ["StartupXseed individual bounce", "ideas@startupxseed.in", "Official alternative", "https://startupxseed.in/", "Use instead of anush.r@startupxseed.in."],
  ["Silverneedle Ventures individual bounce", "info@silverneedle.vc", "Official alternative", "https://silverneedle.vc/contact/", "Use instead of sirish@silverneedle.vc."],
  ["LetsVenture individual bounces", "contact@letsventure.com", "Official alternative", "https://www.letsventure.com/us", "Use instead of apurva.chawla@ and snanti@."],
  ["SucSEED typo/domain bounce", "Pitch@Sucseedindovation.com", "User-provided alternative", "Mailbox handoff from bounce/reply", "Use instead of hello@sucseedindovation.co."],
  ["SucSEED deal route", "Pitch@Sucseed.co", "User-provided alternative", "Mailbox handoff from bounce/reply", "Use for deal-specific discussion."],
  ["Unicorn India Ventures personal bounces", "info@unicornivc.com", "Public directory alternative", "https://www.privateequityinternational.com/institution-profiles/unicorn-india-ventures.html", "Use instead of amit@ and bikram@; source is a public PEI profile."],
  ["Matrix Partners India / Z47 old general bounce", "info@matrixpartners.com", "Public directory alternative", "https://www.bharatibiz.com/en/matrix-partners-022-6768-0000", "Use cautiously; old infoindia@matrixpartners.com bounced."],
  ["Bancroft Ventures", "", "No working alternative found", "https://bancroftventures.com/", "Official site still lists the bounced emails; remove until independently verified."],
  ["TEN Labs", "", "No working alternative found", "https://tenlabs.in/", "Official site lists hello@tenlabs.in, which bounced; use website form/LinkedIn instead."],
  ["Kalaari Capital", "", "No public email found", "https://kalaari.com/pitch/", "Use official pitch page/contact flow instead of Investmentbusinessplan@ or personal bounced addresses."],
  ["Blume Ventures", "", "No common pitch email", "https://blume.vc/contact-us", "Blume says it has no common pitch email; choose one relevant investment-team person or warm intro."],
  ["Omidyar Network", "", "No pitch email found", "https://omidyar.com/frequently-asked-questions/", "Use official contact form; legal@omidyar.com is not a pitch route."],
  ["Speciale Invest individual bounces", "", "No public email found", "https://www.specialeinvest.com/about", "Use official site/team routes; personal emails bounced."],
  ["We Founder Circle individual bounce", "", "No public email found", "https://www.wefoundercircle.com/", "Use official website/contact/application route."],
  ["Lightspeed India old email", "", "No reliable replacement found", "https://lsvp.com/india/", "info-india@lsvp.com bounced; use official site route or partner-specific warm intro."],
  ["Gabriel Venture Partners old email", "", "No reliable replacement found", "https://www.mycapital.com/venture-capital-firms/gabriel-venture-partners.html", "Webinfo@gabrielvp.com bounced; no official replacement found."],
];

const cleanedHeaders = ["Name", "Firm", "Email", "Category", "Fit for EduPortal", "Source Quality", "Source / Website", "Notes"];
const cleanedRows = [
  ["Investment Team", "Innopark Ventures", "investments@innoparkventures.com", "Seed to Series B VC", "Good fit: AI/ML, enterprise SaaS, healthtech, deeptech", "Official website", "https://www.innoparkventures.com/", "Hyderabad-based SEBI AIF; official contact email."],
  ["Investment Team", "VC Grid", "hello@vcgrid.in", "VC / family office investment platform", "Moderate fit: private investor network backed by Venture Catalysts", "Official website", "https://vcgrid.in/", "Has startup get-invested form plus public email."],
  ["Investment Team", "Ideamill", "ventures@ideamill.vc", "Climate / space / deeptech venture builder", "Moderate fit: EduOS hardware/offline infra if framed as deeptech impact", "Official website", "https://www.ideamill.vc/", "Official ventures and investment email."],
  ["Investment Team", "Ideamill", "hello@ideamill.vc", "Climate / space / deeptech venture builder", "Moderate fit: general backup route", "Official website", "https://www.ideamill.vc/", "Use only if ventures@ideamill.vc bounces or for general contact."],
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
  ["Investment Team", "StartupXseed", "ideas@startupxseed.in", "Deeptech / early-stage VC", "Good fit: AI/ML, cyber, frontier tech, global focus", "Official website", "https://startupxseed.in/", "Generic official deck email."],
  ["Investment Team", "TiE Hyderabad", "info@tiehyderabad.org", "Angel / entrepreneur network", "Moderate fit for mentor/investor routing", "Official website", "https://hyderabad.tie.org/contact-us/", "Replacement for bounced TiE Hyderabad personal/admin emails."],
  ["Investment Team", "Silverneedle Ventures", "info@silverneedle.vc", "Early-stage VC", "Good fit if pitching via official channel", "Official website", "https://silverneedle.vc/contact/", "Replacement for bounced personal email."],
  ["Investment Team", "LetsVenture", "contact@letsventure.com", "Angel platform", "Good fit for platform route", "Official website", "https://www.letsventure.com/us", "Replacement for bounced personal emails."],
  ["Investment Team", "Unicorn India Ventures", "info@unicornivc.com", "Early-stage VC", "Moderate fit: Tier 2/3 and tech startups", "Public directory", "https://www.privateequityinternational.com/institution-profiles/unicorn-india-ventures.html", "Replacement for bounced personal emails; verify before high priority."],
  ["Investment Team", "SucSEED Indovation", "Pitch@Sucseedindovation.com", "Angel / early-stage investor", "Good fit: deal-specific route provided by mailbox handoff", "User-provided bounce reply", "Mailbox handoff", "Replacement for bounced hello@sucseedindovation.co."],
  ["Investment Team", "SucSEED", "Pitch@Sucseed.co", "Angel / early-stage investor", "Good fit: deal-specific route provided by mailbox handoff", "User-provided bounce reply", "Mailbox handoff", "Deal-specific route."],
];

function addSheet(workbook, name, headers, rows) {
  const sheet = workbook.worksheets.add(name);
  sheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
  sheet.getRangeByIndexes(1, 0, rows.length, headers.length).values = rows;
  sheet.getRangeByIndexes(0, 0, 1, headers.length).format = {
    fill: "#1F4E79",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
  sheet.getRangeByIndexes(0, 0, rows.length + 1, headers.length).format.wrapText = true;
  for (let i = 0; i < headers.length; i += 1) {
    sheet.getRangeByIndexes(0, i, rows.length + 1, 1).format.columnWidthPx = [250, 250, 260, 230, 360, 190, 330, 360][i] ?? 250;
  }
  sheet.freezePanes.freezeRows(1);
  sheet.tables.add(`A1:${String.fromCharCode(64 + headers.length)}${rows.length + 1}`, true, name.replaceAll(" ", "") + "Table");
}

const workbook = Workbook.create();
addSheet(workbook, "Remove These", removeHeaders, removeRows);
addSheet(workbook, "Alternatives", altHeaders, altRows);
addSheet(workbook, "Clean Email List", cleanedHeaders, cleanedRows);

const notes = workbook.worksheets.add("Notes");
notes.getRange("A1:B7").values = [
  ["Metric", "Value"],
  ["Hard/temporary bounce rows captured", removeRows.length],
  ["Alternative rows found", altRows.filter((r) => r[1]).length],
  ["Clean email list rows", cleanedRows.length],
  ["Bancroft and TEN Labs", "Removed; no working alternative email found."],
  ["Quota warning", "Pause bulk sending for 24 hours after quota bounces."],
  ["Recommendation", "Send only from Clean Email List after bounce/quota cooldown."],
];
notes.getRange("A1:B1").format = { fill: "#1F4E79", font: { bold: true, color: "#FFFFFF" } };
notes.getRange("A:A").format.columnWidthPx = 260;
notes.getRange("B:B").format.columnWidthPx = 520;
notes.getRange("A:B").format.wrapText = true;

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(__dirname, "eduportal_bounce_cleanup_and_alternatives.xlsx"));
