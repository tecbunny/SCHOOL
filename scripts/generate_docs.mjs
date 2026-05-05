import fs from 'fs';
import PDFDocument from 'pdfkit';
import pptxgen from 'pptxgenjs';

// --- Helper Functions ---
function generatePDF(filename, title, content) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filename);
        doc.pipe(stream);

        doc.fontSize(24).text(title, { align: 'center' }).moveDown(2);
        
        content.forEach(section => {
            if (section.heading) {
                doc.fontSize(16).text(section.heading).moveDown(0.5);
            }
            if (section.body) {
                doc.fontSize(12).text(section.body).moveDown(1.5);
            }
        });

        doc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}

// --- 1. Non-Technical DPR ---
const nonTechContent = [
    { heading: "Executive Summary", body: "EduPortal is a transformative digital ecosystem built to bring modern, offline-capable learning tools to schools globally. It provides a seamless suite of features including digital classrooms, AI-assisted study material generation, and a holistic student portal." },
    { heading: "The Problem", body: "Schools often face connectivity challenges and lack a unified platform that bridges the gap between staff operations, classroom engagement, and independent student learning without requiring continuous high-speed internet." },
    { heading: "The Solution: EduPortal & EduOS", body: "By utilizing a hybrid edge architecture, EduPortal allows schools to operate autonomously. A local 'Class Station' acts as an edge node, syncing with the cloud when possible but fully functional offline, enabling students and teachers to thrive uninterrupted." },
    { heading: "Key Features", body: "- Offline-First Edge Servers\n- AI Study Material Generation (Flashcards, Quizzes, Audio)\n- Holistic Student Progress Tracking\n- Role-Based Dashboards (Admin, Auditor, Teacher, Student)" },
    { heading: "Impact and Future Vision", body: "We aim to democratize education technology by eliminating the internet barrier, ensuring equal access to top-tier AI and learning tools in any classroom environment." }
];

// --- 2. Technical DPR ---
const techContent = [
    { heading: "System Architecture", body: "EduPortal employs a Hybrid Edge Architecture. The frontend is built with Next.js (App Router), deployed with a centralized Cloud database (Supabase) and local edge nodes (Class Stations)." },
    { heading: "Edge Servers (EduOS)", body: "The Class Station runs locally (port 4102) and handles syncing via store-and-forward queues. It serves a thin-client intranet (Student Hub on port 4101) providing offline resilience. It caches generated assets locally on a 1.5TB drive." },
    { heading: "AI and API Integrations", body: "Integrates with Google Gemini via `src/app/api/ai`. Requests are queued in a Supabase 'generations' table. The edge node pings the API, caches the results (JSON/Audio), and delivers them over the local network via real-time subscriptions." },
    { heading: "Data Sync & Fleet Management", body: "Tests are executed locally and synced to Supabase when online. Admin dashboards monitor fleet health, hardware telemetry, and sync status across all deployed nodes." },
    { heading: "Codebase Structure", body: "Features are heavily modularized in `src/features`. Routing and API definitions live in `src/app`. `eduos/` contains provisioning scripts. Shared logic and DB clients reside in `src/lib`." }
];

// --- 3. Pitch Deck ---
async function generatePitchDeck() {
    let pres = new pptxgen();

    // Slide 1
    let slide1 = pres.addSlide();
    slide1.addText('EduPortal & EduOS', { x: 1, y: 1, w: 8, fontSize: 36, bold: true, align: 'center' });
    slide1.addText('The Offline-First Intelligent Classroom Ecosystem', { x: 1, y: 2.5, w: 8, fontSize: 18, align: 'center' });

    // Slide 2
    let slide2 = pres.addSlide();
    slide2.addText('The Challenge', { x: 0.5, y: 0.5, fontSize: 24, bold: true });
    slide2.addText('1. Connectivity limits access to modern EdTech.\n2. Disconnected systems for staff and students.\n3. Lack of scalable AI tools in rural areas.', { x: 0.5, y: 1.5, fontSize: 16 });

    // Slide 3
    let slide3 = pres.addSlide();
    slide3.addText('Our Solution', { x: 0.5, y: 0.5, fontSize: 24, bold: true });
    slide3.addText('Hybrid Edge Architecture: \nLocal "Class Stations" act as offline-first hubs.\nStudents access high-end AI tools over local intranet without the internet.', { x: 0.5, y: 1.5, fontSize: 16 });

    // Slide 4
    let slide4 = pres.addSlide();
    slide4.addText('Core Architecture', { x: 0.5, y: 0.5, fontSize: 24, bold: true });
    slide4.addText('Next.js Frontends + Supabase Cloud\nEdge nodes sync via store-and-forward.\nGemini AI powers local media factories.', { x: 0.5, y: 1.5, fontSize: 16 });

    // Slide 5
    let slide5 = pres.addSlide();
    slide5.addText('Join the Future of EdTech', { x: 1, y: 2, w: 8, fontSize: 28, bold: true, align: 'center' });

    await pres.writeFile({ fileName: 'Professional Pitch Deck.pptx' });
}

// --- Execution ---
async function main() {
    try {
        console.log("Generating Non-Technical DPR...");
        await generatePDF('1- Detailed Project Report.pdf', 'Detailed Project Report (Non-Technical)', nonTechContent);
        
        console.log("Generating Technical DPR...");
        await generatePDF('2- Detailed Project Report- Techinical & Hardware Details.pdf', 'Detailed Project Report - Technical & Hardware Details', techContent);
        
        console.log("Generating Pitch Deck...");
        await generatePitchDeck();

        console.log("All documents generated successfully!");
    } catch (e) {
        console.error("Error generating documents:", e);
    }
}

main();