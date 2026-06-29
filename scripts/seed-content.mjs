import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const payload = await getPayload({ config })

// ─── Lexical helpers ──────────────────────────────────────────────────────────

function lexText(text, format = 0) {
  return { type: 'text', detail: 0, format, mode: 'normal', style: '', text, version: 1 }
}

function lexParagraph(...texts) {
  return {
    type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr',
    children: texts.map(t => (typeof t === 'string' ? lexText(t) : t)),
  }
}

function lexHeading(tag, text) {
  return {
    type: 'heading', tag, format: '', indent: 0, version: 1, direction: 'ltr',
    children: [lexText(text)],
  }
}

function lexListItem(text, value = 1) {
  return {
    type: 'listitem', value, checked: undefined, direction: 'ltr',
    format: '', indent: 0, version: 1,
    children: [lexText(text)],
  }
}

function lexBulletList(...items) {
  return {
    type: 'list', listType: 'bullet', start: 1, tag: 'ul',
    format: '', indent: 0, version: 1, direction: 'ltr',
    children: items.map((t, i) => lexListItem(t, i + 1)),
  }
}

function lexDoc(...nodes) {
  return {
    root: {
      type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
      children: nodes,
    },
  }
}

// ─── Step 1: Fetch existing docs ──────────────────────────────────────────────

console.log('\n─── Fetching existing documents ────────────────────────────')

const [channelResult, contentResult] = await Promise.all([
  payload.find({ collection: 'channelPages', overrideAccess: true, limit: 100 }),
  payload.find({ collection: 'contentPages', overrideAccess: true, limit: 100 }),
])

const ch = {}
channelResult.docs.forEach(d => { ch[d.slug] = d.id })
const ct = {}
contentResult.docs.forEach(d => { ct[d.slug] = d.id })

console.log('Channel pages found:', Object.keys(ch).join(', '))
console.log('Content pages found:', Object.keys(ct).join(', '))

// ─── Step 2: Update channel page slugs / titles ──────────────────────────────
// Rename the generic "2nd-level-entry-*" and "test*" slugs to real names

const slugRenames = [
  { collection: 'channelPages', oldSlug: '2nd-level-entry-1', newSlug: 'logo', title: 'Logo' },
  { collection: 'channelPages', oldSlug: '2nd-level-entry-2', newSlug: 'colour-system', title: 'Colour System' },
  { collection: 'contentPages', oldSlug: '3rd-level-entry-1', newSlug: 'logo-usage-guidelines', title: 'Logo Usage Guidelines' },
  { collection: 'contentPages', oldSlug: '3rd-level-entry-2', newSlug: 'colour-palette', title: 'Colour Palette' },
  { collection: 'contentPages', oldSlug: 'test1', newSlug: 'primary-logo-versions', title: 'Primary Logo Versions' },
  { collection: 'contentPages', oldSlug: 'test2', newSlug: 'digital-typography', title: 'Digital Typography' },
]

console.log('\n─── Renaming slugs ─────────────────────────────────────────')
for (const { collection, oldSlug, newSlug, title } of slugRenames) {
  const lookup = collection === 'channelPages' ? ch : ct
  const id = lookup[oldSlug]
  if (!id) { console.log(`  SKIP: ${oldSlug} not found`); continue }
  await payload.update({ collection, id, data: { slug: newSlug, title }, overrideAccess: true })
  lookup[newSlug] = id
  delete lookup[oldSlug]
  console.log(`  ✓ ${collection} ${oldSlug} → ${newSlug}`)
}

// ─── Step 3: Update channel pages with real content ──────────────────────────

console.log('\n─── Updating channel pages ─────────────────────────────────')

