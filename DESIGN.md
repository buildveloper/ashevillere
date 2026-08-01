# DESIGN.md

## Thesis
The bar isn't "looks expensive." What actually separates award-tier work from AI-template work is direction, technical craft, and performance, roughly in that order — and performance is the one most builds fail. The studios that win Awwwards Developer Awards test on real devices, not top-end laptops: a striking hero that drops to 18fps on a mid-range phone, or a 9MB first load, reads as cheap no matter how good the design looked in Figma. Beauty at 60fps is the whole discipline.

Nothing below costs anything beyond the free tools this project already runs on.

## Grounding
This is a Buncombe County, NC public-data tool, not a generic SaaS. It should look like it's made of the same materials as its subject — topography, elevation, public survey data — not a template that could be reskinned for any city tomorrow. Two AI-design defaults to actively avoid, since they've become recognizable as generic: (1) warm cream background + high-contrast serif + terracotta accent, (2) near-black background + single neon accent. Neither fits here anyway — the whole pitch is "grounded and sourced," not flashy.

## Design tokens
```css
:root {
  --paper: #EDEFE7;
  --card: #F7F8F2;
  --ink: #17241C;
  --pine: #1E3B2C;
  --pine-2: #2C5240;
  --stone: #6B7268;
  --contour: #B8763A;
  --river: #3E7C8C;
  --clay: #8B4A3C;
  --safe: #4F7A5C;
}
```
- `--pine` / `--pine-2` — primary brand, CTAs, headline accents
- `--river` — neutral/informational data (STR eligibility, links) — not a risk signal
- `--safe` / `--clay` — reserved for genuine safe/risk states inside data panels, never decorative
- `--contour` — the topographic motif color, used sparingly (see Signature element)

## Typography
- Display: **Fraunces** (variable, optical sizing axis) — headlines only, used with restraint
- Body/UI: **Public Sans** — the actual U.S. federal government typeface; a quiet, deliberate nod to "this runs on public records," and a reason to skip the default Inter-everywhere look
- Data/mono: **IBM Plex Mono** — source citations, coordinates, data labels only, never body copy
- Two weights per face, maximum. Sentence case everywhere; no ALL CAPS except single-word mono eyebrows.

## Motion system
Standardize on the stack current award-winning agency sites are actually built on: GSAP + ScrollTrigger for scroll-driven animation, Lenis for smooth momentum scroll. Both are free for commercial use.
```bash
npm install gsap lenis @gsap/react
```
- **Page load**: one orchestrated sequence, not scattered effects. Contour lines draw in, headline and search bar rise in staggered, complete in under 2.5s. This is the one "big" motion moment on the page — everything else stays quieter than it.
- **Scroll**: Lenis-smoothed, driving GSAP ScrollTrigger for section reveals. Transitions should read as a single continuous surface — nothing should call attention to itself as "an animation."
- **Micro-interactions**: search focus state, button hover, result-card stagger-in on a completed lookup — this last one is the product's actual payoff moment, worth real attention.
- **3D / map**: don't fake this with a pre-rendered video loop. Use Mapbox GL JS (free up to 50k loads/month) for real terrain, building extrusion, and camera fly-to animation tied to the actual address being looked up. WebGL here is for atmosphere and truth, the same way top studios use it — not for spectacle.
- `prefers-reduced-motion` disables all of the above, everywhere, no exceptions.

## Performance budget (non-negotiable)
These are the numbers real award juries measure on real devices:
- LCP (Largest Contentful Paint): under 2.5s
- INP (Interaction to Next Paint): under 200ms
- CLS (Cumulative Layout Shift): under 0.1

If the contour SVG, the Mapbox instance, or any animation pushes past these, cut the animation before cutting the number.

## Accessibility floor
- Visible keyboard focus on every interactive element
- WCAG 2.2 contrast minimums on all text/background pairs
- `prefers-reduced-motion` skips straight to end states, content stays instantly visible

## Signature element
The topographic contour-line motif is the one place this design spends its boldness. It belongs as background atmosphere on the homepage hero and, ideally, as the literal rendering surface for address-lookup results — a real elevation map, not an illustration of one. It should not reappear as decoration on every other page. Restraint is what makes it read as intentional rather than a template pattern.

## Reference points, not templates
For calibration on what "done well" looks like with this exact free stack: By-Kin (Next.js + GSAP, Awwwards Developer Award — restrained editorial motion, transitions that never call attention to themselves), Iventions (Three.js used for atmosphere via GSAP-paced reveals, not spectacle), and Refokus's real-estate work (continuous 3D animation built from actual property data, not stock visuals). None of these needed a $10M budget — typical agency projects at this craft tier run $15k–75k. The craft is the free part. The budget mostly buys someone's time to stay disciplined with it — which is the part you're supplying yourself.
