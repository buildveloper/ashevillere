import { Resend } from "resend";

const FROM_ADDRESS = "AshevilleRE <no-reply@ashevillere.com>";
const TO_ADDRESS = "chris@ashevillere.com";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "your_resend_api_key_here") {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function buildContactSellerHtml(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  listingAddress: string;
  listingPrice: string;
  listingUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Seller Inquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;margin-top:24px;margin-bottom:24px;overflow:hidden;">
    <tr>
      <td style="background:linear-gradient(135deg,#059669,#06b6d4);padding:32px 24px;text-align:center;">
        <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">New Seller Inquiry</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0 0;">Someone is interested in a listing on AshevilleRE</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <h2 style="font-size:18px;color:#0f172a;margin:0 0 16px 0;font-weight:600;">Listing</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:24px;">
          <tr>
            <td style="font-size:15px;color:#0f172a;font-weight:600;">${data.listingAddress}</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#059669;font-weight:700;padding-top:4px;">${data.listingPrice}</td>
          </tr>
          <tr>
            <td style="padding-top:8px;">
              <a href="${data.listingUrl}" style="color:#059669;text-decoration:underline;font-size:13px;">View Listing →</a>
            </td>
          </tr>
        </table>

        <h2 style="font-size:18px;color:#0f172a;margin:0 0 16px 0;font-weight:600;">Buyer Information</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#64748b;width:80px;">Name:</td>
            <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:500;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#64748b;">Email:</td>
            <td style="padding:8px 0;font-size:14px;color:#059669;font-weight:500;"><a href="mailto:${data.email}" style="color:#059669;">${data.email}</a></td>
          </tr>
          ${data.phone ? `<tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Phone:</td><td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:500;">${data.phone}</td></tr>` : ""}
        </table>

        ${data.message ? `
        <h2 style="font-size:18px;color:#0f172a;margin:0 0 16px 0;font-weight:600;">Message</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:24px;">
          <tr>
            <td style="font-size:14px;color:#334155;line-height:1.6;">${data.message.replace(/\n/g, "<br>")}</td>
          </tr>
        </table>
        ` : ""}
      </td>
    </tr>
    <tr>
      <td style="background:#f1f5f9;padding:16px 24px;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">Sent from AshevilleRE.com · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildFeedbackHtml(data: {
  rating: number;
  message: string;
  email: string;
}): string {
  const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Feedback</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;margin-top:24px;margin-bottom:24px;overflow:hidden;">
    <tr>
      <td style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px 24px;text-align:center;">
        <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">New Feedback</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0 0;">Someone shared their thoughts about AshevilleRE</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="text-align:center;margin-bottom:24px;">
          <tr>
            <td style="font-size:36px;color:#f59e0b;letter-spacing:4px;padding-bottom:8px;">${stars}</td>
          </tr>
          <tr>
            <td style="font-size:16px;color:#0f172a;font-weight:600;">${ratingLabels[data.rating]} (${data.rating}/5)</td>
          </tr>
        </table>

        ${data.message ? `
        <h2 style="font-size:18px;color:#0f172a;margin:0 0 16px 0;font-weight:600;">Feedback</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:24px;">
          <tr>
            <td style="font-size:14px;color:#334155;line-height:1.6;">${data.message.replace(/\n/g, "<br>")}</td>
          </tr>
        </table>
        ` : ""}

        ${data.email ? `<p style="font-size:13px;color:#64748b;margin:0;">Reply to: <a href="mailto:${data.email}" style="color:#059669;">${data.email}</a></p>` : "<p style=\"font-size:13px;color:#94a3b8;margin:0;\">Submitted anonymously</p>"}
      </td>
    </tr>
    <tr>
      <td style="background:#f1f5f9;padding:16px 24px;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">Sent from AshevilleRE.com · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendSellerInquiryEmail(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  listingAddress: string;
  listingPrice: string;
  listingUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const resend = getResend();
    const html = buildContactSellerHtml(data);

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      subject: `New Inquiry: ${data.listingAddress} — ${data.name}`,
      html,
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Resend contact seller error:", message);
    return { ok: false, error: message };
  }
}

export async function sendFeedbackEmail(data: {
  rating: number;
  message: string;
  email: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const resend = getResend();
    const html = buildFeedbackHtml(data);
    const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      subject: `${ratingLabels[data.rating]} (${data.rating}/5) — New AshevilleRE Feedback`,
      html,
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Resend feedback error:", message);
    return { ok: false, error: message };
  }
}