const channelUpdates = [
  {
    slug: 'brand-identity',
    data: {
      title: 'Brand Identity',
      excerpt: 'Our visual identity defines how we present ourselves to the world. Explore our logo, colour system, typography, and the rules for using them consistently.',
      description: lexDoc(
        lexParagraph('The Ascendum visual identity is built on a precise set of elements that work together to create a consistent, recognisable brand across every touchpoint.'),
        lexParagraph('This section covers the foundational elements: our logo, colour palette, and typographic system. Follow these guidelines to ensure brand integrity in every application.'),
      ),
      buttons: [
        { label: 'Download Brand Kit', url: '#' },
      ],
      cards: [
        {
          title: 'Logo',
          excerpt: 'Discover how to use the Ascendum logo correctly — from clear space rules to size restrictions and approved colour variants.',
          page: { value: ch['logo'], relationTo: 'channelPages' },
        },
        {
          title: 'Colour System',
          excerpt: 'Our colour palette is the most immediate expression of our brand. Learn how to apply primary and secondary colours across all media.',
          page: { value: ch['colour-system'], relationTo: 'channelPages' },
        },
      ],
    },
  },
  {
    slug: 'brand-principles',
    data: {
      title: 'Brand Strategy',
      excerpt: 'Discover the thinking and principles behind the Ascendum brand — our mission, values, and the story we tell the world.',
      description: lexDoc(
        lexParagraph('A strong brand is built on a foundation of clear, consistent principles. Understanding who we are and what we stand for is the starting point for every brand decision.'),
        lexParagraph('This section contains our brand mission, core values, and the strategic framework that guides everything from campaign themes to day-to-day communications.'),
      ),
      buttons: [],
      cards: [],
    },
  },
  {
    slug: 'digital-applications',
    data: {
      title: 'Digital Applications',
      excerpt: 'Guidelines for applying the Ascendum brand across digital channels — websites, social media, email marketing, and digital advertising.',
      description: lexDoc(
        lexParagraph('Consistent digital brand application builds recognition and trust across all online platforms. This section provides specifications for every major digital format.'),
        lexParagraph('From responsive web layouts to social media templates and email signatures, you will find the rules and ready-to-use assets to get it right every time.'),
      ),
      buttons: [],
      cards: [
        {
          title: 'Digital Typography',
          excerpt: 'Web-safe font stacks, size scales, and line-spacing rules for responsive digital environments.',
          page: { value: ct['digital-typography'], relationTo: 'contentPages' },
        },
      ],
    },
  },
  {
    slug: 'physical-applications',
    data: {
      title: 'Physical Applications',
      excerpt: 'From business cards to large-format signage, this section covers how to apply the Ascendum brand in the physical world.',
      description: lexDoc(
        lexParagraph('Brand consistency in print and physical environments is just as important as digital. This section provides print-ready specifications, bleed settings, and material guidance.'),
        lexParagraph('Whether you are ordering printed collateral, specifying signage, or designing branded merchandise, start here for the correct files and specifications.'),
      ),
      buttons: [],
      cards: [],
    },
  },
  {
    slug: 'global-campaigns',
    data: {
      title: 'Global Campaigns',
      excerpt: 'Explore the templates, assets, and guidelines that underpin Ascendum\'s global marketing campaigns.',
      description: lexDoc(
        lexParagraph('Global campaigns require tight brand consistency across regions and languages. This section provides the master templates and assets for each campaign.'),
        lexParagraph('All local adaptations must begin from the approved master files found here and should be reviewed by the Brand Team before production.'),
      ),
      buttons: [],
      cards: [],
    },
  },
  {
    slug: 'logo',
    data: {
      title: 'Logo',
      excerpt: 'The Ascendum logo is the cornerstone of our visual identity. Use it correctly and it will do enormous work for us.',
      description: lexDoc(
        lexParagraph('The logo must always be reproduced from the approved master files available in this section. Never redraw, distort, or recreate the logo from scratch.'),
        lexParagraph('Explore the subsections below for detailed usage rules, size restrictions, colour variants, and prohibited treatments.'),
      ),
      buttons: [
        { label: 'Download Logo Pack', url: '#' },
      ],
      cards: [
        {
          title: 'Logo Usage Guidelines',
          excerpt: 'Clear space, minimum sizes, colour variants, and the rules for every placement scenario.',
          page: { value: ct['logo-usage-guidelines'], relationTo: 'contentPages' },
        },
        {
          title: 'Primary Logo Versions',
          excerpt: 'The full set of approved logo files — horizontal, stacked, monochrome, and reversed.',
          page: { value: ct['primary-logo-versions'], relationTo: 'contentPages' },
        },
      ],
    },
  },
  {
    slug: 'colour-system',
    data: {
      title: 'Colour System',
      excerpt: 'Our colour palette is carefully selected to communicate trust, clarity, and energy across all brand touchpoints.',
      description: lexDoc(
        lexParagraph('Colour is one of the most powerful tools we have for building brand recognition. The Ascendum palette is defined precisely to ensure consistency across print, screen, and environmental applications.'),
        lexParagraph('Explore the primary and secondary colour roles, usage rules, and accessibility guidance in the sections below.'),
      ),
      buttons: [],
      cards: [
        {
          title: 'Colour Palette',
          excerpt: 'Full palette reference with hex, RGB, CMYK, and Pantone values for every approved colour.',
          page: { value: ct['colour-palette'], relationTo: 'contentPages' },
        },
      ],
    },
  },
]

