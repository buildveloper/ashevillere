import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/report-generator";
import {
  getReportFilename,
  type ReportType,
  type ReportPayload,
} from "@/lib/report-templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportType, data } = body as {
      reportType: ReportType;
      data: Record<string, unknown>;
    };

    if (!reportType || !data) {
      return NextResponse.json(
        { error: "reportType and data are required" },
        { status: 400 }
      );
    }

    const validTypes: ReportType[] = [
      "market-report",
      "neighborhood-report",
      "str-report",
      "relocation-report",
      "home-value-report",
    ];
    if (!validTypes.includes(reportType)) {
      return NextResponse.json(
        { error: `Invalid reportType: ${reportType}` },
        { status: 400 }
      );
    }

    const payload = data as unknown as ReportPayload;
    const { buffer } = await generatePDF(reportType, payload);
    const filename = getReportFilename(reportType, payload);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[API /api/pdf] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
