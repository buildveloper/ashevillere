// ─── Report Generator — PDFKit + Groq AI Narratives ────────────────────────
// Generates real, downloadable PDF reports with AI-enriched content.

import PDFDocument from "pdfkit";
import Groq from "groq-sdk";
import {
  getReportTitle,
  getReportFilename,
  buildGroqReportPrompt,
  fmtCurrency,
  type ReportType,
  type ReportPayload,
  type MarketReportPayload,
  type NeighborhoodReportPayload,
  type STRReportPayload,
  type RelocationReportPayload,
  type HomeValueReportPayload,
} from "./report-templates";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export interface GenerateResult {
  buffer: Buffer;
}

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

async function getAINarrative(reportType: ReportType, payload: ReportPayload): Promise<string> {
  const groq = getGroqClient();
  if (!groq) return "";

  try {
    const prompt = buildGroqReportPrompt(reportType, payload);
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are a professional Asheville real estate analyst writing report narratives. Be concise, data-rich, and specific." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });
    return completion.choices[0]?.message?.content || "";
  } catch {
    return "";
  }
}

function buildPDF(reportType: ReportType, payload: ReportPayload, aiNarrative: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: getReportTitle(reportType, payload),
        Author: "AshevilleRE",
        Creator: "AshevilleRE Report Generator",
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ─── Brand Header ──────────────────────────────────────────────────
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#059669").text("AshevilleRE", { continued: true });
    doc.font("Helvetica").fillColor("#64748b").text("  — Premium Real Estate Intelligence");
    doc.moveDown(0.5);

    // Accent line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(2).strokeColor("#059669").stroke();
    doc.moveDown(1);

    // ─── Title ─────────────────────────────────────────────────────────
    const title = getReportTitle(reportType, payload);
    doc.fontSize(22).font("Helvetica-Bold").fillColor("#0f172a").text(title);
    doc.moveDown(0.3);
    doc.fontSize(9).font("Helvetica").fillColor("#94a3b8").text(
      `Generated on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
    );
    doc.moveDown(1);

    // ─── Report-specific content ───────────────────────────────────────
    switch (reportType) {
      case "market-report":
        drawMarketReport(doc, payload as MarketReportPayload, aiNarrative);
        break;
      case "neighborhood-report":
        drawNeighborhoodReport(doc, payload as NeighborhoodReportPayload, aiNarrative);
        break;
      case "str-report":
        drawSTRReport(doc, payload as STRReportPayload, aiNarrative);
        break;
      case "relocation-report":
        drawRelocationReport(doc, payload as RelocationReportPayload, aiNarrative);
        break;
      case "home-value-report":
        drawHomeValueReport(doc, payload as HomeValueReportPayload, aiNarrative);
        break;
    }

    // ─── Footer ────────────────────────────────────────────────────────
    doc.moveDown(2);
    const footerY = doc.page.height - 50;
    doc.moveTo(50, footerY - 10).lineTo(545, footerY - 10).lineWidth(0.5).strokeColor("#e2e8f0").stroke();
    doc.fontSize(7).font("Helvetica").fillColor("#94a3b8");
    doc.text(`AshevilleRE © ${new Date().getFullYear()} — Premium Real Estate Intelligence`, 50, footerY, { align: "left", width: 250 });
    doc.text("Data sourced from MLS and market analysis. Not financial advice.", 300, footerY, { align: "right", width: 245 });

    doc.end();
  });
}

// ─── Section Helpers ────────────────────────────────────────────────────────

function drawSectionHeader(doc: PDFKit.PDFDocument, text: string) {
  doc.moveDown(1.5);
  doc.fontSize(14).font("Helvetica-Bold").fillColor("#0f172a").text(text);
  doc.moveDown(0.3);
  // small accent underlining just the heading area
  // Skipped underline to keep it clean.
}

function drawParagraph(doc: PDFKit.PDFDocument, text: string) {
  doc.fontSize(10).font("Helvetica").fillColor("#334155").text(text, {
    lineGap: 4,
    paragraphGap: 8,
    align: "left",
  });
}

function drawBullet(doc: PDFKit.PDFDocument, text: string) {
  doc.fontSize(10).font("Helvetica").fillColor("#334155");
  doc.text(`• ${text}`, { indent: 15, lineGap: 3, paragraphGap: 3 });
}

function drawStatRow(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.fontSize(10);
  doc.font("Helvetica-Bold").fillColor("#475569").text(label, { continued: true, indent: 15 });
  doc.font("Helvetica").fillColor("#0f172a").text(`  ${value}`);
}

function drawNarrative(doc: PDFKit.PDFDocument, aiNarrative: string) {
  if (aiNarrative) {
    drawSectionHeader(doc, "Market Analysis");
    const paragraphs = aiNarrative.split("\n\n").filter(p => p.trim());
    for (const para of paragraphs) {
      drawParagraph(doc, para.trim());
    }
  }
}

// ─── Report Type Drawers ────────────────────────────────────────────────────

function drawMarketReport(doc: PDFKit.PDFDocument, p: MarketReportPayload, aiNarrative: string) {
  drawSectionHeader(doc, "Key Metrics");
  drawStatRow(doc, "Median Price", `$${p.stats.medianPrice.toLocaleString()}`);
  drawStatRow(doc, "YoY Appreciation", `${p.stats.yoyAppreciation}%`);
  drawStatRow(doc, "Active Listings", `${p.stats.activeListings}`);
  drawStatRow(doc, "Avg Days on Market", `${p.stats.avgDaysOnMarket}`);
  drawStatRow(doc, "Months Inventory", `${p.stats.monthsInventory}`);
  drawStatRow(doc, "Avg Price/SqFt", `$${p.stats.avgPricePerSqft}`);
  doc.moveDown(0.5);

  drawNarrative(doc, aiNarrative);

  drawSectionHeader(doc, "Neighborhood Comparison");
  for (const n of p.neighborhoods) {
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#059669").text(n.name);
    doc.fontSize(9).font("Helvetica").fillColor("#475569").text(
      `$${fmtCurrency(n.stats.medianPrice)}  |  ${n.stats.yoyAppreciation}% YoY  |  ${n.stats.monthsInventory} mo inventory  |  STR: ${n.strRegulation}`
    );
    doc.moveDown(0.3);
  }
}

function drawNeighborhoodReport(doc: PDFKit.PDFDocument, p: NeighborhoodReportPayload, aiNarrative: string) {
  const n = p.neighborhood;

  drawSectionHeader(doc, "Overview");
  drawParagraph(doc, n.overview);
  drawParagraph(doc, `Best for: ${n.bestFor.join(" • ")}`);

  drawSectionHeader(doc, "Market Stats");
  drawStatRow(doc, "Median Price", `$${n.stats.medianPrice.toLocaleString()}`);
  drawStatRow(doc, "Price/SqFt", `$${n.stats.pricePerSqft}`);
  drawStatRow(doc, "Days on Market", `${n.stats.avgDaysOnMarket}`);
  drawStatRow(doc, "Active Listings", `${n.stats.activeListings}`);
  drawStatRow(doc, "Months Inventory", `${n.stats.monthsInventory}`);
  drawStatRow(doc, "YoY Appreciation", `${n.stats.yoyAppreciation}%`);
  doc.moveDown(0.5);

  drawSectionHeader(doc, "Pros & Cons");
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#059669").text("Pros:", { indent: 15 });
  for (const pro of n.pros) {
    drawBullet(doc, pro);
  }
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fillColor("#dc2626").text("Cons:", { indent: 15 });
  for (const con of n.cons) {
    drawBullet(doc, con);
  }
  doc.moveDown(0.5);

  drawNarrative(doc, aiNarrative);

  drawSectionHeader(doc, "Schools");
  drawStatRow(doc, "Elementary", n.schools.elementary);
  drawStatRow(doc, "Middle", n.schools.middle);
  drawStatRow(doc, "High", n.schools.high);
  drawStatRow(doc, "Rating", `${n.schools.rating}/10`);

  drawSectionHeader(doc, "STR Potential");
  drawStatRow(doc, "STR Viability Score", `${n.strScore}/100`);
  drawStatRow(doc, "Est. Annual Revenue", n.strRevenue === 0 ? "N/A" : `$${n.strRevenue}K`);
  drawStatRow(doc, "Regulation", n.strRegulation);
}

function drawSTRReport(doc: PDFKit.PDFDocument, p: STRReportPayload, aiNarrative: string) {
  const n = p.neighborhood;
  const capRate = n.strRevenue > 0 ? ((n.strRevenue * 1000) / n.stats.medianPrice * 100) : 0;

  drawSectionHeader(doc, "STR Investment Analysis");
  doc.fontSize(20).font("Helvetica-Bold").fillColor("#059669");
  doc.text(`${n.strScore}/100`, { align: "center" });
  doc.fontSize(9).font("Helvetica").fillColor("#64748b");
  doc.text("STR Viability Score", { align: "center" });
  doc.moveDown(0.8);

  drawStatRow(doc, "Est. Annual Revenue", n.strRevenue === 0 ? "N/A" : `$${n.strRevenue}K`);
  drawStatRow(doc, "Median Home Price", `$${n.stats.medianPrice.toLocaleString()}`);
  drawStatRow(doc, "Est. Cap Rate", n.strRevenue > 0 ? `${capRate.toFixed(1)}%` : "N/A");
  drawStatRow(doc, "Regulation Status", n.strRegulation);
  doc.moveDown(0.5);

  drawNarrative(doc, aiNarrative);

  drawSectionHeader(doc, "Neighborhood Market Context");
  drawStatRow(doc, "YoY Appreciation", `${n.stats.yoyAppreciation}%`);
  drawStatRow(doc, "Days on Market", `${n.stats.avgDaysOnMarket}`);
  drawStatRow(doc, "Price/SqFt", `$${n.stats.pricePerSqft}`);
  drawStatRow(doc, "Walk Score", `${n.walkScore}/100`);
}

function drawRelocationReport(doc: PDFKit.PDFDocument, p: RelocationReportPayload, aiNarrative: string) {
  drawSectionHeader(doc, "Relocation Progress");
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#059669");
  doc.text(`${p.progressPct}%`, { align: "center" });
  doc.fontSize(9).font("Helvetica").fillColor("#64748b");
  doc.text(`${p.completedItems} of ${p.totalItems} tasks completed`, { align: "center" });
  doc.moveDown(0.8);

  drawNarrative(doc, aiNarrative);

  drawSectionHeader(doc, "Checklist");
  for (const cat of p.categories) {
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#0f172a").text(cat.title);
    for (const item of cat.items) {
      const marker = item.completed ? "[✓]" : "[ ]";
      const color = item.completed ? "#94a3b8" : "#475569";
      doc.fontSize(10).font("Helvetica").fillColor(color).text(`${marker} ${item.text}`, { indent: 15, lineGap: 2 });
    }
    doc.moveDown(0.3);
  }
}

function drawHomeValueReport(doc: PDFKit.PDFDocument, p: HomeValueReportPayload, aiNarrative: string) {
  drawSectionHeader(doc, "Home Value Estimate");

  doc.fontSize(24).font("Helvetica-Bold").fillColor("#059669");
  doc.text(`$${p.estimate.mid.toLocaleString()}`, { align: "center" });
  doc.fontSize(9).font("Helvetica").fillColor("#64748b");
  doc.text("Estimated Value (Mid-Range)", { align: "center" });
  doc.moveDown(0.8);

  drawStatRow(doc, "Low Estimate", `$${p.estimate.low.toLocaleString()}`);
  drawStatRow(doc, "High Estimate", `$${p.estimate.high.toLocaleString()}`);
  drawStatRow(doc, "Confidence", `${p.estimate.confidence}%`);
  drawStatRow(doc, "Condition", p.condition);
  doc.moveDown(0.5);

  drawSectionHeader(doc, "Property Details");
  if (p.address) drawStatRow(doc, "Address", p.address);
  drawStatRow(doc, "Neighborhood", p.neighborhood);
  drawStatRow(doc, "Square Feet", p.sqft.toLocaleString());
  drawStatRow(doc, "Bedrooms", `${p.beds}`);
  drawStatRow(doc, "Bathrooms", `${p.baths}`);
  drawStatRow(doc, "Year Built", `${p.year}`);
  doc.moveDown(0.5);

  drawNarrative(doc, aiNarrative);
}

// ─── Main Export ────────────────────────────────────────────────────────────

export async function generatePDF(
  reportType: ReportType,
  payload: ReportPayload
): Promise<GenerateResult> {
  console.log(`[ReportGenerator] Generating ${reportType} with PDFKit + Groq...`);
  const aiNarrative = await getAINarrative(reportType, payload);
  const buffer = await buildPDF(reportType, payload, aiNarrative);
  console.log(`[ReportGenerator] Generated ${buffer.length} byte PDF`);
  return { buffer };
}
