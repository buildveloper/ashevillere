"use client";

import { Shield, Eye, Cookie, Database, Globe, Lock, Mail } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import Link from "next/link";

const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Information" },
  { id: "cookies", title: "Cookies & Analytics" },
  { id: "local-storage", title: "LocalStorage Usage" },
  { id: "data-sharing", title: "Data Sharing & Selling" },
  { id: "third-party", title: "Third-Party Services" },
  { id: "security", title: "Data Security" },
  { id: "children", title: "Children's Privacy" },
  { id: "your-rights", title: "Your Rights" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];

export function PrivacyContent() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="We believe in radical transparency. Here&apos;s exactly what data we collect, how we use it, and how we protect your privacy — written in plain English, not legalese."
      lastUpdated="June 1, 2026"
      sections={SECTIONS}
      icon={<Shield className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />}
    >
      {/* Overview */}
      <h2 id="overview">1. Overview</h2>
      <p>
        AshevilleRE (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website{" "}
        <strong>ashevillere.com</strong> (the &ldquo;Site&rdquo;). This Privacy Policy describes
        how we collect, use, disclose, and safeguard your information when you visit our Site.
        We take your privacy seriously and have designed our data collection practices to be{" "}
        <strong>minimal by default</strong>.
      </p>
      <p>
        Unlike many real estate websites, we do not collect your personal information
        through lead-capture forms, phone-number gates, or registration walls. We don&apos;t
        require an account. We don&apos;t send marketing emails. Our business model does not
        depend on harvesting or selling your personal data.
      </p>

      <div className="disclaimer-box">
        <p>
          <strong>TL;DR:</strong> We collect almost nothing. No accounts, no forms, no
          phone-number gates. We use Google Analytics (anonymized) and LocalStorage for
          your theme preference. That&apos;s pretty much it. We never sell your data.
        </p>
      </div>

      {/* Information We Collect */}
      <h2 id="information-we-collect">2. Information We Collect</h2>

      <h3>2.1 Information You Provide Voluntarily</h3>
      <p>
        We do not currently offer user accounts, contact forms, newsletter signups, or
        commenting functionality. If you email us directly at{" "}
        <a href="mailto:chris@ashevillere.com">chris@ashevillere.com</a>, we will receive
        your email address and any information you choose to include in your message. We
        use this solely to respond to your inquiry and do not add you to any mailing list.
      </p>

      <h3>2.2 Information Collected Automatically</h3>
      <p>
        When you visit the Site, certain information is automatically collected by our
        hosting infrastructure and analytics provider. This includes:
      </p>
      <ul>
        <li>
          <strong>Log Data:</strong> Your IP address, browser type, operating system,
          referring/exit pages, date/time stamps, and pages visited. This is standard
          server logging and is retained for a limited period for security and
          debugging purposes.
        </li>
        <li>
          <strong>Analytics Data:</strong> Page views, session duration, bounce rate,
          approximate geographic location (country/city level), device type, and browser
          information. We use Google Analytics with IP anonymization enabled.
        </li>
        <li>
          <strong>Usage Patterns:</strong> Which tools and features you interact with (e.g.,
          Home Value Estimator, Mortgage Calculator). This helps us understand what&apos;s
          useful to our visitors so we can improve the Site.
        </li>
      </ul>

      <h3>2.3 Information We Do NOT Collect</h3>
      <p>
        To be absolutely clear, we do <strong>not</strong> collect:
      </p>
      <ul>
        <li>Your name, phone number, or physical address</li>
        <li>Financial information, credit card numbers, or bank account details</li>
        <li>Social Security numbers or government-issued ID numbers</li>
        <li>Precise geolocation data (GPS coordinates)</li>
        <li>Biometric data or health information</li>
        <li>Information about children under the age of 13</li>
      </ul>

      {/* How We Use Information */}
      <h2 id="how-we-use">3. How We Use Information</h2>
      <p>
        We use the limited information we collect for the following purposes:
      </p>
      <ul>
        <li>
          <strong>Site Operation:</strong> To deliver the Site&apos;s content, tools, and
          features to you reliably and securely.
        </li>
        <li>
          <strong>Analytics &amp; Improvement:</strong> To understand how visitors use the
          Site — which pages are popular, which tools are used most, where visitors come
          from — so we can improve the content and user experience.
        </li>
        <li>
          <strong>Security &amp; Debugging:</strong> To monitor for suspicious activity,
          prevent abuse, and diagnose technical issues with the Site.
        </li>
        <li>
          <strong>Legal Compliance:</strong> To comply with applicable laws, regulations,
          legal processes, or enforceable governmental requests.
        </li>
      </ul>

      {/* Cookies & Analytics */}
      <h2 id="cookies">4. Cookies &amp; Analytics</h2>

      <h3>4.1 Google Analytics</h3>
      <p>
        We use <strong>Google Analytics 4</strong> (GA4) to understand how visitors
        interact with the Site. GA4 uses first-party cookies to collect standard internet
        log information and visitor behavior in an anonymous form. We have configured
        GA4 with the following privacy-protective settings:
      </p>
      <ul>
        <li>
          <strong>IP Anonymization:</strong> Enabled by default in GA4. Your full IP
          address is never stored — it is truncated before processing.
        </li>
        <li>
          <strong>Data Retention:</strong> Set to the minimum available period (2 months).
        </li>
        <li>
          <strong>Advertising Features:</strong> Disabled. We do not use Google Signals,
          remarketing, or advertising reporting features.
        </li>
        <li>
          <strong>Data Sharing:</strong> We have disabled all data-sharing settings with
          Google (no benchmarking, no technical support access, no account specialists).
        </li>
      </ul>

      <h3>4.2 Cookie Usage</h3>
      <p>
        Cookies are small text files placed on your device by websites you visit. Our
        Site uses the following types of cookies:
      </p>
      <ul>
        <li>
          <strong>Essential Cookies:</strong> We set a single cookie to remember your
          light/dark theme preference. This is strictly necessary for the Site&apos;s
          functionality and does not track you across websites.
        </li>
        <li>
          <strong>Analytics Cookies:</strong> GA4 sets cookies (_ga, _ga_*) to
          distinguish unique users and track session data. These are first-party cookies
          controlled by our domain.
        </li>
      </ul>
      <p>
        You can disable cookies entirely through your browser settings. Most browsers
        allow you to refuse cookies or delete them after each session. Note that
        disabling cookies may affect the functionality of certain Site features (such as
        your theme preference).
      </p>

      {/* LocalStorage */}
      <h2 id="local-storage">5. LocalStorage Usage</h2>
      <p>
        We use your browser&apos;s <strong>LocalStorage</strong> (not cookies) to store the
        following information locally on your device:
      </p>
      <ul>
        <li>
          <strong>Theme Preference:</strong> Your choice of light or dark mode, so the
          Site loads with your preferred appearance on return visits. This prevents the
          &ldquo;flash of unstyled content&rdquo; that occurs when themes are applied via
          JavaScript.
        </li>
        <li>
          <strong>Recent Searches:</strong> Your last few search queries on the Site, so
          you can quickly repeat a previous search. This is stored only in your browser
          and is never transmitted to our servers.
        </li>
        <li>
          <strong>Tool Inputs:</strong> The Mortgage Calculator and Home Value Estimator
          may temporarily cache your last inputs so you don&apos;t lose your work if you
          accidentally navigate away. This data is cleared when you close your browser.
        </li>
      </ul>
      <p>
        LocalStorage data never leaves your device. We do not have access to it, cannot
        read it, and cannot use it for any purpose. You can clear LocalStorage at any
        time through your browser&apos;s developer tools or privacy settings.
      </p>

      {/* Data Sharing */}
      <h2 id="data-sharing">6. Data Sharing &amp; Selling</h2>

      <div className="disclaimer-box">
        <p>
          <strong>We do not sell your personal data. Period.</strong> We have never sold
          personal data, we do not sell personal data now, and we have no plans to sell
          personal data in the future. We do not share your data with real estate agents,
          lead generation services, data brokers, or marketing companies.
        </p>
      </div>

      <p>
        We may share information only in the following limited circumstances:
      </p>
      <ul>
        <li>
          <strong>Service Providers:</strong> We use Google (for Analytics) and Vercel
          (for hosting). These providers process data on our behalf under strict data
          processing agreements.
        </li>
        <li>
          <strong>Legal Requirements:</strong> We may disclose information if required to
          do so by law, court order, or governmental regulation, or if we believe in good
          faith that disclosure is necessary to protect our rights, your safety, or the
          safety of others.
        </li>
        <li>
          <strong>Business Transfer:</strong> In the unlikely event that AshevilleRE is
          involved in a merger, acquisition, or sale of assets, your information may be
          transferred as part of that transaction. You will be notified via a prominent
          notice on the Site of any change in ownership or uses of your information.
        </li>
      </ul>

      {/* Third-Party Services */}
      <h2 id="third-party">7. Third-Party Services</h2>
      <p>
        The Site may contain links to third-party websites, tools, and services
        (including affiliate links). These third-party sites have their own privacy
        policies, and we encourage you to review them. We have no control over and
        assume no responsibility for the content, privacy policies, or practices of any
        third-party sites or services.
      </p>
      <p>
        Our <strong>AI Chatbot</strong> connects to the Groq API (running
        Llama 3.3 70B) for intelligent responses. Chat history is stored only
        in your browser&apos;s memory during the session and is cleared on page
        refresh. Chat history is stored only in your browser&apos;s memory during the
        session and is cleared on page refresh.
      </p>

      {/* Security */}
      <h2 id="security">8. Data Security</h2>
      <p>
        We implement reasonable technical and organizational measures to protect the
        limited data we hold against accidental or unlawful destruction, loss,
        alteration, unauthorized disclosure, or access. These measures include:
      </p>
      <ul>
        <li>HTTPS encryption for all data in transit (TLS 1.3)</li>
        <li>Infrastructure hosted on Vercel with industry-standard security practices</li>
        <li>Minimal data retention periods (analytics data purged after 2 months)</li>
        <li>No storage of sensitive personal information on our servers</li>
        <li>Regular dependency updates to patch security vulnerabilities</li>
      </ul>
      <p>
        However, no method of electronic storage or transmission over the Internet is
        100% secure. We cannot guarantee absolute security of your information.
      </p>

      {/* Children's Privacy */}
      <h2 id="children">9. Children&apos;s Privacy</h2>
      <p>
        Our Site is not directed to children under the age of 13, and we do not
        knowingly collect personal information from children under 13. If we become aware
        that a child under 13 has provided us with personal information, we will take
        steps to delete such information from our records. If you are a parent or
        guardian and believe your child has provided us with personal information, please
        contact us immediately.
      </p>

      {/* Your Rights */}
      <h2 id="your-rights">10. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have certain rights regarding your personal
        information, including:
      </p>
      <ul>
        <li>
          <strong>Right to Know:</strong> You can request information about what personal
          data we hold about you.
        </li>
        <li>
          <strong>Right to Delete:</strong> You can request that we delete any personal
          data we have collected from you.
        </li>
        <li>
          <strong>Right to Opt-Out:</strong> You can opt out of the sale of personal
          information (though we don&apos;t sell it). You can also opt out of Google
          Analytics by using the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics Opt-Out Browser Add-on
          </a>.
        </li>
        <li>
          <strong>Right to Non-Discrimination:</strong> We will not discriminate against
          you for exercising any of your privacy rights.
        </li>
      </ul>
      <p>
        Because we collect so little data and do not require user accounts, the most
        effective way to protect your privacy is to use browser-level privacy controls
        (cookie blocking, private browsing, VPNs) or to simply not visit the Site.
      </p>

      {/* Changes */}
      <h2 id="changes">11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our
        practices, technologies, legal requirements, or for other operational reasons. If
        we make material changes, we will update the &ldquo;Last updated&rdquo; date at the
        top of this page and may post a notice on the Site. We encourage you to review
        this policy periodically.
      </p>
      <p>
        Continued use of the Site after any changes to this Privacy Policy constitutes
        your acceptance of the revised policy. If you disagree with any changes, you
        should discontinue use of the Site.
      </p>

      {/* Contact */}
      <h2 id="contact">12. Contact Us</h2>
      <p>
        If you have questions, concerns, or requests regarding this Privacy Policy or our
        data practices, please contact us at:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:chris@ashevillere.com">chris@ashevillere.com</a>
        </li>
        <li>
          <strong>Location:</strong> Asheville, North Carolina
        </li>
      </ul>
      <p>
        We will respond to all legitimate inquiries within a reasonable timeframe and in
        accordance with applicable laws.
      </p>
    </LegalPageLayout>
  );
}