for (const { slug, data } of channelUpdates) {
  const id = ch[slug]
  if (!id) { console.log(`  SKIP channel: ${slug} not found`); continue }
  await payload.update({ collection: 'channelPages', id, data, overrideAccess: true })
  console.log(`  ✓ channelPages "${slug}"`)
}

// ─── Step 4: Update content pages with block layouts ─────────────────────────

console.log('\n─── Updating content pages ─────────────────────────────────')

const contentUpdates = [
  {
    slug: 'logo-usage-guidelines',
    data: {
      title: 'Logo Usage Guidelines',
      headerAnchorName: 'overview',
      excerpt: lexDoc(
        lexParagraph('These guidelines govern how the Ascendum logo is used in all materials. Following them ensures our logo retains its integrity and impact wherever it appears.'),
      ),
      layout: [
        {
          blockType: 'sectionBlock',
          title: 'Overview',
          anchorName: 'overview',
          body: lexDoc(
            lexParagraph('The Ascendum logo consists of a wordmark and symbol. The two elements must never be separated, rearranged, or altered in any way.'),
            lexParagraph('Always download the latest master files from this portal. Do not use logo files from older presentations, email signatures, or third-party sources.'),
          ),
        },
        {
          blockType: 'richText',
          content: lexDoc(
            lexHeading('h3', 'Approved colour variants'),
            lexBulletList(
              'Full colour on white or light backgrounds',
              'White (reversed) on dark or photographic backgrounds',
              'Single colour Navy Blue on light backgrounds',
              'Single colour White on dark brand colour backgrounds',
            ),
          ),
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Clear Space',
          anchorName: 'clear-space',
          body: lexDoc(
            lexParagraph('Clear space is the minimum breathing room around the logo that must be kept free of other graphic elements, text, and the edge of a page or screen.'),
            lexParagraph('The minimum clear space is defined as the cap-height of the "A" in Ascendum on all four sides of the logo.'),
          ),
        },
        {
          blockType: 'noteBlock',
          type: 'warning',
          title: 'Never crowd the logo',
          content: lexDoc(
            lexParagraph('Placing the logo too close to other elements reduces its impact and creates a cluttered, unprofessional appearance. When in doubt, use more space.'),
          ),
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Minimum Size',
          anchorName: 'minimum-size',
          body: lexDoc(
            lexParagraph('To maintain legibility, the logo must never be reproduced below the minimum sizes specified in the table below.'),
          ),
        },
        {
          blockType: 'tableBlock',
          rows: [
            { cells: [{ content: 'Application', isHeader: true }, { content: 'Minimum width (horizontal logo)', isHeader: true }] },
            { cells: [{ content: 'Print', isHeader: false }, { content: '25 mm', isHeader: false }] },
            { cells: [{ content: 'Digital', isHeader: false }, { content: '100 px', isHeader: false }] },
            { cells: [{ content: 'Large format', isHeader: false }, { content: '80 mm', isHeader: false }] },
          ],
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Prohibited Treatments',
          anchorName: 'prohibited',
          body: lexDoc(
            lexParagraph('The following treatments are never permitted and will be rejected in brand reviews:'),
          ),
        },
        {
          blockType: 'richText',
          content: lexDoc(
            lexBulletList(
              'Stretching or distorting the logo proportions',
              'Applying drop shadows, gradients, or outlines',
              'Placing the logo on a busy background without a clear field',
              'Using unapproved colour combinations',
              'Recreating the logo in a different typeface',
              'Animating the logo without explicit brand team approval',
            ),
          ),
        },
      ],
    },
  },
  {
    slug: 'colour-palette',
    data: {
      title: 'Colour Palette',
      headerAnchorName: 'primary-colours',
      excerpt: lexDoc(
        lexParagraph('The Ascendum colour palette is the result of extensive research into colour psychology and competitive differentiation. Use these values exactly as specified.'),
      ),
      layout: [
        {
          blockType: 'sectionBlock',
          title: 'Primary Colours',
          anchorName: 'primary-colours',
          body: lexDoc(
            lexParagraph('Our primary colours are the dominant tones of the Ascendum brand. Navy Blue is our anchor — it communicates stability, trust, and expertise. Red Ascendum is reserved exclusively as an accent.'),
          ),
        },
        {
          blockType: 'tableBlock',
          rows: [
            { cells: [{ content: 'Colour', isHeader: true }, { content: 'Name', isHeader: true }, { content: 'Hex', isHeader: true }, { content: 'RGB', isHeader: true }, { content: 'CMYK', isHeader: true }] },
            { cells: [{ content: '■', isHeader: false }, { content: 'Navy Blue (Ascendum)', isHeader: false }, { content: '#003846', isHeader: false }, { content: '0 / 56 / 70', isHeader: false }, { content: '100 / 20 / 0 / 73', isHeader: false }] },
            { cells: [{ content: '■', isHeader: false }, { content: 'Red (Ascendum)', isHeader: false }, { content: '#E31D1A', isHeader: false }, { content: '227 / 29 / 26', isHeader: false }, { content: '0 / 87 / 89 / 11', isHeader: false }] },
            { cells: [{ content: '■', isHeader: false }, { content: 'White', isHeader: false }, { content: '#FFFFFF', isHeader: false }, { content: '255 / 255 / 255', isHeader: false }, { content: '0 / 0 / 0 / 0', isHeader: false }] },
          ],
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Secondary Colours',
          anchorName: 'secondary-colours',
          body: lexDoc(
            lexParagraph('Secondary colours are used for supporting UI elements, backgrounds, and dividers. They must never compete with the primary palette.'),
          ),
        },
        {
          blockType: 'tableBlock',
          rows: [
            { cells: [{ content: 'Colour', isHeader: true }, { content: 'Name', isHeader: true }, { content: 'Hex', isHeader: true }, { content: 'Usage', isHeader: true }] },
            { cells: [{ content: '■', isHeader: false }, { content: 'Grey (Ascendum)', isHeader: false }, { content: '#D6D6D6', isHeader: false }, { content: 'Backgrounds, borders, dividers', isHeader: false }] },
            { cells: [{ content: '■', isHeader: false }, { content: 'Darker Grey', isHeader: false }, { content: '#585858', isHeader: false }, { content: 'Body text', isHeader: false }] },
            { cells: [{ content: '■', isHeader: false }, { content: 'Grey', isHeader: false }, { content: '#B1B1B1', isHeader: false }, { content: 'Inactive / disabled states', isHeader: false }] },
            { cells: [{ content: '■', isHeader: false }, { content: 'Lightest Grey', isHeader: false }, { content: '#F4F4F4', isHeader: false }, { content: 'Sidebar active background, subtle fills', isHeader: false }] },
          ],
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Colour Usage Rules',
          anchorName: 'usage-rules',
          body: lexDoc(
            lexParagraph('Correct colour usage is critical to brand consistency. The rules below are mandatory across all media.'),
          ),
        },
        {
          blockType: 'richText',
          content: lexDoc(
            lexBulletList(
              'Navy Blue must be the dominant colour on any branded surface',
              'Red Ascendum is an accent only — never use it as a background colour over large areas',
              'Do not create new tints or shades not listed in this palette',
              'Do not use Navy Blue and Red Ascendum in equal proportion',
              'White is the only approved background for body copy areas',
            ),
          ),
        },
        {
          blockType: 'quoteBlock',
          text: 'Colour is the first thing people notice and the last thing they forget. Protect it with the same rigour you would apply to the logo.',
          attribution: 'Ascendum Brand Strategy Team',
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Accessibility',
          anchorName: 'accessibility',
          body: lexDoc(
            lexParagraph('All colour combinations used for text must meet WCAG 2.1 AA contrast requirements as a minimum. AAA compliance is required for critical digital communications.'),
          ),
        },
        {
          blockType: 'noteBlock',
          type: 'info',
          title: 'Contrast ratios',
          content: lexDoc(
            lexParagraph('Navy Blue on White: 10.5:1 (AAA) — White on Navy Blue: 10.5:1 (AAA) — Darker Grey on White: 5.7:1 (AA). Never use Grey (#B1B1B1) as a text colour on white backgrounds — it fails AA.'),
          ),
        },
      ],
    },
  },
  {
    slug: 'primary-logo-versions',
    data: {
      title: 'Primary Logo Versions',
      headerAnchorName: 'versions',
      excerpt: lexDoc(
        lexParagraph('The approved logo files are available below in all standard formats. Always use these master files — never recreate the logo from scratch.'),
      ),
      layout: [
        {
          blockType: 'sectionBlock',
          title: 'Horizontal Logo',
          anchorName: 'versions',
          body: lexDoc(
            lexParagraph('The horizontal layout is the primary configuration for most applications. Use it wherever horizontal space permits — presentations, letterheads, email signatures, and web headers.'),
          ),
        },
        {
          blockType: 'richText',
          content: lexDoc(
            lexHeading('h3', 'Available formats'),
            lexBulletList(
              'SVG — Scalable vector, preferred for all digital uses',
              'EPS — Vector format for all print and production uses',
              'PNG (transparent) — For digital documents and presentations',
              'JPG (white background) — For contexts where transparency is not supported',
            ),
          ),
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Stacked Logo',
          anchorName: 'stacked',
          body: lexDoc(
            lexParagraph('The stacked (vertical) variant is provided for square-format applications such as social media avatars, app icons, and square ad units.'),
            lexParagraph('Do not use the stacked variant when the horizontal layout fits — always prefer the horizontal layout.'),
          ),
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Monochrome Versions',
          anchorName: 'monochrome',
          body: lexDoc(
            lexParagraph('Monochrome versions are provided for single-colour applications such as embroidery, engraving, and screen printing.'),
          ),
        },
        {
          blockType: 'noteBlock',
          type: 'info',
          title: 'When to use monochrome',
          content: lexDoc(
            lexParagraph('Use the monochrome white version on dark or photographic backgrounds. Use the monochrome Navy Blue version on light backgrounds when full-colour reproduction is not possible.'),
          ),
        },
      ],
    },
  },
  {
    slug: 'digital-typography',
    data: {
      title: 'Digital Typography',
      headerAnchorName: 'typefaces',
      excerpt: lexDoc(
        lexParagraph('Typography is a critical part of the Ascendum brand voice. These specifications ensure legibility, hierarchy, and consistency across all digital products.'),
      ),
      layout: [
        {
          blockType: 'sectionBlock',
          title: 'Typefaces',
          anchorName: 'typefaces',
          body: lexDoc(
            lexParagraph('The Ascendum digital type system uses two typefaces: Montserrat for headings and display text, and IBM Plex Sans for body copy and UI elements.'),
          ),
        },
        {
          blockType: 'richText',
          content: lexDoc(
            lexHeading('h3', 'Montserrat'),
            lexParagraph('A geometric sans-serif used exclusively for headings. Its strong, modern proportions reflect the confidence and ambition of the Ascendum brand.'),
            lexHeading('h3', 'IBM Plex Sans'),
            lexParagraph('A humanist sans-serif optimised for on-screen legibility. Used for all body copy, captions, labels, navigation, and form elements.'),
          ),
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Type Scale',
          anchorName: 'type-scale',
          body: lexDoc(
            lexParagraph('The following scale defines the exact type specifications for each semantic level. All values are in pixels for web and assume a 16px base.'),
          ),
        },
        {
          blockType: 'tableBlock',
          rows: [
            { cells: [{ content: 'Level', isHeader: true }, { content: 'Family', isHeader: true }, { content: 'Weight', isHeader: true }, { content: 'Size', isHeader: true }, { content: 'Line Height', isHeader: true }] },
            { cells: [{ content: 'H1', isHeader: false }, { content: 'Montserrat', isHeader: false }, { content: '700 (Bold)', isHeader: false }, { content: '40px', isHeader: false }, { content: '1.3', isHeader: false }] },
            { cells: [{ content: 'H2', isHeader: false }, { content: 'Montserrat', isHeader: false }, { content: '700 (Bold)', isHeader: false }, { content: '30px', isHeader: false }, { content: '1.3', isHeader: false }] },
            { cells: [{ content: 'H4', isHeader: false }, { content: 'Montserrat', isHeader: false }, { content: '700 (Bold)', isHeader: false }, { content: '18px', isHeader: false }, { content: '1.3', isHeader: false }] },
            { cells: [{ content: 'H5', isHeader: false }, { content: 'IBM Plex Sans', isHeader: false }, { content: '600 (SemiBold)', isHeader: false }, { content: '18px', isHeader: false }, { content: '1.5', isHeader: false }] },
            { cells: [{ content: 'Body M', isHeader: false }, { content: 'IBM Plex Sans', isHeader: false }, { content: '400 (Regular)', isHeader: false }, { content: '16px', isHeader: false }, { content: '1.5', isHeader: false }] },
            { cells: [{ content: 'Body S', isHeader: false }, { content: 'IBM Plex Sans', isHeader: false }, { content: '600 (SemiBold)', isHeader: false }, { content: '14px', isHeader: false }, { content: '1.5', isHeader: false }] },
          ],
        },
        {
          blockType: 'dividerBlock',
        },
        {
          blockType: 'sectionBlock',
          title: 'Usage Rules',
          anchorName: 'usage-rules',
          body: lexDoc(
            lexParagraph('Consistent application of the type scale creates a clear visual hierarchy that guides users through content intuitively.'),
          ),
        },
        {
          blockType: 'richText',
          content: lexDoc(
            lexBulletList(
              'Never use Montserrat for body copy — it reduces readability at small sizes',
              'Maintain the specified line-height values — do not override them in CSS',
              'IBM Plex Sans SemiBold (600) is the only approved bold weight for body-level text',
              'Do not use font sizes outside the defined scale',
              'Use system font stacks only when loading IBM Plex Sans is not possible',
            ),
          ),
        },
        {
          blockType: 'quoteBlock',
          text: 'Typography is the detail and presentation of text. It gives language a visual form. Getting it right is as important as the words themselves.',
          attribution: 'Ascendum Design System',
        },
      ],
    },
  },
]

