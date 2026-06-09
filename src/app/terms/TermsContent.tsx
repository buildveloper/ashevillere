"use client";

import { Scale } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import Link from "next/link";

const SECTIONS = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "description", title: "Description of Service" },
  { id: "no-advice", title: "Not Financial or Real Estate Advice" },
  { id: "tools-disclaimer", title: "Tools & Calculators Disclaimer" },
  { id: "accuracy", title: "Accuracy of Information" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "user-conduct", title: "User Conduct" },
  { id: "third-party", title: "Third-Party Links & Affiliates" },
  { id: "ai-chatbot", title: "AI Chatbot Disclaimer" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "termination", title: "Termination" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact" },
];

export function TermsContent() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="These terms govern your use of AshevilleRE. We keep them clear and fair. By using this site, you agree to these terms. If you don&apos;t agree, please don&apos;t use the site."
      lastUpdated="June 1, 2026"
      sections={SECTIONS}
      icon={<Scale className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />}
    >
      {/* Acceptance */}
      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>
        By accessing or using <strong>ashevillere.com</strong> (the &ldquo;Site&rdquo;),
        you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do
        not agree to all of these Terms, you must not access or use the Site. These
        Terms apply to all visitors, users, and others who access or use the Site.
      </p>
      <p>
        We reserve the right to update these Terms at any time. When we do, we will
        revise the &ldquo;Last updated&rdquo; date at the top of this page. Your
        continued use of the Site after any changes constitutes your acceptance of the
        new Terms. It is your responsibility to review these Terms periodically.
      </p>

      {/* Description of Service */}
      <h2 id="description">2. Description of Service</h2>
      <p>
        AshevilleRE provides real estate market information, neighborhood guides,
        analytical tools (such as home value estimators and mortgage calculators), blog
        content, and an AI-powered chatbot (collectively, the &ldquo;Services&rdquo;).
        The Site is an informational resource — it is <strong>not</strong> a real estate
        brokerage, appraisal service, financial advisory firm, or legal practice.
      </p>
      <p>
        All tools, calculators, reports, and data displayed on the Site are provided for
        <strong> informational and educational purposes only</strong>. They are not
        substitutes for professional advice from a licensed real estate agent, certified
        appraiser, mortgage lender, financial advisor, or attorney.
      </p>

      <div className="disclaimer-box">
        <p>
          <strong>Important:</strong> AshevilleRE is not a real estate brokerage. We do
          not represent buyers or sellers, list properties, or participate in real estate
          transactions. We do not earn commissions from home sales. We provide data and
          tools to help you make more informed decisions.
        </p>
      </div>

      {/* Not Financial Advice */}
      <h2 id="no-advice">3. Not Financial or Real Estate Advice</h2>
      <p>
        The content on this Site — including blog posts, market analyses, neighborhood
        guides, calculator results, AI chatbot responses, and any other material — is
        provided for <strong>general informational and educational purposes only</strong>.
        Nothing on this Site constitutes:
      </p>
      <ul>
        <li>
          <strong>Real estate advice:</strong> We do not advise you on whether to buy,
          sell, or hold any property. Real estate decisions involve personal
          circumstances that we cannot evaluate.
        </li>
        <li>
          <strong>Financial advice:</strong> We are not financial advisors. Mortgage
          estimates, investment return projections, and STR revenue estimates are{" "}
          <strong>hypothetical illustrations</strong>, not guarantees of performance.
        </li>
        <li>
          <strong>Legal advice:</strong> We do not interpret laws, regulations, or
          ordinances. STR regulation summaries on this Site may be outdated or inaccurate
          — always verify with the City of Asheville or a qualified attorney.
        </li>
        <li>
          <strong>Tax advice:</strong> We do not provide tax guidance. Property tax
          estimates and STR tax implications vary by individual circumstance.
        </li>
        <li>
          <strong>Appraisal or valuation:</strong> Our Home Value Estimator produces
          estimates based on publicly available data and neighborhood comparables. These
          are <strong>not</strong> certified appraisals and should not be relied upon for
          lending, insurance, or legal purposes.
        </li>
      </ul>
      <p>
        Before making any real estate, financial, or legal decision, you should consult
        with a qualified professional who understands your individual circumstances.
      </p>

      {/* Tools Disclaimer */}
      <h2 id="tools-disclaimer">4. Tools &amp; Calculators Disclaimer</h2>
      <p>
        The Site offers several interactive tools, including but not limited to:
      </p>
      <ul>
        <li>Home Value Estimator</li>
        <li>Mortgage Calculator</li>
        <li>Relocation Cost Checklist</li>
        <li>STR Revenue Estimator</li>
        <li>Neighborhood Comparison Tool</li>
      </ul>
      <p>
        You acknowledge and agree that:
      </p>
      <ul>
        <li>
          All outputs from these tools are <strong>estimates only</strong>. Actual values,
          costs, rates, and returns will vary based on factors we cannot account for —
          including but not limited to: your credit score, down payment amount, local
          market conditions at the time of transaction, property-specific characteristics,
          renovation needs, and changes in regulations or tax law.
        </li>
        <li>
          You use these tools <strong>entirely at your own risk</strong>. We make no
          warranties about the accuracy, completeness, or reliability of any tool output.
        </li>
        <li>
          You should not make financial commitments or legal decisions based solely on
          these tools. Always obtain independent professional verification.
        </li>
        <li>
          Calculator inputs and outputs may be temporarily stored in your browser&apos;s
          LocalStorage for convenience. We do not collect or store calculator inputs on
          our servers.
        </li>
      </ul>

      {/* Accuracy of Information */}
      <h2 id="accuracy">5. Accuracy of Information</h2>
      <p>
        We strive to provide accurate and up-to-date information, but we make no
        representations or warranties about the completeness, accuracy, reliability,
        suitability, or availability of the information on the Site. Market data,
        pricing, regulations, and neighborhood statistics may change rapidly and without
        notice.
      </p>
      <p>
        Specific sources of potential inaccuracy include:
      </p>
      <ul>
        <li>
          <strong>Market data:</strong> Median prices, days on market, appreciation
          rates, and inventory figures are sourced from public records and MLS data.
          These figures represent aggregated historical trends and may not reflect
          current market conditions or specific properties.
        </li>
        <li>
          <strong>Neighborhood boundaries and descriptions:</strong> Boundaries are
          approximate. Descriptions of neighborhood character, walkability, and schools
          are subjective assessments and should not be the sole basis for a purchasing
          decision.
        </li>
        <li>
          <strong>STR regulations:</strong> Short-term rental regulations in Asheville
          and Buncombe County are subject to change through city council and county
          commission actions. Always verify current rules with the City of Asheville
          Development Services Department.
        </li>
        <li>
          <strong>School data:</strong> School ratings and district boundaries are
          sourced from third-party providers and may be outdated or inaccurate. Contact
          the school district directly for the most current information.
        </li>
      </ul>
      <p>
        If you identify an error on the Site, please let us know at{" "}
        <a href="mailto:chris@ashevillere.com">chris@ashevillere.com</a>.
      </p>

      {/* Intellectual Property */}
      <h2 id="intellectual-property">6. Intellectual Property</h2>
      <p>
        All content on the Site — including text, graphics, logos, icons, images, data
        compilations, software, and the overall design and layout — is the property of
        AshevilleRE or its content suppliers and is protected by United States and
        international copyright, trademark, and other intellectual property laws.
      </p>
      <p>
        You may view, download, and print pages from the Site for your own{" "}
        <strong>personal, non-commercial use</strong> only. You may not:
      </p>
      <ul>
        <li>Republish, reproduce, or redistribute content from this Site without our express written consent</li>
        <li>Sell, rent, or sublicense material from the Site</li>
        <li>Use the Site&apos;s content for any commercial purpose without our permission</li>
        <li>Systematically scrape, data-mine, or extract data from the Site using automated means</li>
        <li>Use the AshevilleRE name, logo, or branding without our permission</li>
      </ul>
      <p>
        Market statistics, publicly available data points, and government-sourced
        information are not subject to our copyright claims. You remain free to use
        public data as permitted by law.
      </p>

      {/* User Conduct */}
      <h2 id="user-conduct">7. User Conduct</h2>
      <p>
        You agree to use the Site only for lawful purposes and in accordance with these
        Terms. You agree not to:
      </p>
      <ul>
        <li>Use the Site in any way that violates applicable federal, state, local, or international law</li>
        <li>Attempt to interfere with the proper working of the Site, including through denial-of-service attacks, excessive automated requests, or other abusive techniques</li>
        <li>Attempt to gain unauthorized access to any part of the Site, the server on which it is hosted, or any connected database</li>
        <li>Use the AI Chatbot to generate harmful, illegal, or abusive content</li>
        <li>Impersonate or attempt to impersonate AshevilleRE, its employees, or another user</li>
        <li>Introduce viruses, malware, or other harmful code</li>
      </ul>

      {/* Third-Party Links */}
      <h2 id="third-party">8. Third-Party Links &amp; Affiliates</h2>
      <p>
        The Site contains links to third-party websites and services that are not owned
        or controlled by AshevilleRE. These include recommended tools, affiliate
        partners, educational resources, and external references.
      </p>
      <p>
        We have no control over and assume no responsibility for the content, privacy
        policies, or practices of any third-party websites. We provide these links for
        your convenience only — they do not imply endorsement. You access third-party
        sites at your own risk.
      </p>
      <p>
        Some links on this Site are <strong>affiliate links</strong>, which means we may
        earn a commission if you make a purchase or sign up through those links. This
        comes at no additional cost to you. For full details, see our{" "}
        <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
      </p>

      {/* AI Chatbot */}
      <h2 id="ai-chatbot">9. AI Chatbot Disclaimer</h2>
      <p>
        The Site includes an AI-powered chatbot feature. You acknowledge and agree that:
      </p>
      <ul>
        <li>
          The chatbot is powered by a large language model (LLM) that generates responses
          based on patterns in training data. It can and will produce{" "}
          <strong>inaccurate, incomplete, or misleading information</strong>.
        </li>
        <li>
          Chatbot responses do <strong>not</strong> constitute professional real estate,
          financial, legal, or tax advice — even if the response appears authoritative.
        </li>
        <li>
          You should <strong>independently verify</strong> any factual claim made by the
          chatbot — especially claims about market data, prices, regulations, or
          neighborhood characteristics — before relying on them.
        </li>
        <li>
          Chat messages are processed locally on our infrastructure and are not sent to
          external AI providers. However, we may log anonymized usage patterns for
          improvement purposes.
        </li>
        <li>
          We reserve the right to modify, limit, or discontinue the chatbot feature at any
          time without notice.
        </li>
      </ul>

      {/* Limitation of Liability */}
      <h2 id="liability">10. Limitation of Liability</h2>

      <div className="disclaimer-box">
        <p>
          <strong>To the fullest extent permitted by applicable law:</strong> AshevilleRE,
          its owners, operators, affiliates, and contributors shall not be liable for any
          direct, indirect, incidental, special, consequential, or punitive damages
          arising out of your use of, or inability to use, the Site or its Services.
        </p>
      </div>

      <p>This limitation of liability applies to, but is not limited to:</p>
      <ul>
        <li>
          Financial losses resulting from real estate decisions made based on Site content
        </li>
        <li>Losses from reliance on calculator estimates or chatbot responses</li>
        <li>Losses from inaccurate market data, regulatory information, or school data</li>
        <li>Damages resulting from third-party services linked from the Site</li>
        <li>Technical issues, downtime, data loss, or security breaches</li>
        <li>Errors, omissions, or inaccuracies in Site content</li>
      </ul>
      <p>
        If you are dissatisfied with any portion of the Site or with these Terms, your
        sole and exclusive remedy is to discontinue use of the Site.
      </p>
      <p>
        Some jurisdictions do not allow the exclusion or limitation of liability for
        consequential or incidental damages. In such jurisdictions, our liability is
        limited to the maximum extent permitted by law.
      </p>

      {/* Indemnification */}
      <h2 id="indemnification">11. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless AshevilleRE, its owners,
        operators, affiliates, and contributors from and against any claims, damages,
        costs, liabilities, and expenses (including reasonable attorneys&apos; fees)
        arising out of or related to:
      </p>
      <ul>
        <li>Your use of the Site or Services</li>
        <li>Your violation of these Terms</li>
        <li>Your violation of any third-party right, including intellectual property or privacy rights</li>
        <li>Any content you submit or transmit through the Site</li>
      </ul>

      {/* Termination */}
      <h2 id="termination">12. Termination</h2>
      <p>
        We may terminate or suspend your access to the Site immediately, without prior
        notice or liability, for any reason whatsoever, including without limitation if
        you breach these Terms. All provisions of these Terms which by their nature
        should survive termination shall survive termination — including, without
        limitation, intellectual property provisions, warranty disclaimers, indemnity,
        and limitations of liability.
      </p>

      {/* Governing Law */}
      <h2 id="governing-law">13. Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws of the
        State of North Carolina, United States, without regard to its conflict of law
        provisions. Any dispute arising from these Terms or your use of the Site shall
        be resolved exclusively in the state or federal courts located in Buncombe
        County, North Carolina.
      </p>
      <p>
        Our failure to enforce any right or provision of these Terms will not be
        considered a waiver of those rights. If any provision of these Terms is held to
        be invalid or unenforceable by a court, the remaining provisions of these Terms
        will remain in effect.
      </p>

      {/* Changes to Terms */}
      <h2 id="changes">14. Changes to Terms</h2>
      <p>
        We reserve the right to modify or replace these Terms at any time at our sole
        discretion. If a revision is material, we will try to provide notice by updating
        the &ldquo;Last updated&rdquo; date and, in some cases, posting a notice on the
        Site. What constitutes a material change will be determined at our sole
        discretion.
      </p>
      <p>
        By continuing to access or use the Site after revisions become effective, you
        agree to be bound by the revised Terms. If you do not agree to the new Terms,
        please stop using the Site.
      </p>

      {/* Contact */}
      <h2 id="contact">15. Contact</h2>
      <p>
        Questions about these Terms should be directed to:
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
    </LegalPageLayout>
  );
}
