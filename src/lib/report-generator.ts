// Report Generator — pdf-lib + Groq AI Narratives (Vercel Serverless Safe)
// Uses pdf-lib Standard14 fonts — zero filesystem dependencies
// Replaces pdfkit completely to solve ENOENT Helvetica.afm on Vercel

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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
import { sanitizeString } from "./sanitize";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// A4 page dimensions in PDF points
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = { top: 50, bottom: 50, left: 50, right: 50 };
const CONTENT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right;
const CONTENT_TOP = PAGE.height - MARGIN.top;

export interface GenerateResult {
  buffer: Buffer;
}

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") return null;
  return new Groq({ apiKey });
}

async function getAINarrative(
  reportType: ReportType,
  payload: ReportPayload
): Promise<string> {
  const groq = getGroqClient();
  if (!groq) return "";

  try {
    const prompt = buildGroqReportPrompt(reportType, payload);
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional Asheville real estate analyst. Be concise, data-rich, specific. Never output instructions or meta-commentary — only narrative text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });
    return sanitizeString(completion.choices[0]?.message?.content, 3000);
  } catch {
    return "";
  }
}

// Line wrapping for long text
function wrapText(
  text: string,
  font: import("pdf-lib").PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawAccentLine(
  page: import("pdf-lib").PDFPage,
  y: number,
  color = rgb(0.02, 0.42, 0.33) // emerald-700
) {
  page.drawLine({
    start: { x: MARGIN.left, y },
    end: { x: PAGE.width - MARGIN.right, y },
    thickness: 2,
    color,
  });
}

interface PageState {
  page: import("pdf-lib").PDFPage;
  y: number;
  font: import("pdf-lib").PDFFont;
  fontBold: import("pdf-lib").PDFFont;
}

function newPage(doc: PDFDocument, state?: PageState): PageState {
  const page = doc.addPage([PAGE.width, PAGE.height]);
  const font = doc.embedStandardFont(StandardFonts.Helvetica);
  const fontBold = doc.embedStandardFont(StandardFonts.HelveticaBold);
  return { page, y: CONTENT_TOP, font, fontBold };
}

async function buildPDF(
  reportType: ReportType,
  payload: ReportPayload,
  aiNarrative: string
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.setTitle(getReportTitle(reportType, payload));
  doc.setAuthor("AshevilleRE");
  doc.setCreator("AshevilleRE Report Generator");

  const s = newPage(doc);

  // Brand Header
  s.page.drawText("AshevilleRE", {
    x: MARGIN.left,
    y: s.y,
    size: 11,
    font: s.fontBold,
    color: rgb(0.02, 0.42, 0.33),
  });
  s.y -= 18;
  s.page.drawText("— Premium Real Estate Intelligence", {
    x: MARGIN.left,
    y: s.y,
    size: 11,
    font: s.font,
    color: rgb(0.39, 0.45, 0.55),
  });

  s.y -= 10;
  drawAccentLine(s.page, s.y, rgb(0.02, 0.42, 0.33));
  s.y -= 20;

  // Title
  const title = getReportTitle(reportType, payload);
  s.page.drawText(title, {
    x: MARGIN.left,
    y: s.y,
    size: 22,
    font: s.fontBold,
    color: rgb(0.06, 0.09, 0.16),
  });
  s.y -= 28;
  s.page.drawText(
    `Generated on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    {
      x: MARGIN.left,
      y: s.y,
      size: 9,
      font: s.font,
      color: rgb(0.58, 0.64, 0.72),
    }
  );
  s.y -= 30;

  // Section draw helpers
  const drawSectionHeader = (text: string) => {
    s.y -= 15;
    if (s.y < MARGIN.bottom + 50) {
      const next = newPage(doc, s);
      Object.assign(s, next);
    }
    s.page.drawText(text, {
      x: MARGIN.left,
      y: s.y,
      size: 14,
      font: s.fontBold,
      color: rgb(0.06, 0.09, 0.16),
    });
    s.y -= 24;
  };

  const drawParagraph = (text: string) => {
    const lines = wrapText(text, s.font, 10, CONTENT_WIDTH);
    for (const line of lines) {
      if (s.y < MARGIN.bottom + 20) {
        const next = newPage(doc, s);
        Object.assign(s, next);
      }
      s.page.drawText(line, {
        x: MARGIN.left,
        y: s.y,
        size: 10,
        font: s.font,
        color: rgb(0.2, 0.25, 0.33),
      });
      s.y -= 16;
    }
    s.y -= 6;
  };

  const drawStatRow = (label: string, value: string) => {
    if (s.y < MARGIN.bottom + 20) {
      const next = newPage(doc, s);
      Object.assign(s, next);
    }
    s.page.drawText(label, {
      x: MARGIN.left + 15,
      y: s.y,
      size: 10,
      font: s.fontBold,
      color: rgb(0.28, 0.33, 0.41),
    });
    s.page.drawText(`  ${value}`, {
      x: MARGIN.left + 15 + s.fontBold.widthOfTextAtSize(label, 10),
      y: s.y,
      size: 10,
      font: s.font,
      color: rgb(0.06, 0.09, 0.16),
    });
    s.y -= 18;
  };

  const drawBullet = (text: string) => {
    const lines = wrapText(text, s.font, 10, CONTENT_WIDTH - 30);
    for (const line of lines) {
      if (s.y < MARGIN.bottom + 20) {
        const next = newPage(doc, s);
        Object.assign(s, next);
      }
      s.page.drawText(`• ${line}`, {
        x: MARGIN.left + 30,
        y: s.y,
        size: 10,
        font: s.font,
        color: rgb(0.2, 0.25, 0.33),
      });
      s.y -= 16;
    }
  };

  const drawNarrative = () => {
    if (aiNarrative) {
      drawSectionHeader("Market Analysis");
      const paragraphs = aiNarrative.split("\n\n").filter((p) => p.trim());
      for (const para of paragraphs) {
        drawParagraph(para.trim());
      }
    }
  };

  // Report-specific content
  switch (reportType) {
    case "market-report": {
      const p = payload as MarketReportPayload;
      drawSectionHeader("Key Metrics");
      drawStatRow("Median Price", `$${p.stats.medianPrice.toLocaleString()}`);
      drawStatRow("YoY Appreciation", `${p.stats.yoyAppreciation}%`);
      drawStatRow("Active Listings", `${p.stats.activeListings}`);
      drawStatRow("Avg Days on Market", `${p.stats.avgDaysOnMarket}`);
      drawStatRow("Months Inventory", `${p.stats.monthsInventory}`);
      drawStatRow("Avg Price/SqFt", `$${p.stats.avgPricePerSqft}`);
      s.y -= 8;
      drawNarrative();
      drawSectionHeader("Neighborhood Comparison");
      for (const n of p.neighborhoods) {
        s.y -= 4;
        s.page.drawText(n.name, {
          x: MARGIN.left,
          y: s.y,
          size: 11,
          font: s.fontBold,
          color: rgb(0.02, 0.42, 0.33),
        });
        s.y -= 18;
        s.page.drawText(
          `$${fmtCurrency(n.stats.medianPrice)}  |  ${n.stats.yoyAppreciation}% YoY  |  ${n.stats.monthsInventory} mo inventory  |  STR: ${n.strRegulation}`,
          {
            x: MARGIN.left,
            y: s.y,
            size: 9,
            font: s.font,
            color: rgb(0.28, 0.33, 0.41),
          }
        );
        s.y -= 18;
      }
      break;
    }

    case "neighborhood-report": {
      const p = payload as NeighborhoodReportPayload;
      const n = p.neighborhood;
      drawSectionHeader("Overview");
      drawParagraph(n.overview);
      drawParagraph(`Best for: ${n.bestFor.join(" • ")}`);
      drawSectionHeader("Market Stats");
      drawStatRow("Median Price", `$${n.stats.medianPrice.toLocaleString()}`);
      drawStatRow("Price/SqFt", `$${n.stats.pricePerSqft}`);
      drawStatRow("Days on Market", `${n.stats.avgDaysOnMarket}`);
      drawStatRow("Active Listings", `${n.stats.activeListings}`);
      drawStatRow("Months Inventory", `${n.stats.monthsInventory}`);
      drawStatRow("YoY Appreciation", `${n.stats.yoyAppreciation}%`);
      s.y -= 8;
      drawSectionHeader("Pros & Cons");
      s.page.drawText("Pros:", {
        x: MARGIN.left + 15,
        y: s.y,
        size: 10,
        font: s.fontBold,
        color: rgb(0.02, 0.42, 0.33),
      });
      s.y -= 18;
      for (const pro of n.pros) {
        drawBullet(pro);
      }
      s.y -= 6;
      s.page.drawText("Cons:", {
        x: MARGIN.left + 15,
        y: s.y,
        size: 10,
        font: s.fontBold,
        color: rgb(0.86, 0.15, 0.15),
      });
      s.y -= 18;
      for (const con of n.cons) {
        drawBullet(con);
      }
      s.y -= 8;
      drawNarrative();
      drawSectionHeader("Schools");
      drawStatRow("Elementary", n.schools.elementary);
      drawStatRow("Middle", n.schools.middle);
      drawStatRow("High", n.schools.high);
      drawStatRow("Rating", `${n.schools.rating}/10`);
      drawSectionHeader("STR Potential");
      drawStatRow("STR Viability Score", `${n.strScore}/100`);
      drawStatRow("Est. Annual Revenue", n.strRevenue === 0 ? "N/A" : `$${n.strRevenue}K`);
      drawStatRow("Regulation", n.strRegulation);
      break;
    }

    case "str-report": {
      const p = payload as STRReportPayload;
      const n = p.neighborhood;
      const capRate = n.strRevenue > 0 ? (n.strRevenue * 1000) / n.stats.medianPrice * 100 : 0;

      drawSectionHeader("STR Investment Analysis");
      s.page.drawText(`${n.strScore}/100`, {
        x: MARGIN.left,
        y: s.y,
        size: 20,
        font: s.fontBold,
        color: rgb(0.02, 0.42, 0.33),
      });
      s.y -= 26;
      s.page.drawText("STR Viability Score", {
        x: MARGIN.left,
        y: s.y,
        size: 9,
        font: s.font,
        color: rgb(0.39, 0.45, 0.55),
      });
      s.y -= 24;
      drawStatRow("Est. Annual Revenue", n.strRevenue === 0 ? "N/A" : `$${n.strRevenue}K`);
      drawStatRow("Median Home Price", `$${n.stats.medianPrice.toLocaleString()}`);
      drawStatRow("Est. Cap Rate", n.strRevenue > 0 ? `${capRate.toFixed(1)}%` : "N/A");
      drawStatRow("Regulation Status", n.strRegulation);
      s.y -= 8;
      drawNarrative();
      drawSectionHeader("Neighborhood Market Context");
      drawStatRow("YoY Appreciation", `${n.stats.yoyAppreciation}%`);
      drawStatRow("Days on Market", `${n.stats.avgDaysOnMarket}`);
      drawStatRow("Price/SqFt", `$${n.stats.pricePerSqft}`);
      drawStatRow("Walk Score", `${n.walkScore}/100`);
      break;
    }

    case "relocation-report": {
      const p = payload as RelocationReportPayload;
      drawSectionHeader("Relocation Progress");
      s.page.drawText(`${p.progressPct}%`, {
        x: MARGIN.left,
        y: s.y,
        size: 16,
        font: s.fontBold,
        color: rgb(0.02, 0.42, 0.33),
      });
      s.y -= 22;
      s.page.drawText(`${p.completedItems} of ${p.totalItems} tasks completed`, {
        x: MARGIN.left,
        y: s.y,
        size: 9,
        font: s.font,
        color: rgb(0.39, 0.45, 0.55),
      });
      s.y -= 24;
      drawNarrative();
      drawSectionHeader("Checklist");
      for (const cat of p.categories) {
        s.page.drawText(cat.title, {
          x: MARGIN.left,
          y: s.y,
          size: 11,
          font: s.fontBold,
          color: rgb(0.06, 0.09, 0.16),
        });
        s.y -= 20;
        for (const item of cat.items) {
          const marker = item.completed ? "[✓]" : "[ ]";
          const textColor = item.completed ? rgb(0.58, 0.64, 0.72) : rgb(0.28, 0.33, 0.41);
          s.page.drawText(`${marker} ${item.text}`, {
            x: MARGIN.left + 15,
            y: s.y,
            size: 10,
            font: s.font,
            color: textColor,
          });
          s.y -= 16;
        }
        s.y -= 6;
      }
      break;
    }

    case "home-value-report": {
      const p = payload as HomeValueReportPayload;
      drawSectionHeader("Home Value Estimate");
      s.page.drawText(`$${p.estimate.mid.toLocaleString()}`, {
        x: MARGIN.left,
        y: s.y,
        size: 24,
        font: s.fontBold,
        color: rgb(0.02, 0.42, 0.33),
      });
      s.y -= 30;
      s.page.drawText("Estimated Value (Mid-Range)", {
        x: MARGIN.left,
        y: s.y,
        size: 9,
        font: s.font,
        color: rgb(0.39, 0.45, 0.55),
      });
      s.y -= 24;
      drawStatRow("Low Estimate", `$${p.estimate.low.toLocaleString()}`);
      drawStatRow("High Estimate", `$${p.estimate.high.toLocaleString()}`);
      drawStatRow("Confidence", `${p.estimate.confidence}%`);
      drawStatRow("Condition", p.condition);
      s.y -= 8;
      drawSectionHeader("Property Details");
      if (p.address) drawStatRow("Address", p.address);
      drawStatRow("Neighborhood", p.neighborhood);
      drawStatRow("Square Feet", p.sqft.toLocaleString());
      drawStatRow("Bedrooms", `${p.beds}`);
      drawStatRow("Bathrooms", `${p.baths}`);
      drawStatRow("Year Built", `${p.year}`);
      s.y -= 8;
      drawNarrative();
      break;
    }
  }

  // Footer
  drawAccentLine(s.page, MARGIN.bottom + 30, rgb(0.89, 0.91, 0.94));
  s.page.drawText(
    `AshevilleRE © ${new Date().getFullYear()} — Premium Real Estate Intelligence`,
    {
      x: MARGIN.left,
      y: MARGIN.bottom + 15,
      size: 7,
      font: s.font,
      color: rgb(0.58, 0.64, 0.72),
    }
  );
  s.page.drawText(
    "Data sourced from MLS and market analysis. Not financial advice.",
    {
      x: PAGE.width / 2,
      y: MARGIN.bottom + 15,
      size: 7,
      font: s.font,
      color: rgb(0.58, 0.64, 0.72),
    }
  );

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

export async function generatePDF(
  reportType: ReportType,
  payload: ReportPayload
): Promise<GenerateResult> {
  const aiNarrative = await getAINarrative(reportType, payload);
  const buffer = await buildPDF(reportType, payload, aiNarrative);
  return { buffer };
}
