export interface SeedCategory {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  iconName: string;
  accentColor: string;
  displayOrder: number;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: 'Computers',
    slug: 'computers',
    shortDescription: 'Desktops, laptops, hardware upgrades, Windows maintenance & cybersecurity.',
    description:
      'Comprehensive guides on desktop and laptop computers, buying advice for Nigerian professionals and students, SSD and RAM upgrades, Windows operating system optimisation, power protection, data backup, and troubleshooting common hardware or software problems.',
    iconName: 'Monitor',
    accentColor: '#0B3C8C',
    displayOrder: 1,
  },
  {
    name: 'Phones & Accessories',
    slug: 'phones-accessories',
    shortDescription: 'Smartphones, power banks, fast chargers, audio gear & mobile security.',
    description:
      'Practical insights on Android smartphones and iPhones, mobile phone buying guides, battery health preservation, choosing reliable power banks, original chargers and cables, Bluetooth audio accessories, mobile banking security, and maintenance advice.',
    iconName: 'Smartphone',
    accentColor: '#0369A1',
    displayOrder: 2,
  },
  {
    name: 'Gadgets',
    slug: 'gadgets',
    shortDescription: 'Smartwatches, Bluetooth speakers, smart TVs, home electronics & reviews.',
    description:
      'In-depth reviews, comparisons, and buying guides for Bluetooth speakers, smartwatches, smart home devices, portable rechargeable electronics, Smart TVs, wearable technology, and productivity gadgets tailored to everyday Nigerian living and business.',
    iconName: 'Cpu',
    accentColor: '#0F766E',
    displayOrder: 3,
  },
  {
    name: 'Telecommunications',
    slug: 'telecommunications',
    shortDescription: 'SIM registration, MTN/Airtel/Glo/9mobile networks, routers, MiFi & broadband.',
    description:
      'Authoritative updates and practical guides on SIM registration and replacement, NIN linkage, MTN, Airtel, Glo and 9mobile data plans, 4G/5G routers, MiFi devices, Smartboxes, wireless networking, internet speed optimisation, and NCC telecom regulations in Nigeria.',
    iconName: 'Wifi',
    accentColor: '#1D4ED8',
    displayOrder: 4,
  },
  {
    name: 'CAC Arena',
    slug: 'cac-arena',
    shortDescription: 'Business Name, Limited Company & NGO registration, annual returns & compliance.',
    description:
      'Practical educational guides covering Corporate Affairs Commission (CAC) registration and compliance in Nigeria under CAMA 2020: Business Name registration, Limited Liability Companies, Incorporated Trustees (NGOs), annual returns filing, status reports, and post-incorporation changes.',
    iconName: 'Briefcase',
    accentColor: '#007A4D',
    displayOrder: 5,
  },
  {
    name: 'Branding & Printing',
    slug: 'branding-printing',
    shortDescription: 'Corporate identity, logos, business cards, company profiles & print production.',
    description:
      'Expert advice on brand identity design, business naming, logo systems, executive business cards, flyers, brochures, company profiles, large-format printing, product packaging design, and maintaining consistent corporate branding across physical and digital touchpoints.',
    iconName: 'Palette',
    accentColor: '#B45309',
    displayOrder: 6,
  },
];

export const DEFAULT_SITE_SETTINGS = {
  branding: {
    siteName: 'Layitek Blog',
    parentCompany: 'Layitek Limited',
    domain: 'layitek.com',
    logoUrl: '/assets/aistudio/LAYITEK_LOGO_FOR_BLOG2_197cbf30.png',
    faviconUrl: '/api/media/favicon.svg',
    primaryColor: '#0B3C8C',
    secondaryColor: '#007A4D',
    accentColor: '#D97706',
  },
  homepage: {
    heroHeadline: 'Practical Knowledge. Smarter Technology. Better Business.',
    heroDescription:
      'Your trusted source for practical technology guides, gadget reviews, telecommunications updates, business registration information and professional branding insights.',
    heroSearchPlaceholder: 'Search articles, guides and tutorials...',
    heroCtaText: 'Explore Articles',
    introTitle: 'Technology & Business Intelligence for Modern Nigeria',
    introDescription:
      'Published by Layitek Limited, our editorial desk translates complex hardware specifications, telecommunications policies, Corporate Affairs Commission (CAC) procedures, and corporate print standards into actionable guides.',
    promoTitle: 'Partner with Layitek Limited for Technology, CAC & Branding Solutions',
    promoDescription:
      'From enterprise IT procurement and networking hardware to seamless CAC business registration and high-impact corporate printing, Layitek Limited delivers dependable execution across Nigeria.',
    promoButtonText: 'Contact Layitek Limited',
    promoButtonUrl: 'https://layitek.com/contact',
  },
  contact: {
    companyEmail: 'info@layitek.com',
    phoneNumber: '+234 803 000 0000',
    whatsappNumber: '+234 803 000 0000',
    officeAddress: 'Lagos, Nigeria',
    aboutUrl: 'https://layitek.com/about',
    contactUrl: 'https://layitek.com/contact',
    socialLinks: {
      facebook: 'https://facebook.com/layitek',
      twitter: 'https://x.com/layitek',
      linkedin: 'https://linkedin.com/company/layitek',
      instagram: 'https://instagram.com/layitek',
      youtube: 'https://youtube.com/@layitek',
    },
  },
  footer: {
    footerDescription:
      'Layitek Blog is the official knowledge and advisory publication of Layitek Limited, a Nigerian technology and business services company specialising in computing hardware, mobile accessories, telecommunications, CAC compliance support, and corporate branding.',
    copyrightText: `© ${new Date().getFullYear()} Layitek Limited. All Rights Reserved.`,
    quickLinks: [
      { label: 'Home', url: '/' },
      { label: 'About Layitek', url: 'https://layitek.com/about', external: true },
      { label: 'Contact Us', url: 'https://layitek.com/contact', external: true },
      { label: 'XML Sitemap', url: '/sitemap.xml', external: true },
    ],
  },
  seo: {
    metaTitle: 'Layitek Blog – Practical Technology, CAC Business Guides & Branding in Nigeria',
    metaDescription:
      'Your trusted source by Layitek Limited for practical technology guides, laptop & phone buying advice, telecom updates, CAC business registration information, and professional branding insights.',
    ogImage: '/api/media/illustration/layitek-og-cover.svg',
    allowIndexing: true,
  },
};
