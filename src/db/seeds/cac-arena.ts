import { compileBlueprintToArticle, SeedArticleInput } from './computers.ts';

const CAC_DISCLAIMER =
  'This article is published by Layitek Limited for general educational and business guidance reflecting the Companies and Allied Matters Act (CAMA) 2020 and Corporate Affairs Commission (CAC) Company Registration Portal (CRP) procedures verified as of November 2026. It does not constitute formal legal representation. Because official filing fees, statutory timelines, and administrative guidelines may be updated periodically by the Commission, readers are advised to verify current schedules on the official CAC website (cac.gov.ng) or consult an accredited CAC agent / legal practitioner.';

const CAC_BLUEPRINTS = [
  {
    title: 'How to Register a Business Name in Nigeria: Complete Step-by-Step CAC Guide',
    slug: 'how-to-register-a-business-name-in-nigeria',
    excerpt:
      'A practical walkthrough of registering a Sole Proprietorship or Partnership Business Name on the CAC Company Registration Portal (CRP) under CAMA 2020.',
    seoTitle: 'How to Register a Business Name in Nigeria (CAC Guide) | Layitek Blog',
    seoDescription:
      'Step-by-step guide to registering a Business Name with the Corporate Affairs Commission (CAC) in Nigeria. Name reservation, documents, and BN certificate.',
    featuredImageAlt: 'Nigerian entrepreneur reviewing a CAC Business Name Registration Certificate and Official Status Report',
    diagramCaption: 'Fig 41. Four-stage CAC Business Name registration workflow on the Company Registration Portal (post.cac.gov.ng / pre.cac.gov.ng).',
    isFeatured: true,
    isPopular: true,
    viewsCount: 2680,
    readingTimeMinutes: 9,
    publishedAt: '2026-09-12T11:00:00Z',
    introParagraphs: [
      'Operating an unregistered business in Nigeria limits your growth: corporate clients cannot pay into a personal savings account, commercial banks will not open a corporate current account in your trade name, and another entrepreneur could legally register your trade name ahead of you.',
      'Registering a Business Name (Part E of the Companies and Allied Matters Act, CAMA 2020) is the most accessible and affordable way for sole proprietors, freelancers, retail traders, and professional partnerships to formalize their enterprise with the Corporate Affairs Commission (CAC).',
    ],
    sections: [
      {
        id: 'when-a-business-name-is-appropriate',
        heading: '1. Who Should Register a Business Name (Ventures / Enterprises)?',
        paragraphs: [
          'A Business Name registration is designed for Sole Proprietors (one owner) or Partnerships (two to twenty partners) trading under a name other than their true surname and initials. Note that unlike a Limited Liability Company (LTD), a Business Name does not create a separate legal personality distinct from its proprietor—meaning the owner remains personally responsible for business obligations.',
        ],
      },
      {
        id: 'step-by-step-cac-portal-registration',
        heading: '2. Step-by-Step Procedure on the CAC Company Registration Portal (CRP)',
        paragraphs: [
          'All CAC registrations are conducted online via the official Company Registration Portal (`pre.cac.gov.ng`) either directly by the proprietor or through an accredited CAC agent (Lawyer, Chartered Secretary, Chartered Accountant, or accredited firm):',
        ],
        bullets: [
          'Step 1 — Name Availability Search & Reservation: Propose two distinct business names (e.g., "Apex Horizon Ventures" and "Apex Horizon Enterprises"). If approved, CAC issues an Availability Code valid for 60 days.',
          'Step 2 — Complete Business Name Application Form: Enter the approved Availability Code, nature of business (specific categories), principal place of business address, commencement date, and full proprietor particulars (NIN, date of birth, residential address, email, and phone number).',
          'Step 3 — Document Uploads: Upload clear JPEG/PNG copies of the proprietor’s valid means of identification (NIN slip, International Passport, Driver’s Licence, or Voter’s Card), passport photograph, and signature specimen on plain white paper.',
          'Step 4 — Remita Statutory Filing Payment & Approval: Pay the statutory CAC registration fee via Remita. Once approved, download your digital Certificate of Registration and Certified Extract (Status Report) bearing the verifiable QR code.',
        ],
      },
    ],
    practicalChecklistTitle: 'Pre-Application Document Checklist for Business Name',
    practicalChecklistSteps: [
      'Prepare two unique proposed business names (avoid generic or restricted words like "National", "Federal", "Group", or "Bank" without prior consent).',
      'Ensure the surname, first name, and date of birth on your NIN slip match your application form character-for-character.',
      'Sign clearly with a blue or black pen on plain white unlined paper and photograph it evenly for upload.',
      'Download and store multiple backup copies of your Certificate and Status Report immediately upon approval (the free download window on the portal is time-limited after issuance).',
    ],
    relatedSlugs: [
      { title: 'Business Name vs Limited Liability Company (LTD) in Nigeria: Which Should You Register?', url: '/cac-arena/business-name-vs-limited-liability-company' },
      { title: 'How to Register a Private Limited Liability Company (LTD) in Nigeria Under CAMA 2020', url: '/cac-arena/how-to-register-limited-liability-company-nigeria' },
    ],
    conclusionParagraphs: [
      'Formalising your enterprise with a CAC Business Name registration unlocks corporate banking, builds customer trust, and lays a compliant foundation for future growth.',
    ],
    faqs: [
      {
        question: 'Can I open a Nigerian corporate bank account with a CAC Business Name certificate?',
        answer: 'Yes. With your CAC Certificate of Registration, Status Report (Application for Registration extract), Tax Identification Number (TIN), valid ID, and utility bill, Nigerian commercial banks and fintech business platforms will open a corporate account in your registered Business Name.',
      },
      {
        question: 'Can I upgrade my Business Name to a Limited Liability Company (LTD) later?',
        answer: 'Yes! CAC provides a formal "Upgrade of Business Name to Limited Company" procedure on the portal, allowing you to transition to LTD while retaining your established brand identity.',
      },
      {
        question: 'Do Business Names need to file CAC Annual Returns?',
        answer: 'Yes. Under CAMA 2020, every registered Business Name must file its Annual Returns with the CAC not later than 30th June each year (except in the calendar year it was first registered) to keep its status "ACTIVE".',
      },
    ],
  },
  {
    title: 'How to Register a Private Limited Liability Company (LTD) in Nigeria Under CAMA 2020',
    slug: 'how-to-register-limited-liability-company-nigeria',
    excerpt:
      'Understand share capital minimums, single-director/shareholder provisions under CAMA 2020, FIRS Stamp Duty integration, and requirements for incorporating a Limited Company.',
    seoTitle: 'How to Register a Limited Liability Company (LTD) in Nigeria | Layitek Blog',
    seoDescription:
      'Complete guide to incorporating a Private Company Limited by Shares (LTD) with the CAC in Nigeria. Requirements for directors, shareholders, PSC, and MEMART.',
    featuredImageAlt: 'Certificate of Incorporation and Memorandum and Articles of Association (MEMART) for a Nigerian Limited Company',
    diagramCaption: 'Fig 42. End-to-end Private Company Limited by Shares (LTD) incorporation pipeline including electronic FIRS stamp duty assessment.',
    isFeatured: false,
    isPopular: true,
    viewsCount: 2120,
    readingTimeMinutes: 9,
    publishedAt: '2026-09-14T09:30:00Z',
    introParagraphs: [
      'For growth-oriented startups, technology firms, construction contractors, consulting agencies, and import/export businesses, incorporating a Private Company Limited by Shares (`LTD`) is the gold standard in Nigeria.',
      'Unlike a Business Name, an incorporated Limited Company is a separate legal entity in law: it can own property, enter contracts, sue and be sued in its corporate name, raise equity investment from shareholders, and shield its owners’ personal assets through limited liability.',
    ],
    sections: [
      {
        id: 'key-cama-2020-provisions-for-small-companies',
        heading: '1. Key CAMA 2020 Innovations: Single-Member Companies and Minimum Share Capital',
        paragraphs: [
          'The Companies and Allied Matters Act (CAMA) 2020 modernised company incorporation in Nigeria significantly:',
        ],
        bullets: [
          'Single Shareholder & Single Director Allowed: Under Section 18(2) and Section 271(1) of CAMA 2020, a small private company can now be incorporated by a single person acting as the sole shareholder and sole director (though many founders still include two directors/shareholders for banking continuity).',
          'Minimum Issued Share Capital: The standard baseline minimum issued share capital for a general private company (LTD) is ₦100,000, though specialized regulated sectors (such as aviation, travel agencies, insurance, fintech/CBN-licensed entities, or companies with foreign participation) have higher sector-specific minimum share capital thresholds.',
          'Company Secretary: Optional for small companies (as defined by CAMA 2020), though mandatory for public companies and beneficial for structured corporate governance.',
        ],
      },
      {
        id: 'required-particulars-and-documents',
        heading: '2. Information Required to Incorporate an LTD Company',
        paragraphs: [
          'Before starting the incorporation on the CAC portal, assemble the following details for all Directors, Shareholders, and Persons with Significant Control (PSC—anyone holding 5% or more of shares/voting rights):',
        ],
        bullets: [
          'Two proposed company names ending in "Limited" or "Ltd".',
          'Registered office address in Nigeria, company email address, and phone number.',
          'Specific Objects of the Company (forming part of the electronic Memorandum and Articles of Association - MEMART).',
          'Full details, NIN/valid ID, signature specimen, email, and residential address for every Director, Shareholder (Subscriber), and Witness.',
          'Percentage share allotment among subscribers.',
        ],
      },
    ],
    practicalChecklistTitle: 'Step-by-Step LTD Incorporation Workflow',
    practicalChecklistSteps: [
      'Conduct a Name Availability Search and secure your 60-day Name Reservation Approval Code.',
      'Complete the Pre-Incorporation forms on the CAC portal, including Director details, PSC disclosure, Statement of Issued Share Capital, and Objects of the Memorandum.',
      'Pay both the CAC Filing Fee (via Remita) and the statutory FIRS Electronic Stamp Duty on the share capital and MEMART.',
      'Upon approval, download the Certificate of Incorporation (containing the RC Number and TIN), Status Report, and e-stamped MEMART immediately.',
    ],
    relatedSlugs: [
      { title: 'Business Name vs Limited Liability Company (LTD) in Nigeria: Which Should You Register?', url: '/cac-arena/business-name-vs-limited-liability-company' },
      { title: 'Post-Registration Compliance Checklist: TIN, Corporate Bank Account, and SCUML', url: '/cac-arena/post-registration-compliance-tin-scuml-guide' },
    ],
    conclusionParagraphs: [
      'Incorporating a Private Limited Liability Company establishes immediate institutional credibility with government ministries, multinational clients, and investors.',
    ],
    faqs: [
      {
        question: 'Does a new Limited Company Certificate come with a Tax Identification Number (TIN)?',
        answer: 'Yes. Through the integration between CAC and FIRS/JTB, newly incorporated Limited Liability Companies automatically have their Tax Identification Number (TIN) generated and printed at the bottom of the Certificate of Incorporation.',
      },
      {
        question: 'Can a minor (under 18 years old) be a Director or Shareholder in a Nigerian LTD company?',
        answer: 'A person under 18 years of age cannot be appointed a Director of a company in Nigeria. However, a minor can be a Shareholder provided there are at least two other adult subscribers/shareholders of full capacity.',
      },
    ],
  },
  {
    title: 'Registering an NGO, Church, Foundation, or Association (Incorporated Trustees) with CAC',
    slug: 'how-to-register-ngo-incorporated-trustees-nigeria',
    excerpt:
      'Requirements for registering Incorporated Trustees under Part F of CAMA 2020: minimum trustees, newspaper publications, constitution clauses, and minutes.',
    seoTitle: 'How to Register an NGO, Church or Foundation with CAC Nigeria | Layitek Blog',
    seoDescription:
      'Learn how to register an NGO, foundation, church, mosque, alumni, or club as Incorporated Trustees (IT) with the CAC in Nigeria.',
    featuredImageAlt: 'Board of Trustees reviewing an Incorporated Trustees Constitution and newspaper publication notice',
    diagramCaption: 'Fig 43. Statutory Incorporated Trustees (Part F) registration sequence including the mandatory 28-day national newspaper objection window.',
    isFeatured: false,
    isPopular: false,
    viewsCount: 1180,
    readingTimeMinutes: 8,
    publishedAt: '2026-09-16T10:30:00Z',
    introParagraphs: [
      'Non-Governmental Organisations (NGOs), charitable foundations, religious bodies (churches and mosques), community development associations, alumni bodies, and social clubs are registered under Part F of CAMA 2020 as **Incorporated Trustees (IT)**.',
      'Because Incorporated Trustees are non-profit entities that do not distribute dividends to members, their registration procedure involves public notice requirements distinct from commercial companies.',
    ],
    sections: [
      {
        id: 'trustees-aims-and-newspaper-publication',
        heading: '1. Minimum Trustees, Aims & Objectives, and the 28-Day Newspaper Notice',
        paragraphs: [
          'An Incorporated Trustees application requires a minimum of two (2) duly appointed Trustees (many organisations appoint between 3 and 7 Trustees for balanced governance) plus a Chairman and Secretary.',
          'Crucially, once the proposed name (e.g., "Hope Builders Educational Foundation") is reserved by CAC, the applicant must publish a statutory Public Notice in at least two (2) daily newspapers (one national daily and one circulating in the locality where the organisation is based) inviting any legal objections within 28 days.',
        ],
      },
      {
        id: 'mandatory-documents-for-incorporated-trustees',
        heading: '2. Mandatory Supporting Documents for Part F Registration',
        paragraphs: [
          'Alongside the newspaper publications, the portal submission requires:',
        ],
        bullets: [
          'The Organisation’s Constitution (including the Special Clause stating that income and property are applied solely toward the promotion of its objects and not paid as dividends to members).',
          'Extract of Minutes of the General Meeting where the Trustees were appointed and the Special Clause was adopted, signed by the Chairman and Secretary.',
          'Valid ID (NIN, Passport, Voter’s Card, or Driver’s Licence), passport photograph, residential address, and signature of every Trustee and the Secretary.',
          'Trustee Declaration Forms / Sworn Affidavits confirming no Trustee is disqualified under CAMA 2020.',
        ],
      },
    ],
    practicalChecklistTitle: 'Incorporated Trustees Preparation Steps',
    practicalChecklistSteps: [
      'Ensure the proposed name clearly reflects the non-profit nature (e.g., "Foundation", "Initiative", "Association", "Ministry") without conflicting with existing entities.',
      'Verify that the exact approved name and full names of all Trustees in the newspaper publication match the portal entry letter-for-letter.',
      'Wait for the statutory 28-day newspaper publication period before final portal submission where required.',
      'Register with SCUML (EFCC) after receiving your IT certificate before opening your NGO bank account.',
    ],
    relatedSlugs: [
      { title: 'Post-Registration Compliance Checklist: TIN, Corporate Bank Account, and SCUML', url: '/cac-arena/post-registration-compliance-tin-scuml-guide' },
      { title: 'Filing CAC Annual Returns in Nigeria: Deadlines, Penalties, and Keeping Active Status', url: '/cac-arena/filing-cac-annual-returns-guide' },
    ],
    conclusionParagraphs: [
      'Proper registration as Incorporated Trustees gives your NGO, foundation, or association legal standing to receive local and international grants, open official bank accounts, and hold property in trust.',
    ],
    faqs: [
      {
        question: 'Can a single person register an NGO or Foundation alone without other Trustees?',
        answer: 'No. Under CAMA 2020, Incorporated Trustees require a minimum of two (2) Trustees.',
      },
      {
        question: 'Why did CAC query our newspaper publication during NGO registration?',
        answer: 'The most common cause of newspaper publication queries is a discrepancy between the Trustee names or organisation name printed in the newspaper and the names typed on the CAC portal.',
      },
    ],
  },
  {
    title: 'Business Name vs Limited Liability Company (LTD) in Nigeria: Which Should You Register?',
    slug: 'business-name-vs-limited-liability-company',
    excerpt:
      'Compare liability protection, equity fundraising, contract bidding eligibility, tax structure, and registration cost between a Business Name and an LTD company.',
    seoTitle: 'Business Name vs Limited Company (LTD) in Nigeria | Layitek Blog',
    seoDescription:
      'Should you register a Business Name (Enterprise/Ventures) or a Limited Liability Company (LTD) in Nigeria? Compare costs, liability, and contract eligibility.',
    featuredImageAlt: 'Comparison table weighing Business Name registration against Private Limited Liability Company incorporation in Nigeria',
    diagramCaption: 'Fig 44. Strategic comparison matrix: legal personality, personal asset protection, investor readiness, and procurement eligibility.',
    isFeatured: false,
    isPopular: true,
    viewsCount: 1740,
    readingTimeMinutes: 7,
    publishedAt: '2026-09-18T09:00:00Z',
    introParagraphs: [
      'One of the first strategic decisions every Nigerian founder faces is whether to start with a Business Name (`BN`) or incorporate a Private Company Limited by Shares (`RC / LTD`).',
      'Choosing the wrong structure can force you to re-register months later when bidding for a corporate contract or pitching to an investor. Here is how to make the right choice on day one.',
    ],
    sections: [
      {
        id: 'legal-personality-and-liability-shield',
        heading: '1. Separate Legal Personality and Personal Asset Protection',
        paragraphs: [
          'In a Business Name, you and the business are legally one and the same person. If the business incurs a commercial debt or lawsuit, your personal car or savings can be attached. In a Limited Liability Company (LTD), the company is a separate legal person; a shareholder’s liability is strictly limited to any unpaid amount on their shares.',
        ],
      },
      {
        id: 'contract-bidding-and-investor-equity',
        heading: '2. Corporate Procurement Tenders, Investors, and Continuity',
        paragraphs: [
          'Government ministries, oil and gas companies, telecoms, and commercial banks require vendors bidding on formal tenders to be incorporated Limited Liability Companies (`LTD`) with a Memorandum and Articles of Association (MEMART) and share capital. Similarly, angel investors and venture capital funds can only buy equity shares in an LTD company—never in a Business Name.',
        ],
      },
    ],
    practicalChecklistTitle: 'Quick Decision Guide',
    practicalChecklistSteps: [
      'Choose a Business Name if you are a solo artisan, small neighborhood retailer, or freelance service provider looking for the lowest initial registration cost to open a business bank account.',
      'Choose a Limited Liability Company (LTD) if you plan to bid for corporate/government contracts, bring in co-founders or investors, build a scalable tech or manufacturing brand, or protect your personal assets.',
      'Remember that under Nigerian Finance Act provisions, small companies with gross annual turnover below the statutory small-company threshold enjoy 0% Companies Income Tax (subject to timely tax filing compliance).',
    ],
    relatedSlugs: [
      { title: 'How to Register a Business Name in Nigeria: Complete Step-by-Step CAC Guide', url: '/cac-arena/how-to-register-a-business-name-in-nigeria' },
      { title: 'How to Upgrade a CAC Business Name to a Limited Liability Company (LTD)', url: '/cac-arena/upgrading-business-name-to-limited-company' },
    ],
    conclusionParagraphs: [
      'If your budget permits and your ambition includes corporate clients or co-founders, incorporating directly as an LTD company saves you the cost of upgrading later.',
    ],
    faqs: [
      {
        question: 'Can a Business Name use "Limited" or "Ltd" at the end of its name?',
        answer: 'No. Only companies duly incorporated with share capital (or limited by guarantee) are legally permitted to use "Limited" or "Ltd".',
      },
      {
        question: 'What do BN, RC, and IT prefixes on CAC certificates mean?',
        answer: 'BN stands for Business Name; RC stands for Registered Company (Limited Liability Company); IT stands for Incorporated Trustees (NGOs, churches, associations).',
      },
    ],
  },
  {
    title: 'Filing CAC Annual Returns in Nigeria: Deadlines, Penalties, and Keeping Active Status',
    slug: 'filing-cac-annual-returns-guide',
    excerpt:
      'Why registered companies and business names turn "INACTIVE" on the CAC public search portal—and how to file annual returns to avoid delisting.',
    seoTitle: 'How to File CAC Annual Returns in Nigeria & Restore Active Status | Layitek Blog',
    seoDescription:
      'Understand CAC Annual Returns filing in Nigeria for Business Names, Limited Companies, and NGOs. Avoid default penalties and delisting.',
    featuredImageAlt: 'CAC public search screen showing ACTIVE compliance status after up-to-date Annual Returns filing',
    diagramCaption: 'Fig 45. Statutory Annual Returns calendar windows for Business Names, Companies (LTD/PLC), and Incorporated Trustees.',
    isFeatured: false,
    isPopular: false,
    viewsCount: 1320,
    readingTimeMinutes: 7,
    publishedAt: '2026-09-20T09:00:00Z',
    introParagraphs: [
      'Many Nigerian business owners mistakenly believe that once they collect their CAC Certificate of Registration or Incorporation, they never have to interact with the Corporate Affairs Commission again. Years later, when applying for a bank loan, visa, or contract tender, a due-diligence search on `search.cac.gov.ng` shows their company marked **"INACTIVE"**.',
      'CAC Annual Returns are NOT tax payments—they are mandatory yearly statutory filings confirming that your business is still a going concern and keeping your public record active.',
    ],
    sections: [
      {
        id: 'annual-returns-vs-firs-tax-returns',
        heading: '1. CAC Annual Returns vs FIRS Tax Returns: Understanding the Difference',
        paragraphs: [
          'Even if your company made zero revenue or has not yet commenced active trading, you must still file CAC Annual Returns with the Corporate Affairs Commission. CAC Annual Returns inform the Commission of your current directors, shareholders, registered address, and financial statement summary (or statement of affairs for companies yet to commence business).',
        ],
      },
      {
        id: 'statutory-filing-windows-and-consequences',
        heading: '2. Statutory Filing Deadlines Across Entity Types',
        paragraphs: [
          'Under CAMA 2020, the filing windows are:',
        ],
        bullets: [
          'Business Names (BN): Not later than 30th June every year (except the calendar year of registration).',
          'Limited Liability Companies (RC): Yearly, within 42 days after the Annual General Meeting (newly incorporated companies enjoy an initial 18-month window before their first Annual Return is due).',
          'Incorporated Trustees (IT / NGOs): Between 30th June and 31st December every year (after the first year of registration).',
        ],
      },
    ],
    practicalChecklistTitle: 'How to Restore an "INACTIVE" Company to "ACTIVE" Status',
    practicalChecklistSteps: [
      'Search your exact Business Name or RC Number on `search.cac.gov.ng` to inspect your current status.',
      'Calculate all outstanding backlog years since incorporation (after the initial 18-month grace period for companies or first calendar year for Business Names).',
      'Prepare Audited Financial Statements (or a Statement of Affairs if the company has not yet traded) for each backlog year if filing for a Limited Company.',
      'File all outstanding years sequentially on the CAC Post-Incorporation portal and pay the statutory filing fees plus any applicable late-filing penalties.',
    ],
    relatedSlugs: [
      { title: 'Understanding the CAC Status Report (E-Status Report) and How to Obtain a Fresh Copy', url: '/cac-arena/understanding-cac-status-report-guide' },
      { title: 'Post-Incorporation Changes on CAC: Adding/Removing Directors, Address, and Share Capital', url: '/cac-arena/post-incorporation-changes-directors-address-shares' },
    ],
    conclusionParagraphs: [
      'Filing CAC Annual Returns on time every year costs a fraction of clearing multi-year late penalties and prevents your company from being struck off the register of companies.',
    ],
    faqs: [
      {
        question: 'Can CAC Process any change of director or share capital if Annual Returns are owed?',
        answer: 'No. Up-to-date Annual Returns filing is a strict prerequisite before CAC allows any Post-Incorporation application (such as changing directors, altering share capital, or requesting a certified Status Report).',
      },
      {
        question: 'Can CAC strike off a company that fails to file Annual Returns for years?',
        answer: 'Yes. Under CAMA 2020, persistent failure to file Annual Returns empowers the Commission to publish a notice and eventually strike the defunct company off the register.',
      },
    ],
  },
  {
    title: 'Post-Incorporation Changes on CAC: Adding/Removing Directors, Address, and Share Capital',
    slug: 'post-incorporation-changes-directors-address-shares',
    excerpt:
      'How to legally update your company records with the CAC when appointing or removing a director, relocating your office address, or increasing share capital.',
    seoTitle: 'CAC Post-Incorporation Changes Guide (Directors, Address, Shares) | Layitek Blog',
    seoDescription:
      'Learn how to file CAC post-incorporation changes in Nigeria: change of directors, change of registered office address, and share allotment.',
    featuredImageAlt: 'Corporate secretary preparing board resolutions for CAC post-incorporation filings in Nigeria',
    diagramCaption: 'Fig 46. Governance workflow from Board/General Meeting Resolution to CAC Post-Incorporation Portal approval and updated Status Report.',
    isFeatured: false,
    isPopular: false,
    viewsCount: 960,
    readingTimeMinutes: 8,
    publishedAt: '2026-09-22T11:30:00Z',
    introParagraphs: [
      'Businesses evolve: co-founders exit or join the board, offices relocate from Yaba to Victoria Island or Abuja, and growing contracts require increasing issued share capital from ₦1,000,000 to ₦10,000,000.',
      'Please note that signing a private agreement in your office does not update your legal record at the Corporate Affairs Commission. Until a change is formally filed and approved on the CAC Post-Incorporation portal, banks and regulators only recognize the directors and shareholders listed on your official CAC Status Report.',
    ],
    sections: [
      {
        id: 'change-of-directors-appointment-and-removal',
        heading: '1. Appointing or Removing a Company Director',
        paragraphs: [
          'Whether a director resigns voluntarily, passes away, or is removed by ordinary resolution of shareholders under CAMA 2020, the company must file a Notice of Change in Directors within the statutory timeframe (typically 14 days of the resolution) accompanied by the signed resolution, resignation letter (if applicable), and valid ID/consent of any incoming director.',
        ],
      },
      {
        id: 'increasing-share-capital-and-altering-shareholding',
        heading: '2. Increase in Issued Share Capital, Return of Allotment, and Transfer of Shares',
        paragraphs: [
          'Under CAMA 2020, companies maintain "Issued Share Capital" rather than unallotted authorised share capital. When increasing share capital or bringing in a new investor, the company passes a resolution, pays CAC filing fees and FIRS Electronic Stamp Duty on the increase, and files the Return of Allotment alongside updated PSC disclosures.',
        ],
      },
    ],
    practicalChecklistTitle: 'Prerequisites Before Filing Any Post-Incorporation Change',
    practicalChecklistSteps: [
      'Verify that the company’s Annual Returns are completely up to date—the portal blocks post-incorporation filings if Annual Returns are in arrears.',
      'Draft and sign the appropriate Ordinary or Special Resolution duly dated and signed by the Directors/Company Secretary.',
      'Ensure all statutory notice periods are respected if removing a director who has not submitted a voluntary resignation letter.',
      'Download the newly updated CAC Status Report immediately after approval so your bank can update account signatories.',
    ],
    relatedSlugs: [
      { title: 'Filing CAC Annual Returns in Nigeria: Deadlines, Penalties, and Keeping Active Status', url: '/cac-arena/filing-cac-annual-returns-guide' },
      { title: 'Understanding the CAC Status Report (E-Status Report) and How to Obtain a Fresh Copy', url: '/cac-arena/understanding-cac-status-report-guide' },
    ],
    conclusionParagraphs: [
      'Promptly filing post-incorporation changes protects your company against boardroom disputes and ensures your bank signatory mandates always match official CAC records.',
    ],
    faqs: [
      {
        question: 'If you remove a Person as a Director, does that automatically remove their Shares?',
        answer: 'No! Directorship (management on the Board) and Shareholding (ownership of equity shares) are completely separate in law. Removing someone as a Director does not take away their shares unless a valid Instrument of Transfer of Shares (or transmission/surrender) is also executed and filed.',
      },
      {
        question: 'How do we change our registered Business Name or Company Name entirely?',
        answer: 'First conduct a Name Availability Search for the new proposed name on the CAC portal, then file a "Change of Name" post-incorporation application with a Special Resolution. CAC will issue a new Certificate bearing the new name while keeping your original RC/BN number.',
      },
    ],
  },
  {
    title: 'Understanding the CAC Status Report (E-Status Report) and How to Obtain a Fresh Copy',
    slug: 'understanding-cac-status-report-guide',
    excerpt:
      'Why CAC replaced paper Forms CAC 1.1, CAC 2, and CAC 7 with the unified QR-verifiable E-Status Report—and how banks and embassies verify it.',
    seoTitle: 'What is a CAC Status Report in Nigeria & How to Download It | Layitek Blog',
    seoDescription:
      'Understand the CAC E-Status Report (replacing old Forms CAC 1.1, CAC 2 & CAC 7). Learn what it contains and how to request a fresh certified copy.',
    featuredImageAlt: 'Official CAC Status Report document showing company particulars, directors, shareholding, and QR verification code',
    diagramCaption: 'Fig 47. Components of the modern CAC E-Status Report replacing legacy paper forms CAC 2, CAC 7, and CAC 1.1.',
    isFeatured: false,
    isPopular: false,
    viewsCount: 910,
    readingTimeMinutes: 6,
    publishedAt: '2026-09-24T09:00:00Z',
    introParagraphs: [
      'If a bank account officer, embassy visa desk, or tender committee asks you to submit your "CAC 2 and CAC 7 forms" or "CAC 1.1," and your company was registered after 2020, you might wonder why you only received a Certificate and a document titled **"STATUS REPORT"**.',
      'When CAC launched its digital Company Registration Portal (CRP) under CAMA 2020, it consolidated all legacy paper forms (Form CAC 2 for shares, Form CAC 7 for directors, Form CAC 2.1 for secretary, and Form CAC 1.1) into a single, comprehensive **CAC E-Status Report**.',
    ],
    sections: [
      {
        id: 'what-the-cac-status-report-contains',
        heading: '1. What Information Appears on a CAC Status Report?',
        paragraphs: [
          'The CAC Status Report is an official Certified True Copy (CTC) extract of the company’s live database record as of the exact date and timestamp it was generated. It displays:',
        ],
        bullets: [
          'Company Name, Registration Number (RC/BN/IT), Date of Registration, and Registered Office Address.',
          'Active/Inactive Annual Returns compliance status.',
          'Full list of current Directors, Company Secretary, and Proprietors/Trustees.',
          'Issued Share Capital, Shareholding breakdown, and Persons with Significant Control (PSC).',
          'A cryptographic QR code at the bottom that anyone can scan with a smartphone to verify authenticity on `cac.gov.ng`.',
        ],
      },
      {
        id: 'requesting-a-fresh-certified-status-report',
        heading: '2. How to Obtain a Fresh Status Report When Needed by a Bank or Embassy',
        paragraphs: [
          'Upon new registration or any post-incorporation filing approval, CAC provides a free download window (typically 7 days) to save your Status Report. If you lose the PDF or if a commercial bank requires a newly dated Status Report showing current-year compliance, an accredited agent or portal user can file a "Request for Certified Extract / Status Report" after ensuring Annual Returns are up to date.',
        ],
      },
    ],
    practicalChecklistTitle: 'Status Report Management Best Practices',
    practicalChecklistSteps: [
      'Download your Status Report, Certificate, and MEMART PDFs on the exact day your registration is approved.',
      'Email copies of all three PDFs to yourself and store them in Google Drive / OneDrive so they are never lost if your phone or laptop fails.',
      'Never edit or alter a CAC Status Report PDF in a PDF editor—every bank scans the QR code to match the live CAC server record.',
    ],
    relatedSlugs: [
      { title: 'How to Register a Private Limited Liability Company (LTD) in Nigeria Under CAMA 2020', url: '/cac-arena/how-to-register-limited-liability-company-nigeria' },
      { title: 'Filing CAC Annual Returns in Nigeria: Deadlines, Penalties, and Keeping Active Status', url: '/cac-arena/filing-cac-annual-returns-guide' },
    ],
    conclusionParagraphs: [
      'Your CAC Status Report is the living constitutional snapshot of your business. Keep the original PDF backed up and keep your Annual Returns current so any verification check passes effortlessly.',
    ],
    faqs: [
      {
        question: 'My company was registered in 2015 with old Forms CAC 2 and CAC 7. Can I get a new E-Status Report?',
        answer: 'Yes. Legacy companies registered before the new portal can have their records updated and obtain a modern QR-coded E-Status Report through the Post-Incorporation portal once Annual Returns and PSC records are updated.',
      },
      {
        question: 'Why did the free download button disappear on my CAC portal dashboard?',
        answer: 'CAC allows free initial downloads for a limited window (usually 7 days) immediately following registration approval. After that window expires, retrieving a fresh download requires paying the statutory Certified Extract fee.',
      },
    ],
  },
  {
    title: 'How to Resolve CAC Name Reservation Rejections and Registration Portal Queries',
    slug: 'resolving-cac-name-rejection-and-portal-queries',
    excerpt:
      'Understand why CAC disapproves proposed business names and raises compliance queries—and how to coin distinct names and respond to portal queries fast.',
    seoTitle: 'How to Fix CAC Name Rejection & Portal Queries in Nigeria | Layitek Blog',
    seoDescription:
      'Avoid CAC name reservation rejections ("Name is Similar") and resolve registration queries on the CAC portal in Nigeria.',
    featuredImageAlt: 'Compliance specialist reviewing CAC name reservation approval criteria and resolving a portal query',
    diagramCaption: 'Fig 48. Three-part formula for coining a distinctive, instantaneously approvable CAC business or company name.',
    isFeatured: false,
    isPopular: false,
    viewsCount: 1090,
    readingTimeMinutes: 7,
    publishedAt: '2026-09-26T09:00:00Z',
    introParagraphs: [
      'Receiving a "Disapproved: Name is too similar to an existing registered entity" message during CAC Name Reservation—or seeing your registration application flagged as "Queried"—is the most common delay during business registration in Nigeria.',
      'Understanding how the CAC registry evaluates name distinctiveness and document clarity helps you get approved on the very first submission.',
    ],
    sections: [
      {
        id: 'coining-distinctive-names-that-pass-cac-screening',
        heading: '1. The 3-Part Formula to Avoid "Name Too Similar" Rejections',
        paragraphs: [
          'With millions of businesses already on the CAC register, common single-word dictionary names like "Success Global Ventures" or "Royal Tech Limited" are almost guaranteed to conflict with existing records.',
          'Use the **Distinctive Coinage + Core Industry + Legal Suffix** formula: combine an original coined word, uncommon compound, or founder initials with your specific sector (for example, *"Veltrix Precision Systems Limited"* or *"Layitek Integrated Services"*).',
        ],
        bullets: [
          'Always search `search.cac.gov.ng` before paying for a Name Reservation to verify neither your exact name nor a close phonetic twin already exists.',
          'Avoid restricted words ("Group", "Holding", "Conglomerate", "Chambers", "Nigeria", "National", "Cooperative") unless applying under the formal "Consent" route.',
        ],
      },
      {
        id: 'resolving-registration-portal-queries',
        heading: '2. Common Reasons CAC Queries an Application—and How to Fix Them',
        paragraphs: [
          'If a registration officer places your application on "Queried" status, open the Query History tab on your portal dashboard to read the exact reason:',
        ],
        bullets: [
          'Blurry or cropped ID card upload: Re-upload a high-resolution, uncropped JPEG/PNG of the NIN slip or Passport.',
          'Name or Date of Birth discrepancy: Correct the form fields so they match the uploaded ID card identically.',
          'Regulated proficiency requirement: Certain technical, engineering, medical, or financial objects require uploading the relevant professional qualifying certificate (e.g., COREN, ICAN, NBA, PCN) of at least one director/proprietor.',
        ],
      },
    ],
    practicalChecklistTitle: 'Query Resolution Steps',
    practicalChecklistSteps: [
      'Read the exact query comment in the portal notification carefully before editing anything.',
      'Correct all flagged fields or replace unclear document uploads in a single thorough pass.',
      'Add a polite, concise explanatory note in the Query Response comment box detailing what was corrected, then click Re-Submit.',
    ],
    relatedSlugs: [
      { title: 'How to Register a Business Name in Nigeria: Complete Step-by-Step CAC Guide', url: '/cac-arena/how-to-register-a-business-name-in-nigeria' },
      { title: 'How to Register a Private Limited Liability Company (LTD) in Nigeria Under CAMA 2020', url: '/cac-arena/how-to-register-limited-liability-company-nigeria' },
    ],
    conclusionParagraphs: [
      'Pre-searching `search.cac.gov.ng` and cross-checking ID spellings before clicking submit prevents 95% of CAC delays.',
    ],
    faqs: [
      {
        question: 'Does resolving a query on an active registration application require paying the full registration fee again?',
        answer: 'No. Resolving a query on an already paid registration application does not require paying the registration fee again—simply fix the queried item and click re-submit.',
      },
      {
        question: 'Why was my name rejected for containing the word "Chambers" or "Consult"?',
        answer: '"Chambers" is reserved strictly for legal practitioners, and certain professional consultancy terms require uploading a relevant academic or professional qualification.',
      },
    ],
  },
  {
    title: 'How to Upgrade a CAC Business Name to a Limited Liability Company (LTD)',
    slug: 'upgrading-business-name-to-limited-company',
    excerpt:
      'Outgrown your sole proprietorship or enterprise registration? Learn how to formally convert your existing CAC Business Name into a Limited Liability Company.',
    seoTitle: 'How to Upgrade a Business Name to Limited Company (LTD) on CAC | Layitek Blog',
    seoDescription:
      'Step-by-step guide to upgrading an existing Nigerian CAC Business Name (Ventures/Enterprise) into a Private Limited Liability Company (LTD).',
    featuredImageAlt: 'Business transition workflow showing upgrade from a registered Business Name (BN) to an incorporated Limited Company (RC)',
    diagramCaption: 'Fig 49. Statutory CAC Business Name to Limited Liability Company upgrade pathway preserving brand equity.',
    isFeatured: false,
    isPopular: false,
    viewsCount: 880,
    readingTimeMinutes: 7,
    publishedAt: '2026-09-28T09:30:00Z',
    introParagraphs: [
      'Many successful Nigerian companies start life as a registered Business Name (`BN`) and later win a major corporate contract, attract an equity partner, or expand operations to a scale that demands a Limited Liability Company (`LTD`).',
      'Rather than abandoning your well-known trade name, CAC provides a formal **Upgrade of Business Name to Limited Company** procedure.',
    ],
    sections: [
      {
        id: 'eligibility-and-prerequisites-for-upgrade',
        heading: '1. Prerequisites Before Applying to Upgrade Your Business Name',
        paragraphs: [
          'Before initiating the upgrade on the CAC portal, your existing Business Name must be in good standing:',
        ],
        bullets: [
          'All Annual Returns for the Business Name must be filed up to date so its status reads "ACTIVE".',
          'The proprietors of the Business Name must give formal signed consent to convert the enterprise into a Limited Company.',
          'The existing proprietor(s) must be included among the initial directors/shareholders of the upgraded Limited Company.',
        ],
      },
      {
        id: 'step-by-step-upgrade-procedure',
        heading: '2. Step-by-Step Upgrade Procedure on the CAC Portal',
        paragraphs: [
          'First, apply for Name Reservation for Upgrading Business Name to Limited (for example, converting "Kreston Logistics Ventures" to "Kreston Logistics Limited"), attaching the Business Name certificate and proprietor consent. Once the upgrade Availability Code is approved, complete the company incorporation workflow, pay the CAC filing and FIRS stamp duty fees, and receive your new RC Certificate of Incorporation (upon which the old BN ceases and is absorbed).',
        ],
      },
    ],
    practicalChecklistTitle: 'Business Name Upgrade Checklist',
    practicalChecklistSteps: [
      'Confirm your Business Name status is ACTIVE on `search.cac.gov.ng` and clear any outstanding Annual Returns.',
      'Submit a Consent for Upgrade Name Reservation attaching your BN Certificate, Status Report, and signed Proprietor Consent Letter.',
      'Complete the LTD incorporation particulars (Share Capital, MEMART objects, Directors, Shareholders, and PSC).',
      'Notify your commercial bank and clients with your new RC Certificate of Incorporation and updated TIN once issued.',
    ],
    relatedSlugs: [
      { title: 'Business Name vs Limited Liability Company (LTD) in Nigeria: Which Should You Register?', url: '/cac-arena/business-name-vs-limited-liability-company' },
      { title: 'How to Register a Private Limited Liability Company (LTD) in Nigeria Under CAMA 2020', url: '/cac-arena/how-to-register-limited-liability-company-nigeria' },
    ],
    conclusionParagraphs: [
      'Upgrading your Business Name to a Limited Liability Company preserves the brand reputation you worked hard to build while unlocking full corporate structure and limited liability protection.',
    ],
    faqs: [
      {
        question: 'Can I add a new co-founder or investor as a shareholder during the upgrade to LTD?',
        answer: 'Yes. Provided the original Business Name proprietor is included among the directors/shareholders of the upgraded company, additional shareholders and directors can be included during the incorporation stage.',
      },
      {
        question: 'What happens to my old Business Name Certificate after the upgrade is approved?',
        answer: 'Once the upgraded Limited Liability Company (RC) is incorporated, the former Business Name registration is formally dissolved/upgraded into the new corporate entity.',
      },
    ],
  },
  {
    title: 'Post-Registration Compliance Checklist: TIN, Corporate Bank Account, and SCUML',
    slug: 'post-registration-compliance-tin-scuml-guide',
    excerpt:
      'What to do immediately after receiving your CAC certificate: validating your FIRS/JTB Tax Identification Number (TIN), SCUML registration, and opening a corporate bank account.',
    seoTitle: 'After CAC Registration: TIN, SCUML & Bank Account Guide | Layitek Blog',
    seoDescription:
      'What next after CAC registration in Nigeria? Learn how to validate your TIN on TaxPro Max, obtain an EFCC SCUML certificate, and open a business bank account.',
    featuredImageAlt: 'Post-incorporation compliance folder containing CAC Certificate, TIN validation, SCUML certificate, and corporate banking forms',
    diagramCaption: 'Fig 50. Complete post-registration compliance roadmap from CAC Certificate issuance to operational readiness.',
    isFeatured: false,
    isPopular: false,
    viewsCount: 1410,
    readingTimeMinutes: 8,
    publishedAt: '2026-10-01T10:30:00Z',
    introParagraphs: [
      'Downloading your CAC Certificate and Status Report is Milestone One. To open a commercial corporate bank account, issue compliant VAT invoices, or sign vendor service level agreements in Nigeria, you must complete three immediate post-registration steps: TIN validation, SCUML assessment (if applicable), and corporate bank onboarding.',
    ],
    sections: [
      {
        id: 'tin-validation-and-taxpro-max',
        heading: '1. Validating Your Tax Identification Number (TIN) for Banking and Tax',
        paragraphs: [
          'For Limited Liability Companies, a 10-digit FIRS TIN is automatically assigned on the CAC Certificate of Incorporation (verify it on `tinverification.firs.gov.ng` or JTB portal and profile it at your nearest tax office for TaxPro Max access). For Business Names, generate or verify your JTB/FIRS Enterprise TIN using your BN number and proprietor NIN/BVN.',
        ],
      },
      {
        id: 'understanding-scuml-registration',
        heading: '2. Which Businesses Require an EFCC SCUML Certificate to Open a Bank Account?',
        paragraphs: [
          'Under Money Laundering (Prevention and Prohibition) regulations, Designated Non-Financial Businesses and Professions (DNFBPs)—as well as all NGOs/Incorporated Trustees—must obtain a free registration certificate from the **Special Control Unit Against Money Laundering (SCUML)** via `scuml.org` before Nigerian banks will activate their corporate account:',
        ],
        bullets: [
          'Real estate, construction, and estate surveying companies.',
          'Dealers in luxury goods, cars/automobiles, jewellery, and precious stones.',
          'Audit, accounting, tax consulting, and legal/management consultancy firms.',
          'Hotels, hospitality, supermarkets, and clearing/forwarding businesses.',
          'All Non-Governmental Organisations (NGOs), churches, mosques, and foundations (Part F).',
        ],
      },
    ],
    practicalChecklistTitle: 'Corporate Bank Account Opening Document Pack',
    practicalChecklistSteps: [
      'CAC Certificate of Registration/Incorporation + Certified Status Report (+ MEMART for Limited Companies).',
      'Verified Tax Identification Number (TIN) printout.',
      'SCUML Certificate (if your business objects fall under DNFBP categories or if you are an NGO).',
      'Bank Verification Number (BVN), NIN, valid Government ID, passport photographs, and residential utility bill for all signatories/directors.',
      'Two completed Corporate Account References from existing corporate current account holders (where required by traditional commercial banks) and a Board Resolution authorizing account opening.',
    ],
    relatedSlugs: [
      { title: 'How to Register a Private Limited Liability Company (LTD) in Nigeria Under CAMA 2020', url: '/cac-arena/how-to-register-limited-liability-company-nigeria' },
      { title: 'How to Register a Business Name in Nigeria: Complete Step-by-Step CAC Guide', url: '/cac-arena/how-to-register-a-business-name-in-nigeria' },
    ],
    conclusionParagraphs: [
      'Completing your TIN verification, SCUML registration (where applicable), and corporate bank account setup immediately after CAC approval turns your certificate into a fully operational enterprise.',
    ],
    faqs: [
      {
        question: 'Does EFCC charge an official government fee for SCUML registration?',
        answer: 'No. Official application on the SCUML portal (`scuml.org`) has zero government filing fee, though many business owners engage compliance professionals to prepare and monitor the documentation.',
      },
      {
        question: 'Why did the bank ask me for a SCUML certificate when my main business is IT software?',
        answer: 'Banks inspect every single line item in your CAC "Nature of Business" or MEMART objects. If you included broad secondary clauses like "general merchandise, real estate, construction, or consultancy" alongside IT software, those secondary clauses trigger mandatory SCUML compliance.',
      },
    ],
  },
  {
    title: 'Persons with Significant Control (PSC), Statutory Registers, and Corporate Governance Under CAMA 2020',
    slug: 'psc-disclosure-and-corporate-governance-cama-2020',
    excerpt:
      'Understand mandatory Persons with Significant Control (PSC) beneficial ownership filings, statutory registers, and company secretary rules in Nigeria.',
    seoTitle: 'PSC Disclosure & Corporate Governance Under CAMA 2020 | Layitek Blog',
    seoDescription:
      'Learn what Persons with Significant Control (PSC) means on the CAC portal in Nigeria, who qualifies at the 5% threshold, and how to stay compliant.',
    featuredImageAlt: 'Corporate governance compliance ledger showing Persons with Significant Control (PSC) beneficial ownership structure',
    diagramCaption: 'Fig 50B. Beneficial ownership disclosure threshold (5%+ shares or voting control) under CAMA 2020 and CAC PSC Registry rules.',
    isFeatured: false,
    isPopular: false,
    viewsCount: 840,
    readingTimeMinutes: 7,
    publishedAt: '2026-10-05T10:00:00Z',
    introParagraphs: [
      'Under Sections 119 and 791 of the Companies and Allied Matters Act (CAMA) 2020, Nigeria introduced mandatory beneficial ownership transparency across all registered Limited Liability Companies and Limited Liability Partnerships through the **Persons with Significant Control (PSC)** register.',
      'Understanding PSC disclosure rules and corporate governance records keeps your company compliant during CAC audits, bank KYC reviews, and international due diligence.',
    ],
    sections: [
      {
        id: 'who-qualifies-as-a-person-with-significant-control',
        heading: '1. Who Qualifies as a Person with Significant Control (PSC)?',
        paragraphs: [
          'A Person with Significant Control is any natural person (human individual) who ultimately owns or controls a company, including anyone who:',
        ],
        bullets: [
          'Directly or indirectly holds at least **5% of the issued shares** or interest in the company.',
          'Directly or indirectly holds at least **5% of the voting rights** in the company.',
          'Holds the right, directly or indirectly, to appoint or remove a majority of the directors.',
          'Exercises significant influence or control over the company even if holding less than 5% on paper.',
        ],
      },
      {
        id: 'maintaining-statutory-registers-and-company-seal',
        heading: '2. Statutory Registers, Common Seal, and Company Secretary Rules',
        paragraphs: [
          'Note that under CAMA 2020, having a metallic Common Seal is now optional (a document is validly executed by a company if signed by two directors, or a director and secretary, or a single director in the presence of a witness). Furthermore, while a Small Company is exempted from mandatorily appointing a Company Secretary, retaining an accredited Company Secretary ensures timely filing of PSC changes, Annual Returns, and board minutes.',
        ],
      },
    ],
    practicalChecklistTitle: 'Corporate Governance Compliance Steps',
    practicalChecklistSteps: [
      'Notify the company within 7 days whenever any person acquires or ceases to hold 5% or more of shares/voting rights, and file the PSC notice on the CAC portal within the statutory period.',
      'Maintain an updated Register of Members (Shareholders), Register of Directors, and Register of PSC at your registered office.',
      'Record and sign formal Minutes for every Board Meeting and Annual General Meeting.',
    ],
    relatedSlugs: [
      { title: 'How to Register a Private Limited Liability Company (LTD) in Nigeria Under CAMA 2020', url: '/cac-arena/how-to-register-limited-liability-company-nigeria' },
      { title: 'Post-Incorporation Changes on CAC: Adding/Removing Directors, Address, and Share Capital', url: '/cac-arena/post-incorporation-changes-directors-address-shares' },
    ],
    conclusionParagraphs: [
      'Transparent PSC reporting and disciplined board record-keeping protect shareholders, satisfy commercial bank KYC teams, and prepare your company for institutional investment.',
    ],
    faqs: [
      {
        question: 'Can another corporate entity (a holding company) be listed as the ultimate PSC?',
        answer: 'While a corporate shareholder holds the shares,PSC regulations require tracing ownership through any holding company layers to identify the ultimate natural human person(s) who exercise 5% or more control.',
      },
      {
        question: 'Is a metallic company seal still compulsory for Nigerian Limited Companies?',
        answer: 'Under Section 98 of CAMA 2020, a company is no longer required to have a common seal, though many companies still procure one for traditional banking and contract documentation.',
      },
    ],
  },
];

export const CAC_ARTICLES: SeedArticleInput[] = CAC_BLUEPRINTS.slice(0, 10).map((bp) =>
  compileBlueprintToArticle('cac-arena', bp, CAC_DISCLAIMER)
);
