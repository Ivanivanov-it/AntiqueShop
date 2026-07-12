# AntiqueShop Project Review

Date reviewed: 2026-07-13

## What This Project Does

This is an Astro static website for an antique shop. It builds a bilingual Bulgarian/English catalog with:

- A localized home page, category pages, antique detail pages, and informational pages.
- Antique listings stored as Markdown content in `src/content/antiques`.
- Static routes for both `/bg/...` and `/en/...`.
- Category and subcategory navigation driven from `src/utils/categories.js`.
- Image optimization during build through `scripts/optimize-images.js`, generating responsive WebP images and image manifests.
- A Decap CMS admin interface under `public/admin`, configured to edit antique Markdown entries and upload images.
- Netlify-oriented setup with Git Gateway/Identity admin access and static `dist` output.

The production build completed successfully outside the sandbox and generated 55 pages.

## Main Architecture

- `astro.config.mjs` configures Astro, Tailwind, i18n, a Decap local backend proxy, custom CMS logging, image-refresh hooks, and Vite watch ignores.
- `src/content.config.ts` defines the content collection schema for antique listings.
- `src/layouts/Layout.astro` owns global HTML, SEO metadata, navigation, footer, structured data, and mobile category menu behavior.
- `src/components/HomePage.astro` renders the home page, featured items, newest items, shop intro, trust section, and contact summary.
- `src/pages/[locale]/categories/[slug].astro` renders category listing pages with client-side subcategory, price, sorting, and pagination controls.
- `src/pages/[locale]/antiques/[id].astro` renders item details, responsive image galleries, thumbnails, zoom behavior, metadata, and contact CTA.
- `scripts/optimize-images.js` archives CMS uploads, rewrites Markdown references, generates optimized images, and writes image manifests used by the frontend.

## Issues And Risks Found

1. The Decap CMS dependent-select widget is fragile.
   `public/admin/index.html` detects the selected category by scraping `.css-hlgwow`, which is an internal Decap/React Select class. A Decap update or markup change can break subcategory validation and reset behavior. This should be replaced with a data-driven widget that reads the category from entry data or a supported Decap API path.

2. Category data is duplicated in several places.
   Category/subcategory strings exist in `src/utils/categories.js`, `src/content.config.ts`, `public/admin/config.yml`, and `public/admin/subcategories.js`. Because filtering depends on exact string matches, one typo or mismatch can make listings disappear from category pages or bypass validation.

3. The content model uses display names as identifiers.
   Listings store `category` and `subcategory` as human-readable labels. Slugs or stable IDs would be safer. Display text should be a translation layer, not the database key.

4. Some production copy and data still looks placeholder or inconsistent.
   Examples include `Established in X` / `Основан Х година` in `src/components/HomePage.astro`, the brand name "Berlin" while the address is Varna, and small Bulgarian typos such as `Джобни часновници` and `страринни бижута`.

5. The build mutates source-controlled generated files.
   `npm run build` runs `scripts/optimize-images.js`, which can update `public/images/optimized/manifest.json`, `src/generated/image-manifest.js`, and `src/generated/image-manifest.json`. That is functional, but it means a build can leave the working tree dirty.

6. Source and generated assets are very large for a static site repo.
   `public` is about 134 MB and `dist` is about 136 MB. Since `dist` and generated Astro files are ignored, the main concern is the large checked-in image set and generated optimized variants under `public/images/optimized`.

7. Admin scripts depend on third-party CDNs at runtime.
   `public/admin/index.html` loads Netlify Identity and Decap CMS from external URLs. If those CDNs are blocked or versions change unexpectedly, the admin UI can fail. Decap is pinned, which helps, but local vendoring or tighter deployment checks would reduce risk.

8. English localization is partial.
   Routes are bilingual, but item titles/descriptions come directly from the same Markdown fields for both locales. English category labels exist, but antique-specific content is not translated.

9. There is no automated test suite or content validation command beyond the Astro build.
   The build catches schema failures, but there are no focused checks for category consistency, broken image references, duplicate slugs, CMS config drift, or expected route generation.

10. The current working tree was already dirty.
    Before this report, Git showed modified image manifests and one modified antique Markdown file. The Markdown diff only reorders image URLs for `starinna-bonboniera-wmf-stil-ar-nuvo-1890-1910.md`; the manifests include generated entries.

## Improvement Ideas

1. Create one source of truth for categories.
   Move category definitions, subcategories, required-subcategory rules, CMS options, and localized labels into one structured module or JSON file. Generate the Decap config/subcategory file and content validation rules from that data.

2. Store stable category IDs in content.
   Change antique frontmatter to use values like `category: kolektsionerski-predmeti` and `subcategory: drugi`. Render localized display names from the category catalog. This will make filtering, validation, and translation more reliable.

3. Replace the custom Decap DOM-scraping widget.
   Either use a simpler pair of select fields generated from shared data, or build a Decap widget that does not depend on internal CSS classes. Add a small manual admin test checklist after this change.

4. Add a validation script.
   A useful `npm run validate` could check:
   - every content category/subcategory exists in the category catalog;
   - categories requiring subcategories have one;
   - every image reference exists;
   - every image reference appears in the optimized manifest;
   - every item has a safe ASCII `latinSlug`;
   - no duplicate slugs or generated routes exist.

5. Decide how to manage optimized images.
   Either commit optimized images and manifests intentionally, or treat them as build artifacts. The current mixed approach works but creates churn. If deployment can run Sharp reliably, optimized outputs could be generated during build and excluded from source control.

6. Clean up public copy and store facts in config.
   Put shop name, address, phone, email, opening hours, social links, and founding year in one config file. This avoids scattered hardcoded business details across layout, home, contact, and structured data.

7. Improve bilingual content.
   If English pages are important, extend the Markdown schema with localized fields such as `title.bg`, `title.en`, `description.bg`, and `description.en`, or split content per locale. Currently the English pages mostly localize UI chrome, not the antiques themselves.

8. Add link and route checks to CI.
   After `npm run build`, crawl `dist` for missing local assets, broken internal links, and missing expected localized routes. This is especially useful for a static catalog.

9. Add image/reference cleanup tooling.
   With many uploaded and optimized images, a script that identifies unused uploads and stale optimized variants would help control repo size.

10. Review SEO data.
    The site emits structured data for a store and good baseline metadata, but the Berlin/Varna naming inconsistency should be resolved. Product pages could also emit `Product` structured data with price and availability.

## Suggested Next Steps

1. Fix the content and copy issues that are visible to customers: placeholder founding year, Berlin/Varna naming, and Bulgarian typos.
2. Consolidate category data and migrate content to stable category/subcategory IDs.
3. Replace the Decap dependent-select implementation.
4. Add a validation script and run it before every build.
5. Decide whether optimized images/manifests belong in Git or should be generated only during deployment.

## Verification Performed

- Inspected project structure, package metadata, Astro config, content schema, key pages, layout, utilities, admin config, and image optimization script.
- Ran `npm run build`; the sandboxed attempt failed due dependency access restrictions, then the approved outside-sandbox build succeeded.
- Confirmed the build generated 55 static pages.
- Checked current Git status and noted existing modified files.