for (const { slug, data } of contentUpdates) {
  const id = ct[slug]
  if (!id) { console.log(`  SKIP content: ${slug} not found`); continue }
  await payload.update({ collection: 'contentPages', id, data, overrideAccess: true })
  console.log(`  ✓ contentPages "${slug}"`)
}

// ─── Step 5: Rebuild navigation ───────────────────────────────────────────────

console.log('\n─── Rebuilding navigation ──────────────────────────────────')

const navItems = [
  {
    label: 'Brand Identity',
    page: { value: ch['brand-identity'], relationTo: 'channelPages' },
    showAsSearchFilter: true,
    children: [
      {
        label: 'Logo',
        page: { value: ch['logo'], relationTo: 'channelPages' },
        showAsSearchFilter: false,
        l3Items: [
          { label: 'Logo Usage Guidelines', page: ct['logo-usage-guidelines'] },
          { label: 'Primary Logo Versions', page: ct['primary-logo-versions'] },
        ],
      },
      {
        label: 'Colour System',
        page: { value: ch['colour-system'], relationTo: 'channelPages' },
        showAsSearchFilter: false,
        l3Items: [
          { label: 'Colour Palette', page: ct['colour-palette'] },
        ],
      },
    ],
  },
  {
    label: 'Brand Strategy',
    page: { value: ch['brand-principles'], relationTo: 'channelPages' },
    showAsSearchFilter: true,
    children: [],
  },
  {
    label: 'Digital Applications',
    page: { value: ch['digital-applications'], relationTo: 'channelPages' },
    showAsSearchFilter: true,
    children: [
      {
        label: 'Digital Typography',
        page: { value: ct['digital-typography'], relationTo: 'contentPages' },
        showAsSearchFilter: false,
        l3Items: [],
      },
    ],
  },
  {
    label: 'Physical Applications',
    page: { value: ch['physical-applications'], relationTo: 'channelPages' },
    showAsSearchFilter: true,
    children: [],
  },
  {
    label: 'Global Campaigns',
    page: { value: ch['global-campaigns'], relationTo: 'channelPages' },
    showAsSearchFilter: true,
    children: [],
  },
]

