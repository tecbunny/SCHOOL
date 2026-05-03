import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "file:///C:/Users/tecbu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = __dirname;

const tsv = `Name	Firm	Email	Category	Fit for EduPortal	Verification / Note	Source / LinkedIn / Website
Investment Team	AIDGE Ventures	pitch@aidge.ventures	Pre-seed / Seed VC	Strong fit: India tech, pre-seed/seed, sector-agnostic	Official site says submit deck via pitch email	https://www.aidge.ventures/
Investment Team	2am VC	pitch@2amvc.com	Early-stage VC	Strong fit: India-only early-stage fund	Official pitch page lists email	https://www.2amvc.com/pitch
Investment Team	Aavishkaar Capital	funds@aavishkaar.in	Impact VC	Strong fit: Bharat, essential services, impact	Official contact page for entrepreneurs raising equity	https://aavishkaarcapital.in/contact-us/
Investment Team	pi Ventures	info@piventures.in	Deeptech / AI VC	Good fit for AI/offline infrastructure angle	Official FAQ says startups can submit pitch decks to email	https://www.piventures.in/
Investment Team	Motus Ventures	info@motusventures.com	AI / Deeptech VC	Moderate fit: AI/deeptech global investor	Official contact page	https://motusventures.com/contact-us/
Investment Team	DFW Angels	info@dfw-angels.com	Angel network	Moderate fit: angel network route	Official contact page	https://www.dfw-angels.com/
Investment Team	30 Second Pitch	info@30secondpitch.com	Pitch platform / angel access	Moderate fit: pitch-distribution platform	Official site asks founders to submit via email	https://www.30secondpitch.com/
Investment Team	Foreground Capital	pitch@foreground.vc	Impact / health-focused VC	Weak-to-moderate fit: impact investor; not education-focused	Official pitch email on contact page	https://foreground.vc/contact/
Investment Team	ZAS Ventures	hello@zas.ventures	Global/India angel/VC network	Moderate fit: India/US/EMEA investor network	Official site lists contact email	https://zas.ventures/
Investment Team	Startup India Seed Fund Scheme	Form only	Government seed fund / non-dilutive	Strong fit for MVP validation and pilot support	Official application route through incubators	https://www.startupindia.gov.in/content/sih/en/startup-scheme.html
Investment Team	MeitY TIDE 2.0	Form only	Government grant / incubator support	Good fit for ICT-enabled education platform and pilots	Official MeitY/TIDE application route	https://meitystartuphub.in/tide-2-0/
Investment Team	Atal Innovation Mission	Form only	Government / innovation ecosystem	Moderate fit for school/education innovation partnerships	Official AIM programs route	https://aim.gov.in/
Investment Team	Technology Development Board	Form only	Government funding / commercialization	Moderate fit for indigenous technology commercialization	Official project funding route	https://tdb.gov.in/
Investment Team	CIIE.CO / IIMA Ventures	Form only	Incubator / seed investor	Strong fit: education, impact, tech-enabled India startups	Official pitch/apply route	https://iimaventures.com/
Investment Team	Villgro	Form only	Impact incubator / seed support	Strong fit: education impact and underserved markets	Official entrepreneur application route	https://villgro.org/
Investment Team	Acumen India	Form only	Impact investor	Strong fit: low-income and access-focused education impact	Official contact/program routes	https://acumen.org/india/
Investment Team	Gray Matters Capital	Form only	Education impact investor	Strong fit: education outcomes and access	Official contact route	https://graymatterscap.com/
Investment Team	Central Square Foundation	Form only	Education philanthropy / ecosystem	Strong ecosystem fit, not typical VC funding	Official contact/partnership route	https://www.centralsquarefoundation.org/
Investment Team	ACT Grants	Form only	Philanthropic grant / impact capital	Good fit for education access or AI-for-good pilots	Official grant application route	https://actgrants.in/
Investment Team	Michael & Susan Dell Foundation India	Form only	Impact philanthropy	Strong thematic fit: education and low-income populations	Official contact route	https://www.dell.org/
Investment Team	Omidyar Network India	Form only	Impact / tech-for-good investor	Strong fit: education/access/India digital public good angle	Official website contact route	https://omidyarnetwork.in/
Investment Team	Elevar Equity	Form only	Impact VC	Good fit: underserved communities, financial inclusion/essential services	Official contact route	https://elevarequity.com/
Investment Team	Lok Capital	Form only	Impact VC	Moderate fit: inclusive growth / essential services	Official contact route	https://lokcapital.com/
Investment Team	Unitus Ventures	Form only	Impact seed VC	Strong fit: education and low-income India scale	Official Unitus contact route	https://unitus.com/contact-us/
Investment Team	Patamar Capital	Form only	Impact VC	Moderate fit: livelihood/impact, Asia	Official contact route	https://patamar.com/
Investment Team	Bharat Innovation Fund	Form only	Deeptech / Bharat VC	Good fit for India-first tech and infrastructure angle	Official website route	https://bharat.fund/
Investment Team	Artha Venture Fund	Form only	Seed VC	Good fit: early-stage India startups	Official website route	https://artha.vc/
Investment Team	Arali Ventures	Form only	Enterprise / deeptech seed VC	Good fit: B2B SaaS, AI, infrastructure	Official website route	https://araliventures.com/
Investment Team	Ideaspring Capital	Form only	B2B / deeptech VC	Good fit: enterprise software and AI workflows	Official website route	https://www.ideaspringcap.com/
Investment Team	YourNest Venture Capital	Form only	Deeptech / early-stage VC	Good fit: AI, SaaS, deeptech India	Official website route	https://www.yournest.in/
Investment Team	GrowX Ventures	Form only	B2B / deeptech VC	Good fit: enterprise SaaS and AI-assisted workflows	Official website route	https://growxventures.com/
Investment Team	Leo Capital	Form only	Early-stage VC	Good fit: B2B software and Indian SaaS	Official website route	https://www.leocapital.in/
Investment Team	PointOne Capital	Form only	Pre-seed VC	Good fit: early Indian startups	Official website route	https://www.pointonecapital.com/
Investment Team	Better Capital	Form only	Pre-seed / seed VC	Good fit: early software startups	Official website route	https://bettercapital.vc/
Investment Team	First Cheque	Form only	Pre-seed investor	Good fit: early MVP and founder-led startups	Official website route	https://firstcheque.vc/
Investment Team	Antler India	Form only	Pre-seed / accelerator VC	Good fit: early-stage founder and MVP support	Official apply route	https://www.antler.co/location/india
Investment Team	India Accelerator	Form only	Accelerator / angel platform	Good fit: fundraising and mentor access	Official application route	https://indiaaccelerator.co/
Investment Team	AngelList India	Form only	Syndicate / fundraising platform	Good fit for syndicate discovery	Official platform route	https://www.angellistindia.com/
Investment Team	Lead Angels	Form only	Angel network	Good fit: early-stage India angel network	Official website route	https://www.leadangels.in/
Investment Team	AngelBay	Form only	Angel network	Good fit: angel syndicate route	Official website route	https://angelbay.in/
Investment Team	Keiretsu Forum India	Form only	Angel network	Good fit: angel network, may require application	Official India route	https://www.keiretsuforum.in/
Investment Team	Chandigarh Angels Network	Form only	Angel network	Moderate fit: regional angel route	Official website route	https://chandigarhangelsnetwork.com/
Investment Team	Rajasthan Angels	Form only	Angel network	Moderate fit: regional angel network	Official website route	https://rajasthanangels.com/
Investment Team	Calcutta Angels	Form only	Angel network	Moderate fit: angel network route	Official website route	https://calcutta-angels.com/
Investment Team	Kerala Angel Network	Form only	Angel network	Moderate fit: angel network route	Official website route	https://keralaangelnetwork.com/
Investment Team	Nativelead Foundation	Form only	Angel network / Tamil Nadu ecosystem	Moderate fit: regional angel route	Official website route	https://nativelead.org/
Investment Team	Inflection Point Ventures	Form only	Angel network / VC platform	Good fit: early-stage India deal flow	Official website route	https://ipventures.in/
Investment Team	9Unicorns / 100Unicorns	Form only	Accelerator VC	Good fit: seed funding and acceleration	Official website route	https://www.100unicorns.in/
Investment Team	We Founder Circle	Form only	Angel network	Already had one old-list contact; use form for broader channel	Official website route	https://www.wefoundercircle.com/
Investment Team	Huddle Ventures	Form only	Early-stage VC	Good fit: sector-agnostic early-stage India	Official website route	https://huddle.work/
Investment Team	Kae Capital	Form only	Seed VC	Good fit: early-stage India businesses	Official website route	https://kae-capital.com/
Investment Team	Nexus Venture Partners	Form only	Early/growth VC	Moderate fit: strong SaaS/AI, likely later or high bar	Official website route	https://www.nexusvp.com/
Investment Team	Elevation Capital	Form only	Early/growth VC	Moderate fit: strong if traction/scale proof improves	Official website route	https://elevationcapital.com/
Investment Team	Accel India	Form only	Early/growth VC	Moderate fit: top-tier, high bar; use warm intro if possible	Official website route	https://www.accel.com/
Investment Team	Peak XV Surge	Form only	Seed accelerator / VC	Good fit if applying to Surge cohort	Official Surge route	https://www.peakxv.com/surge/
Investment Team	Lightspeed India	Form only	Early/growth VC	Moderate fit: stronger after field traction	Official website route	https://lsvp.com/india/
Investment Team	Rainmatter	Form only	Impact / fintech / climate / health	Weak-to-moderate fit unless education-financial-literacy angle	Official website route	https://rainmatter.org/
Investment Team	Info Edge Ventures	Form only	Early-stage VC	Good fit if framed as SaaS/marketplace for schools	Official website route	https://www.infoedgeventures.in/
Investment Team	M Venture Partners	Form only	Early-stage VC	Moderate fit: India/SEA tech	Official website route	https://mvp.vc/
Investment Team	Jungle Ventures	Form only	SEA/India VC	Moderate fit, likely later-stage unless traction is strong	Official website route	https://www.jungle.vc/
Investment Team	Beenext	Form only	Early-stage VC	Good fit: India/SaaS/AI if concise traction shown	Official website route	https://www.beenext.com/
Investment Team	Wavemaker Partners	Form only	Early-stage VC	Moderate fit: enterprise/AI, SEA/India	Official website route	https://wavemaker.vc/
Investment Team	January Capital	Form only	B2B / SaaS VC	Moderate fit for SaaS and AI workflows	Official website route	https://www.january.capital/
Investment Team	Spiral Ventures	Form only	Asia VC	Moderate fit: India/Asia tech	Official website route	https://spiral-ventures.com/
Investment Team	Multiply Ventures	Form only	Early-stage consumer/tech VC	Moderate fit; stronger if school-market adoption is proven	Official website route	https://multiplyventures.com/
Investment Team	ThinKuvate	Form only	India/SEA seed VC	Good fit: India tech, seed/Series A	Official submit deck route	https://thinkuvate.com/
Investment Team	Eximius Ventures	Form only	Pre-seed VC	Good fit: pre-seed India, AI/SaaS thesis	Official pitch route	https://eximiusvc.com/
Investment Team	Athera Venture Partners	Form only	Early-stage VC	Good fit: India technology, enterprise/deeptech	Official submit deck route	https://www.atheravp.com/
Investment Team	Fireside Ventures	Form only	Consumer VC	Low-to-moderate fit; better if parent-facing education brand angle	Official pitch page	https://firesideventures.com/pages/pitch-us
Investment Team	Gruhas	Form only	Seed to growth VC	Moderate fit: education/AI if strong impact and scale story	Official pitch route	https://www.gruhas.com/
Investment Team	Morphosis Venture Advisors	Form only	B2B / enterprise VC	Good fit: school SaaS and enterprise ops angle	Official pitch route	https://morphosisvc.com/
Investment Team	Swishin Ventures	Form only	Tier 2/3 early-stage VC	Strong fit: Tier 2/3 India positioning	Official pitch form	https://swishin.vc/about/
Investment Team	GrowthCap Ventures	Form only	Fintech/AI/deeptech VC	Moderate fit: AI/deeptech angle	Official pitch route	https://growthcap.vc/
Investment Team	JaipurVC	Form only	Venture studio / early-stage support	Good fit: Tier 2/3 founder ecosystem	Official pitch route	https://jaipur.vc/
Investment Team	CapitalOven	Form only	Seed to Series A VC	Moderate fit: tech/startup application route	Official pitch page	https://www.capitaloven.com/pitch
Investment Team	4UVC	Form only	AI-focused VC	Good fit if EduOS/EduPortal AI stack is emphasized	Official site pitch route	https://www.4uvc.com/
Investment Team	World5 Fund	Form only	SEBI-regulated VC	Moderate fit: build-to-last institutions	Official pitch route	https://www.world5.fund/
Investment Team	Prime Partners Fund VC	Form only	Early-stage VC	Moderate fit: tech/SaaS/impact-driven innovation	Official pitch/contact route	https://www.ppfvc.com/
Investment Team	Jetty Ventures	Form only	India-US AI venture studio	Moderate fit if technical AI founder angle is strong	Official website route	https://jettyvc.com/
Investment Team	Grayscale Ventures	Form only	AI / infrastructure pre-seed VC	Good fit if EduOS offline infra is framed as AI/infra	Official website route	https://grayscale.vc/
Investment Team	SanchiConnect	Form only	Deeptech investment platform	Moderate fit: deeptech/innovation ecosystem	Official website route	https://sanchiconnect.com/
Investment Team	NASSCOM 10000 Startups	Form only	Startup ecosystem / acceleration	Good fit for ecosystem and investor exposure	Official program route	https://10000startups.com/
Investment Team	T-Hub Funding / Investor Connect	Form only	Incubator / investor connect	Good fit: pilots, mentor and investor access	Official T-Hub route	https://t-hub.co/
Investment Team	NSRCEL IIM Bangalore	Form only	Incubator / grants / acceleration	Strong fit for education/Bharat startup incubation	Official application route	https://www.nsrcel.org/
Investment Team	SINE IIT Bombay	Form only	Incubator / seed support	Good fit for tech product incubation	Official application route	https://sineiitb.org/
Investment Team	C-CAMP	Form only	Deeptech / science incubator	Low-to-moderate fit unless hardware/edge device angle emphasized	Official application route	https://www.ccamp.res.in/
Investment Team	IKP Knowledge Park	Form only	Incubator / innovation fund	Moderate fit for tech pilots and grant support	Official website route	https://www.ikpknowledgepark.com/
Investment Team	IIT Madras Incubation Cell	Form only	Incubator / deeptech support	Good fit for EduOS hardware and offline infra pilot	Official application route	https://incubation.iitm.ac.in/
Investment Team	Venture Center Pune	Form only	Incubator / seed support	Moderate fit for product commercialization and grants	Official website route	https://www.venturecenter.co.in/
Investment Team	Marwari Catalysts	Form only	Accelerator / angel network	Good fit: early-stage India fundraising support	Official website route	https://marwaricatalysts.com/
Investment Team	HNI Angels	Form only	Angel network	Moderate fit: angel fundraising route	Official website route	https://hniangels.com/
Investment Team	StartupLanes Angels	Form only	Angel network / startup platform	Moderate fit: outreach channel	Official website route	https://www.startuplanes.com/
Investment Team	Encubay Angel Network	Form only	Angel network	Moderate fit: early-stage network	Official website route	https://encubay.com/
Investment Team	Venture Garage	Form only	Fundraising platform / investor network	Moderate fit: pitch access and deal discovery	Official website route	https://venturegarage.in/
Investment Team	Pitch Our Way	Form only	Fundraising advisory / investor network	Moderate fit: advisory route, check terms first	Official website route	https://pitchourway.com/
Investment Team	Seeders India	Form only	Angel network / startup platform	Moderate fit: pitch route	Official website route	https://seeders.in/
Investment Team	TiE Bangalore Angels	Form only	Angel network / TiE chapter	Good fit for local founder network and pitch days	Official chapter route	https://bangalore.tie.org/
Investment Team	TiE Delhi-NCR Angels	Form only	Angel network / TiE chapter	Good fit for pitch days and member intros	Official chapter route	https://delhi.tie.org/
Investment Team	TiE Mumbai Angels	Form only	Angel network / TiE chapter	Good fit for pitch days and member intros	Official chapter route	https://mumbai.tie.org/
Investment Team	TiE Pune	Form only	Founder network / investor access	Good fit for Pune/Maharashtra investor access	Official chapter route	https://pune.tie.org/
Investment Team	BITS Spark Angels	Form only	Alumni angel network	Moderate fit: alumni/network-led angel route	Official website route	https://bitsspark.org/
Investment Team	Stanford Angels & Entrepreneurs India	Form only	Alumni angel network	Moderate fit: high-quality angel network, usually intro-led	Official website route	https://saeindia.org/
Investment Team	Harvard Angels India	Form only	Alumni angel network	Moderate fit: angel route, likely intro/application-led	Official website route	https://www.harvardangels.com/chapters/india
Investment Team	IvyCamp	Form only	Accelerator / investor access	Platform channel can be separate from IvyCap partner outreach	Official route	https://www.ivycamp.in/
Investment Team	Microsoft for Startups Founders Hub	Form only	Cloud credits / ecosystem	Good fit for AI/cloud credits and credibility; not direct investor	Official application route	https://www.microsoft.com/startups
Investment Team	Google for Startups India	Form only	Startup program / cloud credits	Good fit for AI/education credibility; not direct investor	Official application route	https://startup.google.com/
Investment Team	AWS Activate	Form only	Startup credits / ecosystem	Good fit for cloud support; not direct investor	Official application route	https://aws.amazon.com/activate/
Investment Team	NVIDIA Inception	Form only	AI startup program	Good fit if AI-assisted grading/content is emphasized	Official application route	https://www.nvidia.com/en-in/startups/
Investment Team	Oracle for Startups	Form only	Startup cloud program	Moderate fit for cloud credits and enterprise readiness	Official application route	https://www.oracle.com/startup/
Investment Team	Zoho for Startups	Form only	Startup ecosystem / credits	Moderate fit for operational tools/support	Official route	https://www.zoho.com/startups/
Investment Team	Cisco LaunchPad	Form only	Accelerator / enterprise tech	Moderate fit for infrastructure/security/education tech	Official route	https://www.cisco.com/c/m/en_in/launchpad.html
Investment Team	NASSCOM DeepTech Club	Form only	Deeptech ecosystem	Moderate fit for AI/offline sync architecture exposure	Official route	https://nasscom.in/
Investment Team	India Deep Tech Alliance	Form only	Deeptech ecosystem	Moderate fit if EduOS is framed as edge/offline infrastructure	Official route	https://indiadeeptech.com/
Investment Team	Social Alpha	Form only	Impact innovation platform	Strong fit for education/hardware/low-resource deployment pilots	Official website route	https://www.socialalpha.org/
Investment Team	Nexus3P Foundation	Form only	Deeptech impact capital	Moderate fit for tech-for-development and impact pilots	Official website route	https://nexus3p.org/
Investment Team	Aspire Circle	Form only	Impact investing ecosystem	Moderate fit: impact investor discovery and network	Official website route	https://aspirecircle.org/
Investment Team	Impact Investors Council	Form only	Impact investor network	Good source for impact investor discovery, not direct investor	Official website route	https://iiic.in/
Investment Team	ANDE India Chapter	Form only	Impact / entrepreneur support network	Good for education-impact capital ecosystem intros	Official website route	https://andeglobal.org/
Investment Team	Global Innovation Fund	Form only	Impact investor / grant-equity hybrid	Good fit if learning access impact can be measured	Official application route	https://www.globalinnovation.fund/
Investment Team	UNICEF Venture Fund	Form only	Impact fund	Moderate fit if open-source/public-good education tech angle exists	Official application route	https://www.unicefinnovationfund.org/
Investment Team	Village Capital	Form only	Accelerator / impact investment	Good fit for education-impact accelerator access	Official application route	https://vilcap.com/
Investment Team	Seedstars	Form only	Global startup / emerging markets investor	Moderate fit for emerging-market education tech	Official application route	https://www.seedstars.com/
Investment Team	GSF Accelerator	Form only	Accelerator / seed investor	Good fit: early-stage India accelerator route	Official website route	https://gsfaccelerator.com/
Investment Team	TLabs	Form only	Accelerator / seed investor	Moderate fit: early-stage tech route	Official website route	https://tlabs.in/
Investment Team	91springboard Investor Connect	Form only	Startup community / investor access	Moderate fit: pitch events and network	Official website route	https://www.91springboard.com/
Investment Team	WeWork Labs India	Form only	Startup program / investor access	Moderate fit for network and events	Official route	https://www.wework.com/solutions/wework-labs
Investment Team	Headstart Network Foundation	Form only	Startup ecosystem / investor access	Good for pitch events and warm intros	Official route	https://headstart.in/
Investment Team	F6S Startup Programs	Form only	Startup program marketplace	Moderate fit: find grant/accelerator applications	Official route	https://www.f6s.com/
Investment Team	GITEX Expand North Star / Supernova Challenge	Form only	Startup competition / investor access	Moderate fit: global investor exposure	Official route	https://www.expandnorthstar.com/`;

