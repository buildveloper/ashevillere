# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# Code Style
- Use Next.js Image component for all images with proper sizing and fallbacks, not plain img tags. Confidence: 0.85
- Maintain premium Viktor Oddy style with glassmorphism, light/dark mode, and excellent mobile responsiveness. Confidence: 0.70

# SEO
- Sitemaps must be clean XML with only urlset/url elements, use today's date for lastmod on all active pages, and include proper changefreq and priority values. Confidence: 0.80

# Workflow
- Consults project planning docs (AGENTS.md, design docs) before starting work. Confidence: 0.8
- Verifies with production builds (e.g., `next build`), not just dev mode. Confidence: 0.85
- Deploys changes to preview environments (e.g., Vercel preview URLs) and avoids touching production domains/DNS. Confidence: 0.8
- Preserves planning docs, git history, and env/secrets config when wiping or rearchitecting app code. Confidence: 0.7
- Expects performance reporting against Lighthouse metrics (LCP/INP/CLS). Confidence: 0.7

