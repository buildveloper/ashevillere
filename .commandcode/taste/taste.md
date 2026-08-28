# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# Code Style
- Use Next.js Image component for all images with proper sizing and fallbacks, not plain img tags. Confidence: 0.85
- Maintain premium Viktor Oddy style with glassmorphism, light/dark mode, and excellent mobile responsiveness. Confidence: 0.75
- Above-the-fold hero copy must stay fully server-painted with no JS-gated hiding — never put `opacity-0` + a post-hydration GSAP fade on LCP-critical text. An animation-hidden subhead silently became the LCP element and added ~1.9s of elementRenderDelay even though the intended H1 painted at FCP; entrance animations belong only on elements whose delayed appearance can't win the LCP race. Confidence: 0.7

# SEO
- Sitemaps must be clean XML with only urlset/url elements, use today's date for lastmod on all active pages, and include proper changefreq and priority values. Confidence: 0.80

# Product & Business
See [product-&-business/taste.md](product-&-business/taste.md)
# Workflow
See [workflow/taste.md](workflow/taste.md)
