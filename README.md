# Antique Shop Website

A simple, professional website for a family antique shop. The site presents selected antiques, rare objects, and collectible items with photos, descriptions, categories, prices, and contact information.

The project is built as a fast static website with bilingual support for Bulgarian and English.

## What the Website Does

- Shows a curated catalog of antique items.
- Groups items by category and subcategory.
- Provides individual detail pages for every antique.
- Supports Bulgarian and English routes.
- Includes informational pages such as About, Contact, Payment Methods, Delivery Terms, Returns, and Thank You.
- Uses Markdown content files so new antique listings can be added without changing page code.
- Includes Netlify Identity setup for admin access.
- Generates an optimized static build suitable for deployment on Netlify or another static hosting provider.

## Technologies Used

- **Astro** - static site framework and routing.
- **TypeScript** - strict project typing through Astro.
- **Tailwind CSS** - responsive styling and layout.
- **Astro Content Collections** - structured Markdown antique listings.
- **Sharp** - image optimization during the build process.
- **Netlify Identity Widget** - admin login support.
- **Node.js** - project tooling and build scripts.

## Project Structure

```text
.
+-- public/                 Static public assets
+-- scripts/                Build helper scripts, including image optimization
+-- src/
|   +-- assets/             Source images and SVG assets
|   +-- components/         Reusable Astro components
|   +-- content/
|   |   +-- antiques/       Markdown files for antique listings
|   +-- layouts/            Shared page layout
|   +-- pages/              Website routes and localized pages
|   |   +-- [locale]/       Bulgarian and English route pages
|   +-- styles/             Global CSS
|   +-- utils/              Helpers for categories, images, and localization
+-- astro.config.mjs        Astro and i18n configuration
+-- package.json            Scripts and dependencies
+-- tsconfig.json           TypeScript configuration
```

## Content Model

Antique items are stored in `src/content/antiques` as Markdown files. Each item can include:

- Title
- Description
- Category
- Optional subcategory
- One or more images
- Price
- Featured status
- Availability
- Date and view metadata

Astro validates this content during development and build.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production site:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Requirements

- Node.js `22.12.0` or newer
- npm

## Notes

The default language is Bulgarian, with English available through localized routes. The final output is static HTML, CSS, and JavaScript, making the site fast and easy to host.
