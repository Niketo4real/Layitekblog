import { ALL_SEED_ARTICLES } from '../db/seed.ts';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function hashSlug(slug: string): number {
  let hash = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function generateLayitekLogoSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 96" width="360" height="96" fill="none">
  <!-- Outer Royal Blue Ring -->
  <circle cx="48" cy="48" r="39" fill="#FFFFFF" stroke="#002B99" stroke-width="8" />
  <!-- Interlocking Slanted Emblem inside Circle -->
  <g transform="translate(48, 48) skewX(-12) translate(-48, -48)">
    <!-- Left Blue Bracket -->
    <path d="M31 32 C31 28 34 25 38 25 H43 V59 H50 V66 C50 69 47 71 44 71 H31 V32 Z" fill="#002B99" />
    <!-- Right Blue Bracket -->
    <path d="M46 23 H59 C62 23 65 25 65 29 V61 C65 65 62 68 58 68 H53 V33 H46 V23 Z" fill="#002B99" />
    <!-- Center Top Golden Yellow Block -->
    <path d="M45 36 C45 34 46.5 33 48.5 33 H51.5 V45 H45 V36 Z" fill="#F9C851" />
    <!-- Center Bottom Crimson Red Block -->
    <path d="M45 50 C45 48 46.5 47 48.5 47 H51.5 V58 H45 V50 Z" fill="#EE2B3B" />
  </g>
  <!-- Layitek Wordmark & Tagline -->
  <text x="108" y="56" font-family="Montserrat, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-style="italic" font-size="42" letter-spacing="0.5" fill="#002B99">Layitek</text>
  <text x="110" y="79" font-family="Montserrat, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="500" font-size="12.5" letter-spacing="3.2" fill="#002B99">PRACTICAL KNOWLEDGE</text>
</svg>`;
}

export function generateLayitekFaviconSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" fill="none">
  <circle cx="48" cy="48" r="42" fill="#FFFFFF" stroke="#002B99" stroke-width="9" />
  <g transform="translate(48, 48) skewX(-12) translate(-48, -48)">
    <path d="M29 30 C29 25 32 22 37 22 H43 V61 H50 V69 C50 72 47 75 43 75 H29 V30 Z" fill="#002B99" />
    <path d="M46 20 H61 C65 20 68 23 68 27 V63 C68 68 65 71 60 71 H54 V31 H46 V20 Z" fill="#002B99" />
    <path d="M45 35 C45 33 46.5 32 48.5 32 H52 V45 H45 V35 Z" fill="#F9C851" />
    <path d="M45 50 C45 48 46.5 47 48.5 47 H52 V59 H45 V50 Z" fill="#EE2B3B" />
  </g>
</svg>`;
}

const CATEGORY_THEMES: Record<
  string,
  {
    label: string;
    bgStart: string;
    bgEnd: string;
    accent: string;
    secondary: string;
  }
> = {
  computers: {
    label: 'COMPUTERS & WORKSTATIONS',
    bgStart: '#08204E',
    bgEnd: '#0B3C8C',
    accent: '#38BDF8',
    secondary: '#F59E0B',
  },
  'phones-accessories': {
    label: 'PHONES & ACCESSORIES',
    bgStart: '#0C4A6E',
    bgEnd: '#0369A1',
    accent: '#22D3EE',
    secondary: '#10B981',
  },
  gadgets: {
    label: 'SMART GADGETS & ELECTRONICS',
    bgStart: '#115E59',
    bgEnd: '#0F766E',
    accent: '#2DD4BF',
    secondary: '#FBBF24',
  },
  telecommunications: {
    label: 'TELECOMMUNICATIONS & BROADBAND',
    bgStart: '#1E3A8A',
    bgEnd: '#1D4ED8',
    accent: '#60A5FA',
    secondary: '#34D399',
  },
  'cac-arena': {
    label: 'CAC ARENA • CORPORATE COMPLIANCE',
    bgStart: '#064E3B',
    bgEnd: '#007A4D',
    accent: '#34D399',
    secondary: '#F59E0B',
  },
  'branding-printing': {
    label: 'BRANDING & PRINT PRODUCTION',
    bgStart: '#78350F',
    bgEnd: '#B45309',
    accent: '#FBBF24',
    secondary: '#38BDF8',
  },
};

