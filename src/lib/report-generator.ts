// ─── Report Generator — Presenton Proxy with Fallback ─────────────────────
// Calls self-hosted Presenton API on the same Droplet. Falls back to
// server-side HTML→PDF buffer generation if Presenton is unavailable.

import { buildFallbackHTML, getPresentonTemplate, type ReportType, type ReportPayload } from "./report-templates";

const PRESENTON_URL = process.env.PRESENTON_URL || "http://localhost:8080";
const PRESENTON_API_KEY = process.env.PRESENTON_API_KEY || "";
const PRESENTON_TIMEOUT_MS = 15000;

export interface GenerateResult {
  buffer: Buffer;
  isFallback: boolean;
}

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );
}

async function callPresenton(
  templateName: string,
  data: Record<string, unknown>
): Promise<Buffer> {
  const controller = new AbortController();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (PRESENTON_API_KEY) {
    headers["Authorization"] = `Bearer ${PRESENTON_API_KEY}`;
  }

  const response = await Promise.race([
    fetch(`${PRESENTON_URL}/api/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ template: templateName, data }),
      signal: controller.signal,
    }),
    timeout(PRESENTON_TIMEOUT_MS),
  ]);

  if (!response.ok) {
    throw new Error(`Presenton responded with ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function buildFallbackPDFBuffer(html: string): Buffer {
  // Server-side HTML→PDF: wraps the branded HTML as a simple printable document.
  // For production, you'd swap this with a headless browser or a Node PDF lib.
  // For MVP, we return the HTML as an application/pdf buffer by embedding it in
  // a minimal PDF shell — or more practically, we return the HTML wrapped as a
  // data buffer that browsers can render. Since true HTML→PDF conversion requires
  // puppeteer/playwright, and we want zero native deps, we encode the HTML
  // directly and return it. The API route will send it as text/html with a .pdf
  // content-disposition so browsers offer to download.
  return Buffer.from(html, "utf-8");
}

export async function generatePDF(
  reportType: ReportType,
  payload: ReportPayload
): Promise<GenerateResult> {
  try {
    console.log(`[ReportGenerator] Generating ${reportType} via Presenton...`);
    const templateName = getPresentonTemplate(reportType);
    const buffer = await callPresenton(templateName, payload as unknown as Record<string, unknown>);
    console.log(`[ReportGenerator] Presenton returned ${buffer.length} bytes`);
    return { buffer, isFallback: false };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[ReportGenerator] Presenton unavailable: ${errorMsg}`);
    console.log(`[ReportGenerator] Building fallback PDF for ${reportType}...`);
    const html = buildFallbackHTML(reportType, payload);
    const buffer = buildFallbackPDFBuffer(html);
    console.log(`[ReportGenerator] Fallback generated ${buffer.length} byte HTML report`);
    return { buffer, isFallback: true };
  }
}