const rows = tsv.trim().split("\n").map((line) => line.split("\t"));
const [headers, ...data] = rows;

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Investor List");
sheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
sheet.getRangeByIndexes(1, 0, data.length, headers.length).values = data;
sheet.getRangeByIndexes(0, 0, 1, headers.length).format = {
  fill: "#1F4E79",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
};
sheet.getRangeByIndexes(0, 0, data.length + 1, headers.length).format.wrapText = true;
sheet.getRange("A:A").format.columnWidthPx = 145;
sheet.getRange("B:B").format.columnWidthPx = 230;
sheet.getRange("C:C").format.columnWidthPx = 230;
sheet.getRange("D:D").format.columnWidthPx = 190;
sheet.getRange("E:E").format.columnWidthPx = 350;
sheet.getRange("F:F").format.columnWidthPx = 290;
sheet.getRange("G:G").format.columnWidthPx = 300;
sheet.freezePanes.freezeRows(1);
sheet.tables.add(`A1:G${data.length + 1}`, true, "InvestorTable");

const notes = workbook.worksheets.add("Notes");
const directEmailCount = data.filter((r) => r[2].includes("@")).length;
const formOnlyCount = data.filter((r) => r[2] === "Form only").length;
notes.getRange("A1:E1").values = [["Metric", "Value", "", "Guidance", "Notes"]];
notes.getRange("A2:B8").values = [
  ["Total rows", data.length],
  ["Rows with direct email", directEmailCount],
  ["Form-only routes", formOnlyCount],
  ["Best first batch size", "20-30"],
  ["Suggested greeting", "Dear Investment Team,"],
  ["Use BCC for bulk email", "Yes"],
  ["Created", "2026-05-03"],
];
notes.getRange("D2:E8").values = [
  ["Prioritize direct emails first", "Use pitch/contact emails before form-only routes."],
  ["Use forms manually", "Many top funds do not publish email and prefer official forms."],
  ["Avoid duplicate outreach", "This list is built to reduce overlap with the contacts already mailed."],
  ["Customize top targets", "For the top 15, add one line about education, Bharat, AI, or offline infra."],
  ["Do not mass-send forms", "Forms require manual entry and often deck upload."],
  ["Attach or link deck", "Use the Canva deck and Google Drive explanation link."],
  ["Follow-up timing", "Wait 5-7 business days before a polite follow-up."],
];
notes.getRange("A1:E1").format = { fill: "#1F4E79", font: { bold: true, color: "#FFFFFF" }, wrapText: true };
notes.getRange("A:E").format.wrapText = true;
notes.getRange("A:A").format.columnWidthPx = 190;
notes.getRange("B:B").format.columnWidthPx = 120;
notes.getRange("D:D").format.columnWidthPx = 220;
notes.getRange("E:E").format.columnWidthPx = 380;
notes.freezePanes.freezeRows(1);
notes.getRange("A10:B12").values = [
  ["Route Type", "Count"],
  ["Direct email", directEmailCount],
  ["Form only", formOnlyCount],
];
const chart = notes.charts.add("bar", notes.getRange("A10:B12"));
chart.title = "Outreach Route Mix";
chart.hasLegend = false;
chart.setPosition("D10", "E23");

await fs.mkdir(outputDir, { recursive: true });
await workbook.render({ sheetName: "Investor List", range: "A1:G20", scale: 1, format: "png" });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(outputDir, "eduportal_investor_outreach_list.xlsx"));
