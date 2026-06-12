export interface ImageConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const UNSPLASH_BASE = "https://images.unsplash.com";

function unsplash(id: string, w: number, h: number, alt: string): ImageConfig {
  return {
    src: `${UNSPLASH_BASE}/photo-${id}?w=${w}&q=80&auto=format&fit=crop`,
    alt,
    width: w,
    height: h,
  };
}

// ─── Neighborhood Images ─────────────────────────────────────────
export const NEIGHBORHOOD_IMAGES: Record<string, ImageConfig> = {
  "biltmore-forest": unsplash(
    "1600585154340-be6161a56a0c",
    800, 600,
    "Grand estate home in Biltmore Forest with mountain backdrop"
  ),
  "montford": unsplash(
    "1600596542815-ffad4c1539a9",
    800, 600,
    "Historic Victorian home in Montford district with wrap-around porch"
  ),
  "downtown": unsplash(
    "1600047509807-ba9ddec7ef9d",
    800, 600,
    "Vibrant downtown Asheville streetscape with brick buildings"
  ),
  "river-arts": unsplash(
    "1595206137885-9ed3b46d87f8",
    800, 600,
    "Industrial-chic warehouse in River Arts District"
  ),
  "west-asheville": unsplash(
    "1568605114967-8130f3a36994",
    800, 600,
    "Charming craftsman bungalow in West Asheville"
  ),
  "grove-park": unsplash(
    "1506905925346-21b36d8f4a19",
    800, 600,
    "Stone architecture and mountain views near Grove Park Inn"
  ),
  "north-asheville": unsplash(
    "1583608205776-bfd35f0d9c59",
    800, 600,
    "Tree-lined street with mid-century homes in North Asheville"
  ),
  "kenilworth": unsplash(
    "1512917774080-9991f1c4c750",
    800, 600,
    "Lakefront home with mountain views in Kenilworth"
  ),
  "beaver-lake": unsplash(
    "1600073240990-08f66b7f59b1",
    800, 600,
    "Beautiful home near Beaver Lake with natural surroundings"
  ),
  "biltmore-village": unsplash(
    "1575517111478-7f6afc0979db",
    800, 600,
    "Charming Biltmore Village streetscape with shops and restaurants"
  ),
};

export function getNeighborhoodImage(id: string, fallbacks: Record<string, ImageConfig> = {}) {
  return NEIGHBORHOOD_IMAGES[id] ?? fallbacks[id] ?? NEIGHBORHOOD_IMAGES["downtown"];
}

// ─── Blog Cover Images ───────────────────────────────────────────
export const BLOG_COVER_IMAGES: Record<string, ImageConfig> = {
  "asheville-real-estate-market-report-spring-2025": unsplash(
    "1486325212027-8081e485255e",
    1200, 630,
    "Aerial view of Asheville North Carolina in spring"
  ),
  "best-neighborhoods-for-families-asheville": unsplash(
    "1558618666-fcd25c85f82e",
    1200, 630,
    "Family walking in tree-lined Asheville neighborhood"
  ),
  "short-term-rental-rules-asheville-complete-guide": unsplash(
    "1475855581690-80f6a6b868a1",
    1200, 630,
    "Modern vacation rental cabin with mountain backdrop"
  ),
  "moving-to-asheville-complete-relocation-guide": unsplash(
    "1580674684081-7617fbf3d745",
    1200, 630,
    "Moving truck with scenic mountain backdrop near Asheville"
  ),
  "real-estate-investing-post-helene-asheville": unsplash(
    "1581094794329-c3562a7c2ba4",
    1200, 630,
    "Construction and renovation scene with Asheville style"
  ),
  "river-arts-district-hidden-gem-investors": unsplash(
    "1545324416151-c099654d42d8",
    1200, 630,
    "River Arts District streetscape with galleries and the French Broad River"
  ),
  "is-asheville-still-a-good-investment-2025": unsplash(
    "1560518883-cecfdd7c0b2f",
    1200, 630,
    "Financial growth charts overlaid with Asheville skyline"
  ),
  "spring-2025-home-selling-tips-asheville": unsplash(
    "1558036117-15d9cf1e48ed",
    1200, 630,
    "Bright and airy staged home interior perfect for spring selling"
  ),
};

export function getBlogCoverImage(slug: string, fallbacks: Record<string, ImageConfig> = {}) {
  return (
    BLOG_COVER_IMAGES[slug] ??
    fallbacks[slug] ??
    unsplash("1486325212027-8081e485255e", 1200, 630, "Asheville North Carolina landscape")
  );
}

// ─── Author Avatar ──────────────────────────────────────────────
export const AUTHOR_AVATAR: ImageConfig = unsplash(
  "1560250097-0b93528c311a",
  200, 200,
  "Professional real estate advisor portrait"
);

// ─── Property Images Pool ─────────────────────────────────────────
const PROPERTY_IMAGE_IDS = [
  "1600596542815-ffad4c1539a9", // craftsman exterior
  "1600585154340-be6161a56a0c", // luxury estate
  "1564013799919-ab600027ff36", // modern exterior
  "1568605114967-8130f3a36994", // bungalow
  "1575517111478-7f6afc0979db", // historic porch
  "1512917774080-9991f1c4c750", // lakefront
  "1583608205776-bfd35f0d9c59", // mid-century
  "1600073240990-08f66b7f59b1", // contemporary mountain
];

export const PROPERTY_IMAGE_POOL: ImageConfig[] = PROPERTY_IMAGE_IDS.map((id, i) =>
  unsplash(
    id,
    600, 400,
    `Beautiful Asheville area property ${i + 1}`
  )
);

export function getListingImage(index: number): ImageConfig {
  return PROPERTY_IMAGE_POOL[index % PROPERTY_IMAGE_POOL.length];
}