await payload.updateGlobal({ slug: 'navigation', data: { items: navItems }, overrideAccess: true })
console.log('  ✓ navigation rebuilt (5 L1 items)')

// ─── Step 6: Update footer settings ──────────────────────────────────────────

console.log('\n─── Updating footer settings ───────────────────────────────')

await payload.updateGlobal({
  slug: 'footerSettings',
  overrideAccess: true,
  data: {
    brandName: 'Ascendum',
    contactEmail: 'brand@ascendum.com',
    copyright: '© 2025 Ascendum Group. All rights reserved.',
    socialLinks: [],
    legalLinks: [
      { label: 'Privacy Policy', url: '/privacy-policy' },
      { label: 'Terms of Use', url: '/terms-of-use' },
    ],
  },
})
console.log('  ✓ footerSettings')

// ─── Step 7: Update homepage ──────────────────────────────────────────────────

console.log('\n─── Updating homepage ──────────────────────────────────────')

try {
  await payload.updateGlobal({
    slug: 'homePage',
    overrideAccess: true,
    data: {
      heroHeadline: 'Welcome to the Ascendum Brand Center',
      heroIntroText: 'Your single source of truth for brand guidelines, assets, and creative resources across all Ascendum sub-brands.',
      newInTitle: 'NEW IN',
      newInBody: 'The latest updates and additions to our brand guidelines.',
      quickAccessTitle: 'QUICK ACCESS',
      quickAccessBody: 'Jump straight to the most frequently used brand resources.',
      helpButtons: [
        { label: 'Contact Brand Team', url: '/contact', newTab: false, enabled: true },
        { label: 'FAQs', url: '/faqs', newTab: false, enabled: true },
        { label: 'Navigation Tips', url: '/navigation-tips', newTab: false, enabled: true },
      ],
    },
  })
  console.log('  ✓ homePage (text fields + helpButtons)')
} catch (err) {
  console.log(`  ⚠ homePage skipped — ${err.message}`)
}

// ─── Done ──────────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────────────────────────────')
console.log('Seed complete. Restart the dev server, then visit:')
console.log('  Homepage:          http://localhost:3000/')
console.log('  Channel page:      http://localhost:3000/brand-identity')
console.log('  Sub-channel page:  http://localhost:3000/brand-identity/logo')
console.log('  Content page:      http://localhost:3000/brand-identity/logo/logo-usage-guidelines')
console.log('  Colour page:       http://localhost:3000/brand-identity/colour-system/colour-palette')
console.log('  Digital type:      http://localhost:3000/digital-applications/digital-typography')
console.log('  Search:            http://localhost:3000/search?q=brand')
console.log('─────────────────────────────────────────────────────────────')

process.exit(0)
