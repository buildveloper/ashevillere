export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization + RealEstateAgent schema for home page
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: "AshevilleRE",
        url: "https://ashevillere.com",
        logo: "https://ashevillere.com/og?title=AshevilleRE&subtitle=Premium+Real+Estate+Intelligence&tag=ASHEVILLE+NC",
        image: "https://ashevillere.com/og?title=AshevilleRE&subtitle=Premium+Real+Estate+Intelligence&tag=ASHEVILLE+NC",
        description:
          "AshevilleRE delivers premium real estate intelligence for Asheville, NC. Market reports, neighborhood guides, STR insights, and tools.",
        areaServed: {
          "@type": "City",
          name: "Asheville",
          sameAs: "https://en.wikipedia.org/wiki/Asheville,_North_Carolina",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Asheville",
          addressRegion: "NC",
          addressCountry: "US",
        },
        sameAs: [
          "https://x.com/ashevillere",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "English",
        },
        knowsAbout: [
          "Asheville Real Estate",
          "Short Term Rentals",
          "Property Investment",
          "Neighborhood Guides",
          "Market Reports",
        ],
      }}
    />
  );
}

// WebSite schema
export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "AshevilleRE",
        url: "https://ashevillere.com",
        description:
          "AshevilleRE delivers premium real estate intelligence for Asheville, NC. Market reports, neighborhood guides, STR insights, and tools.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://ashevillere.com/?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

// BreadcrumbList schema
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

// Article schema for blog posts
export function ArticleSchema({
  title,
  description,
  url,
  datePublished,
  dateModified,
  author,
  imageUrl,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  imageUrl?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url,
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
          "@type": "Person",
          name: author,
        },
        publisher: {
          "@type": "Organization",
          name: "AshevilleRE",
          logo: {
            "@type": "ImageObject",
            url: "https://ashevillere.com/og?title=AshevilleRE&subtitle=Premium+Real+Estate+Intelligence&tag=ASHEVILLE+NC",
          },
        },
        ...(imageUrl && {
          image: {
            "@type": "ImageObject",
            url: imageUrl,
          },
        }),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      }}
    />
  );
}

// FAQ schema for structured Q&A
export function FAQSchema({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}