function wrapTitleLines(title: string, maxCharsPerLine = 34): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxCharsPerLine) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function getCategoryArtworkVector(categorySlug: string, variant: number, accent: string, secondary: string): string {
  switch (categorySlug) {
    case 'computers':
      return `
        <g transform="translate(760, 145)">
          <rect x="40" y="30" width="280" height="175" rx="10" fill="#0F172A" stroke="${accent}" stroke-width="3"/>
          <rect x="54" y="44" width="252" height="142" rx="4" fill="#1E293B"/>
          <!-- Code / Diagnostics bars -->
          <rect x="70" y="62" width="110" height="10" rx="3" fill="${accent}" opacity="0.9"/>
          <rect x="70" y="84" width="180" height="8" rx="3" fill="#94A3B8" opacity="0.6"/>
          <rect x="70" y="102" width="150" height="8" rx="3" fill="#94A3B8" opacity="0.5"/>
          <rect x="70" y="128" width="68" height="36" rx="6" fill="${secondary}" opacity="0.85"/>
          <rect x="150" y="128" width="68" height="36" rx="6" fill="${accent}" opacity="0.35"/>
          <rect x="230" y="128" width="60" height="36" rx="6" fill="#334155"/>
          <!-- Laptop Base -->
          <path d="M10 205H350L330 228H30L10 205Z" fill="#CBD5E1"/>
          <rect x="145" y="205" width="70" height="6" rx="3" fill="#64748B"/>
          <!-- SSD / Chip Motif -->
          <g transform="translate(${20 + (variant % 3) * 12}, 250)">
            <rect x="0" y="0" width="140" height="58" rx="8" fill="#0F172A" stroke="#475569" stroke-width="2"/>
            <rect x="16" y="14" width="32" height="30" rx="3" fill="${accent}"/>
            <rect x="58" y="14" width="32" height="30" rx="3" fill="${accent}" opacity="0.7"/>
            <text x="100" y="34" font-family="Montserrat, sans-serif" font-weight="700" font-size="11" fill="#F8FAFC">NVMe</text>
          </g>
        </g>
      `;
    case 'phones-accessories':
      return `
        <g transform="translate(790, 115)">
          <!-- Smartphone -->
          <rect x="30" y="10" width="155" height="300" rx="22" fill="#0F172A" stroke="${accent}" stroke-width="3"/>
          <rect x="40" y="24" width="135" height="272" rx="14" fill="#1E293B"/>
          <rect x="82" y="32" width="50" height="10" rx="5" fill="#0F172A"/>
          <circle cx="107" cy="115" r="38" fill="${accent}" opacity="0.18" stroke="${accent}" stroke-width="2.5"/>
          <path d="M102 96L92 117H108L102 136L122 112H106L102 96Z" fill="${secondary}"/>
          <rect x="60" y="178" width="95" height="10" rx="4" fill="#F8FAFC" opacity="0.85"/>
          <rect x="72" y="198" width="70" height="8" rx="4" fill="#94A3B8" opacity="0.6"/>
          <!-- Power Bank & Fast Cable -->
          <rect x="205" y="95" width="115" height="215" rx="16" fill="#0F172A" stroke="#94A3B8" stroke-width="2.5"/>
          <rect x="225" y="120" width="75" height="36" rx="6" fill="#020617"/>
          <text x="237" y="144" font-family="Montserrat, sans-serif" font-weight="800" font-size="17" fill="${secondary}">100%</text>
          <text x="228" y="185" font-family="Montserrat, sans-serif" font-weight="700" font-size="11" fill="#E2E8F0">20,000mAh</text>
          <text x="234" y="204" font-family="Montserrat, sans-serif" font-weight="600" font-size="10" fill="${accent}">USB-C PD</text>
          <path d="M185 265 C 195 265, 195 265, 205 265" stroke="${secondary}" stroke-width="4"/>
        </g>
      `;
    case 'gadgets':
      return `
        <g transform="translate(770, 130)">
          <!-- Bluetooth Speaker Cylinder -->
          <rect x="20" y="75" width="210" height="110" rx="55" fill="#0F172A" stroke="${accent}" stroke-width="3"/>
          <circle cx="78" cy="130" r="34" fill="#1E293B" stroke="${secondary}" stroke-width="2.5"/>
          <circle cx="78" cy="130" r="14" fill="${accent}"/>
          <circle cx="168" cy="130" r="34" fill="#1E293B" stroke="${secondary}" stroke-width="2.5"/>
          <circle cx="168" cy="130" r="14" fill="${accent}"/>
          <!-- Smartwatch -->
          <rect x="255" y="25" width="70" height="210" rx="14" fill="#334155"/>
          <rect x="240" y="68" width="100" height="120" rx="22" fill="#0F172A" stroke="${secondary}" stroke-width="3"/>
          <circle cx="290" cy="128" r="34" stroke="${accent}" stroke-width="5" fill="none"/>
          <text x="273" y="134" font-family="Montserrat, sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">09:42</text>
        </g>
      `;
    case 'telecommunications':
      return `
        <g transform="translate(765, 125)">
          <!-- Wi-Fi Signal Arcs -->
          <path d="M110 95 A75 75 0 0 1 230 95" stroke="${accent}" stroke-width="5" stroke-linecap="round" fill="none"/>
          <path d="M130 118 A48 48 0 0 1 210 118" stroke="${secondary}" stroke-width="5" stroke-linecap="round" fill="none"/>
          <circle cx="170" cy="140" r="8" fill="#FFFFFF"/>
          <!-- High-Gain Dual-Band Router -->
          <line x1="65" y1="75" x2="65" y2="195" stroke="#E2E8F0" stroke-width="7" stroke-linecap="round"/>
          <line x1="170" y1="65" x2="170" y2="195" stroke="#E2E8F0" stroke-width="7" stroke-linecap="round"/>
          <line x1="275" y1="75" x2="275" y2="195" stroke="#E2E8F0" stroke-width="7" stroke-linecap="round"/>
          <rect x="35" y="185" width="270" height="68" rx="12" fill="#0F172A" stroke="${accent}" stroke-width="3"/>
          <circle cx="75" cy="219" r="6" fill="#10B981"/>
          <circle cx="100" cy="219" r="6" fill="#10B981"/>
          <circle cx="125" cy="219" r="6" fill="${accent}"/>
          <circle cx="150" cy="219" r="6" fill="${secondary}"/>
          <text x="190" y="224" font-family="Montserrat, sans-serif" font-weight="700" font-size="13" fill="#F8FAFC">5G / LTE</text>
        </g>
      `;
    case 'cac-arena':
      return `
        <g transform="translate(780, 110)">
          <!-- Certificate Document -->
          <rect x="35" y="15" width="245" height="310" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3"/>
          <rect x="52" y="34" width="211" height="272" rx="6" fill="#F8FAFC" stroke="#007A4D" stroke-width="2" stroke-dasharray="6 4"/>
          <circle cx="157" cy="78" r="24" fill="#007A4D"/>
          <path d="M147 78L154 85L169 70" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="157" y="124" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="800" font-size="13" fill="#0F172A">CERTIFICATE OF</text>
          <text x="157" y="142" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="800" font-size="13" fill="#007A4D">INCORPORATION</text>
          <rect x="82" y="162" width="150" height="8" rx="4" fill="#94A3B8"/>
          <rect x="97" y="180" width="120" height="8" rx="4" fill="#CBD5E1"/>
          <rect x="75" y="204" width="164" height="6" rx="3" fill="#E2E8F0"/>
          <!-- Gold Ribbon Seal & QR -->
          <circle cx="110" cy="256" r="22" fill="#F59E0B"/>
          <circle cx="110" cy="256" r="15" fill="#D97706"/>
          <rect x="178" y="234" width="44" height="44" rx="4" fill="#0F172A"/>
          <rect x="184" y="240" width="12" height="12" fill="#FFFFFF"/>
          <rect x="204" y="240" width="12" height="12" fill="#FFFFFF"/>
          <rect x="184" y="260" width="12" height="12" fill="#FFFFFF"/>
        </g>
      `;
    default:
      return `
        <g transform="translate(770, 120)">
          <!-- CMYK Swatch Cards & Brand Guidelines -->
          <rect x="25" y="30" width="195" height="250" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
          <rect x="42" y="48" width="161" height="115" rx="8" fill="#0B3C8C"/>
          <text x="62" y="114" font-family="Montserrat, sans-serif" font-weight="800" font-size="26" fill="#FFFFFF">Aa Bb</text>
          <rect x="42" y="180" width="48" height="48" rx="6" fill="#06B6D4"/>
          <rect x="98" y="180" width="48" height="48" rx="6" fill="#EC4899"/>
          <rect x="154" y="180" width="48" height="48" rx="6" fill="#F59E0B"/>
          <text x="42" y="252" font-family="Montserrat, sans-serif" font-weight="700" font-size="11" fill="#334155">CMYK 300 DPI • PRINT</text>
          <!-- Overlapping Executive Card -->
          <rect x="145" y="185" width="185" height="110" rx="10" fill="#0F172A" stroke="${accent}" stroke-width="2.5"/>
          <circle cx="182" cy="225" r="14" fill="${accent}"/>
          <rect x="208" y="216" width="95" height="8" rx="4" fill="#FFFFFF"/>
          <rect x="208" y="232" width="65" height="6" rx="3" fill="#94A3B8"/>
        </g>
      `;
  }
}

