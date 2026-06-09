"use client";

import { Heart, DollarSign, Link2, ShieldCheck } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const SECTIONS = [
  { id: "ftc-statement", title: "FTC Compliance Statement" },
  { id: "how-we-earn", title: "How We Earn Commissions" },
  { id: "our-philosophy", title: "Our Recommendation Philosophy" },
  { id: "no-guarantees", title: "No Guarantees on Earnings" },
  { id: "identifying-links", title: "Identifying Affiliate Links" },
  { id: "current-partners", title: "Current Affiliate Partners" },
  { id: "questions", title: "Questions & Contact" },
];

export function AffiliateDisclosureContent() {
  return (
    <LegalPageLayout
      title="Affiliate Disclosure"
      subtitle="Full transparency about how AshevilleRE earns revenue. We participate in affiliate programs, earn commissions on some links, and only recommend tools we genuinely believe in."
      lastUpdated="June 1, 2026"
      sections={SECTIONS}
      icon={<Heart className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />}
    >
      {/* FTC Compliance Statement */}
      <h2 id="ftc-statement">1. FTC Compliance Statement</h2>
      <p>
        In accordance with the{" "}
        <strong>Federal Trade Commission (FTC) Guidelines</strong> (16 CFR Part 255)
        concerning the use of endorsements and testimonials in advertising, we want
        you to be aware of the following:
      </p>
      <ul>
        <li>
          AshevilleRE participates in various affiliate marketing programs. This means
          we may earn a commission when you click on or make purchases via certain
          links on this Site.
        </li>
        <li>
          Every page containing affiliate links will include a disclosure statement.
          This page serves as our comprehensive disclosure.
        </li>
        <li>
          We disclose our affiliate relationships clearly, conspicuously, and before
          any affiliate links when reasonably possible.
        </li>
      </ul>

      <div className="disclaimer-box">
        <p>
          <strong>FTC-mandated disclosure:</strong> Ashevillere.com is a participant in
          affiliate advertising programs designed to provide a means for sites to earn
          advertising fees by advertising and linking to partner companies. When you
          click on an affiliate link and make a purchase, we may receive a commission
          at <strong>no additional cost to you</strong>.
        </p>
      </div>

      {/* How We Earn Commissions */}
      <h2 id="how-we-earn">2. How We Earn Commissions</h2>
      <p>
        AshevilleRE generates revenue through three primary channels:
      </p>
      <ol>
        <li>
          <strong>Affiliate Commissions:</strong> When you click an affiliate link on
          our Site and complete a purchase or sign-up on the partner&apos;s website, we
          earn a commission. The price you pay is the same whether you use our link
          or go directly to the partner&apos;s site. In some cases, our link may even
          give you a discount.
        </li>
        <li>
          <strong>Display Advertising (Future):</strong> In the future, we may display
          non-intrusive advertisements. These will be clearly distinguished from
          editorial content.
        </li>
        <li>
          <strong>Premium Tools (Future):</strong> We may eventually offer premium
          versions of our analytical tools with enhanced features. All current tools
          and content are and will remain free.
        </li>
      </ol>
      <p>
        We do <strong>not</strong> charge for access to the Site, sell user data, accept
        payment for editorial content, publish sponsored posts without clear disclosure,
        or earn commissions from real estate transactions.
      </p>

      {/* Our Philosophy */}
      <h2 id="our-philosophy">3. Our Recommendation Philosophy</h2>
      <p>
        We take our role as a trusted resource seriously. The real estate industry is
        full of predatory marketing, kickbacks, and undisclosed conflicts of interest.
        We are committed to being different:
      </p>
      <ul>
        <li>
          <strong>We only recommend tools we believe in.</strong> Every product, tool, or
          service we link to is something we have either used personally, researched
          thoroughly, or heard strong independent endorsements for from trusted
          professionals in the Asheville real estate community. We do not recommend
          products solely because they offer high commissions.
        </li>
        <li>
          <strong>No pay-for-play.</strong> We never accept payment in exchange for a
          recommendation. Our opinions about tools and services are our own. If we
          dislike a product, we either don&apos;t mention it or we explain our concerns
          honestly.
        </li>
        <li>
          <strong>Transparency first.</strong> When we include an affiliate link, we
          disclose it. We do not hide disclosures in tiny text or bury them at the
          bottom of a page. You deserve to know when we have a financial interest.
        </li>
        <li>
          <strong>We welcome scrutiny.</strong> If you believe a recommendation on this
          Site is biased or unsubstantiated, please email us at{" "}
          <a href="mailto:chris@ashevillere.com">chris@ashevillere.com</a>. We will
          re-evaluate any recommendation that raises legitimate concerns.
        </li>
      </ul>

      {/* No Guarantees */}
      <h2 id="no-guarantees">4. No Guarantees on Earnings</h2>
      <div className="disclaimer-box">
        <p>
          <strong>Results not typical.</strong> Any earnings, revenue, or return-on-investment
          figures mentioned on this Site — whether in blog posts, STR analyses, calculator
          projections, or tool descriptions — are <strong>illustrative estimates only</strong>.
          They do not represent guarantees of what you will earn or achieve. Individual
          results depend on numerous factors including market conditions, property
          location, management quality, capital invested, regulatory changes, and
          economic conditions beyond anyone&apos;s control.
        </p>
      </div>
      <p>
        Specifically regarding affiliate products and services:
      </p>
      <ul>
        <li>
          We do not guarantee that using any tool or service we recommend will result in
          higher investment returns, better property management outcomes, or increased
          rental income.
        </li>
        <li>
          Performance claims made by our affiliate partners (e.g., &ldquo;increase your
          revenue by 30%&rdquo;) are the partner&apos;s claims, not ours. We do not
          independently verify such claims unless explicitly stated.
        </li>
        <li>
          Past performance of any investment strategy, tool, or service does not
          guarantee future results. Real estate investing involves substantial risk,
          including the potential loss of principal.
        </li>
      </ul>
      <p>
        Always conduct your own due diligence before purchasing any product, service, or
        investment. What works for one investor may not work for you.
      </p>

      {/* Identifying Affiliate Links */}
      <h2 id="identifying-links">5. Identifying Affiliate Links</h2>
      <p>
        We follow these practices to help you identify affiliate content:
      </p>
      <ul>
        <li>
          <strong>Page-level disclosure:</strong> The <Link2 className="inline w-3.5 h-3.5" />{" "}
          Resources page includes an affiliate disclosure banner at the top of the page,
          visible before any affiliate links appear.
        </li>
        <li>
          <strong>Inline labeling:</strong> Affiliate links may be labeled with a small tag
          such as &ldquo;(affiliate link)&rdquo; or an affiliate icon.
        </li>
        <li>
          <strong>Blog disclosure:</strong> Any blog post containing affiliate links will
          include a disclosure near the top of the article.
        </li>
        <li>
          <strong>Footer link:</strong> A link to this Affiliate Disclosure page appears
          in the Site&apos;s footer on every page.
        </li>
      </ul>
      <p>
        If you&apos;re ever unsure whether a link is an affiliate link, assume that it
        might be. When in doubt, you can always navigate directly to the product&apos;s
        website rather than clicking our link.
      </p>

      {/* Current Partners */}
      <h2 id="current-partners">6. Current Affiliate Partners</h2>
      <p>
        As of the last update to this page, we participate in affiliate programs with
        the following companies and platforms. This list may not be exhaustive and is
        subject to change:
      </p>
      <ul>
        <li>
          <strong>TurboTenant</strong> — Property management software for landlords.
          (Affiliate program)
        </li>
        <li>
          <strong>Buildium</strong> — Property management platform. (Affiliate program)
        </li>
        <li>
          <strong>PriceLabs</strong> — Dynamic pricing for short-term rentals. (Affiliate
          program)
        </li>
        <li>
          <strong>BiggerPockets</strong> — Real estate investing education and tools.
          (Affiliate program)
        </li>
        <li>
          <strong>Steadily</strong> — Landlord insurance. (Affiliate program)
        </li>
        <li>
          <strong>Amazon Associates</strong> — We may earn commissions on qualifying
          purchases made through Amazon links (e.g., recommended books, equipment).
        </li>
      </ul>
      <p>
        We add and remove partners based on our ongoing evaluation of their products. We
        do not enter into exclusive affiliate arrangements, and we reserve the right to
        link to competitors when appropriate.
      </p>
      <p>
        <strong>Note:</strong> Listing a partner here does not mean we endorse every
        aspect of their product. We may recommend a tool for specific use cases while
        acknowledging its limitations for others. We strive to present a balanced view.
      </p>

      {/* Questions */}
      <h2 id="questions">7. Questions &amp; Contact</h2>
      <p>
        We are committed to transparency and welcome your questions or concerns about
        our affiliate relationships and editorial independence. If you have questions
        about this disclosure, specific recommendations, or believe a conflict of
        interest has not been adequately disclosed, please contact us:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:chris@ashevillere.com">chris@ashevillere.com</a>
        </li>
        <li>
          <strong>Subject line:</strong> Please include &ldquo;Affiliate Disclosure&rdquo;
          in your subject line for faster routing.
        </li>
      </ul>
      <p>
        We read and consider every message. If you have a legitimate concern about our
        recommendations, we will investigate and, where appropriate, update our content
        or disclosure practices.
      </p>
    </LegalPageLayout>
  );
}