export function generateArticleIllustrationSvg(rawSlug: string): string {
  const cleanSlug = rawSlug.replace(/\.svg$/i, '');
  const isDiagram = cleanSlug.endsWith('-diagram');
  const baseSlug = isDiagram ? cleanSlug.replace(/-diagram$/, '') : cleanSlug;

  const matchedArticle = ALL_SEED_ARTICLES.find((a) => a.slug === baseSlug);
  const categorySlug = matchedArticle?.categorySlug || 'computers';
  const title =
    matchedArticle?.title ||
    baseSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const theme = CATEGORY_THEMES[categorySlug] || CATEGORY_THEMES.computers;
  const hash = hashSlug(cleanSlug);

  if (isDiagram) {
    const lines = wrapTitleLines(title, 46);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 540" width="1200" height="540" fill="none">
  <rect width="1200" height="540" rx="12" fill="#F8FAFC"/>
  <rect x="16" y="16" width="1168" height="508" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Top Header Strip -->
  <rect x="16" y="16" width="1168" height="68" rx="10" fill="${theme.bgEnd}"/>
  <text x="48" y="56" font-family="Montserrat, sans-serif" font-weight="700" font-size="15" letter-spacing="1.8" fill="#FFFFFF">LAYITEK TECHNICAL ARCHITECTURE DIAGRAM • ${escapeXml(theme.label)}</text>
  <text x="1148" y="56" text-anchor="end" font-family="Montserrat, sans-serif" font-weight="600" font-size="13" fill="${theme.accent}">REF #${(hash % 900) + 100}</text>

  <!-- Title -->
  <text x="48" y="128" font-family="Montserrat, sans-serif" font-weight="700" font-size="21" fill="#0F172A">${escapeXml(lines[0] || title)}</text>

  <!-- 4 Process Nodes -->
  <g transform="translate(48, 170)">
    <rect x="0" y="0" width="248" height="230" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="20" y="20" width="44" height="28" rx="6" fill="${theme.bgEnd}"/>
    <text x="42" y="39" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="700" font-size="13" fill="#FFFFFF">01</text>
    <text x="20" y="82" font-family="Montserrat, sans-serif" font-weight="700" font-size="16" fill="#0F172A">Assessment &amp; Audit</text>
    <text x="20" y="114" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">Baseline diagnostics,</text>
    <text x="20" y="134" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">specification verification,</text>
    <text x="20" y="154" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">and risk identification.</text>
    <rect x="20" y="185" width="208" height="8" rx="4" fill="${theme.accent}"/>

    <path d="M256 115H282" stroke="${theme.bgEnd}" stroke-width="3" stroke-dasharray="4 4"/>

    <rect x="290" y="0" width="248" height="230" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="310" y="20" width="44" height="28" rx="6" fill="${theme.bgEnd}"/>
    <text x="332" y="39" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="700" font-size="13" fill="#FFFFFF">02</text>
    <text x="310" y="82" font-family="Montserrat, sans-serif" font-weight="700" font-size="16" fill="#0F172A">Configuration</text>
    <text x="310" y="114" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">Applying Nigerian operating</text>
    <text x="310" y="134" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">standards, power/compliance</text>
    <text x="310" y="154" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">safeguards &amp; calibration.</text>
    <rect x="310" y="185" width="208" height="8" rx="4" fill="${theme.secondary}"/>

    <path d="M546 115H572" stroke="${theme.bgEnd}" stroke-width="3" stroke-dasharray="4 4"/>

    <rect x="580" y="0" width="248" height="230" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="600" y="20" width="44" height="28" rx="6" fill="${theme.bgEnd}"/>
    <text x="622" y="39" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="700" font-size="13" fill="#FFFFFF">03</text>
    <text x="600" y="82" font-family="Montserrat, sans-serif" font-weight="700" font-size="16" fill="#0F172A">Implementation</text>
    <text x="600" y="114" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">Structured execution,</text>
    <text x="600" y="134" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">quality assurance testing,</text>
    <text x="600" y="154" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">and documentation.</text>
    <rect x="600" y="185" width="208" height="8" rx="4" fill="${theme.accent}"/>

    <path d="M836 115H862" stroke="${theme.bgEnd}" stroke-width="3" stroke-dasharray="4 4"/>

    <rect x="870" y="0" width="234" height="230" rx="10" fill="#F8FAFC" stroke="${theme.bgEnd}" stroke-width="2.5"/>
    <rect x="890" y="20" width="44" height="28" rx="6" fill="#007A4D"/>
    <text x="912" y="39" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="700" font-size="13" fill="#FFFFFF">04</text>
    <text x="890" y="82" font-family="Montserrat, sans-serif" font-weight="700" font-size="16" fill="#0F172A">Long-Term Reliability</text>
    <text x="890" y="114" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">Sustained performance,</text>
    <text x="890" y="134" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">compliance verification &amp;</text>
    <text x="890" y="154" font-family="Montserrat, sans-serif" font-weight="500" font-size="13" fill="#475569">routine preventive care.</text>
    <rect x="890" y="185" width="194" height="8" rx="4" fill="#10B981"/>
  </g>

  <text x="48" y="485" font-family="Montserrat, sans-serif" font-weight="600" font-size="12" fill="#64748B">© Layitek Limited • Practical Knowledge. Smarter Technology. Better Business.</text>
</svg>`;
  }

  const titleLines = wrapTitleLines(title, 30);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bgStart}" />
      <stop offset="100%" stop-color="${theme.bgEnd}" />
    </linearGradient>
    <pattern id="gridPattern" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.06" />
    </pattern>
  </defs>

  <rect width="1200" height="675" fill="url(#bgGrad)" />
  <rect width="1200" height="675" fill="url(#gridPattern)" />

  <!-- Subtle Geometric Glow -->
  <circle cx="${920 + (hash % 80)}" cy="${220 + (hash % 60)}" r="260" fill="${theme.accent}" opacity="0.12" />
  <circle cx="140" cy="580" r="190" fill="${theme.secondary}" opacity="0.1" />

  <!-- Top Editorial Kicker -->
  <rect x="72" y="72" width="10" height="28" rx="3" fill="${theme.secondary}" />
  <text x="96" y="92" font-family="Montserrat, -apple-system, sans-serif" font-weight="700" font-size="15" letter-spacing="2.5" fill="${theme.accent}">${escapeXml(theme.label)}</text>

  <!-- Main Article Headline -->
  <g transform="translate(72, 175)">
    ${titleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${idx * 58}" font-family="Montserrat, -apple-system, sans-serif" font-weight="800" font-size="42" fill="#FFFFFF">${escapeXml(line)}</text>`
      )
      .join('\n    ')}
  </g>

  <!-- Accent Divider -->
  <rect x="72" y="395" width="120" height="5" rx="2.5" fill="${theme.accent}" />

  <!-- Bottom Brand Footer inside Card -->
  <g transform="translate(72, 555)">
    <rect x="0" y="0" width="38" height="38" rx="8" fill="#FFFFFF" />
    <path d="M12 10V27H27" stroke="#0B3C8C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="27" cy="12" r="3" fill="#F59E0B" />
    <text x="52" y="19" font-family="Montserrat, -apple-system, sans-serif" font-weight="800" font-size="16" fill="#FFFFFF">LAYITEK BLOG</text>
    <text x="52" y="35" font-family="Montserrat, -apple-system, sans-serif" font-weight="500" font-size="12" letter-spacing="1.2" fill="#CBD5E1">LAYITEK LIMITED • PRACTICAL GUIDES</text>
  </g>

  <!-- Category Specific Vector Illustration -->
  ${getCategoryArtworkVector(categorySlug, hash, theme.accent, theme.secondary)}
</svg>`;
}
