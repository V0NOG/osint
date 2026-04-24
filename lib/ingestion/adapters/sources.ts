export type SourceBias = 'left' | 'center-left' | 'center' | 'center-right' | 'right'
export type FeedDomain = 'general' | 'cyber' | 'trade' | 'humanitarian' | 'conflict'

export interface FeedConfig {
  name: string
  url: string
  key: string
  reliability: 'high' | 'medium' | 'low'
  tags: string[]
  domain?: FeedDomain
}

// Lookup by source key — used at display time without needing a DB field
export const SOURCE_BIAS_MAP: Record<string, SourceBias | undefined> = {
  // Wire services
  'reuters-world':      'center',
  'ap-world':           'center',
  // Anglophone global
  'bbc-world':          'center-left',
  'aljazeera':          'center-left',
  'foreign-policy':     'center',
  'defense-one':        'center',
  'war-on-the-rocks':   'center',
  'the-diplomat':       'center',
  'bellingcat':         'center-left',
  // MENA
  'middle-east-eye':    'center-left',
  'arab-news':          'center-right',
  'al-monitor':         'center',
  'the-new-arab':       'center-left',
  'iran-international': 'center-right',
  'egypt-independent':  'center-left',
  // Africa
  'africa-report':      'center',
  'allafrica':          'center',
  'premium-times':      'center',
  'daily-nation':       'center',
  'east-african':       'center',
  'mail-guardian':      'center-left',
  'business-day-ng':    'center',
  // Europe & Russia
  'euractiv':           'center',
  'moscow-times':       'center-left',
  'meduza':             'center-left',
  'rferl':              'center',
  'kyiv-independent':   'center-left',
  'balkan-insight':     'center',
  'occrp':              'center-left',
  'politico-eu':        'center',
  // Asia-Pacific
  'scmp-asia':          'center',
  'nikkei-asia':        'center',
  'asia-times':         'center',
  'bangkok-post':       'center',
  'irrawaddy':          'center-left',
  'benar-news':         'center',
  'rappler':            'center-left',
  'jakarta-post':       'center',
  // South & Central Asia
  'dawn-pakistan':      'center',
  'the-wire-india':     'center-left',
  'the-print':          'center',
  'eurasianet':         'center',
  'cabar-asia':         'center',
  // Latin America
  'insight-crime':      'center',
  'mercopress':         'center',
  'americas-quarterly': 'center',
  'agencia-brasil':     'center',
  'rio-times':          'center',
  // Multilateral / state broadcasters
  'france24':           'center',
  'dw-news':            'center',
  'voa-news':           'center',
  'nhk-world':          'center',
  'rfi-english':        'center',
  // Trade
  'wto':                'center',
  'imf':                'center',
  'ft-world':           'center',
  'wsj-world':          'center-right',
}

export const RSS_FEEDS: FeedConfig[] = [
  // ─── Global wire services ─────────────────────────────────────────────────
  {
    name: 'Reuters World News',
    url: 'https://feeds.reuters.com/reuters/worldNews',
    key: 'reuters-world',
    reliability: 'high',
    tags: ['reuters', 'world'],
  },
  {
    name: 'BBC World News',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    key: 'bbc-world',
    reliability: 'high',
    tags: ['bbc', 'world'],
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    key: 'aljazeera',
    reliability: 'high',
    tags: ['aljazeera', 'world'],
  },
  {
    name: 'Associated Press World',
    url: 'https://rsshub.app/apnews/topics/world-news',
    key: 'ap-world',
    reliability: 'high',
    tags: ['ap', 'world'],
  },

  // ─── Geopolitics & defence ────────────────────────────────────────────────
  {
    name: 'Foreign Policy',
    url: 'https://foreignpolicy.com/feed/',
    key: 'foreign-policy',
    reliability: 'high',
    tags: ['foreign-policy', 'analysis'],
  },
  {
    name: 'Defense One',
    url: 'https://www.defenseone.com/rss/all/',
    key: 'defense-one',
    reliability: 'high',
    tags: ['defense', 'military'],
  },
  {
    name: 'War on the Rocks',
    url: 'https://warontherocks.com/feed/',
    key: 'war-on-the-rocks',
    reliability: 'high',
    tags: ['security', 'strategy', 'analysis'],
  },
  {
    name: 'The Diplomat',
    url: 'https://thediplomat.com/feed/',
    key: 'the-diplomat',
    reliability: 'high',
    tags: ['asia', 'diplomacy', 'geopolitics'],
  },
  {
    name: 'Bellingcat',
    url: 'https://www.bellingcat.com/feed/',
    key: 'bellingcat',
    reliability: 'high',
    tags: ['osint', 'investigation', 'conflict'],
  },

  // ─── Middle East & Africa ─────────────────────────────────────────────────
  {
    name: 'Middle East Eye',
    url: 'https://www.middleeasteye.net/rss',
    key: 'middle-east-eye',
    reliability: 'high',
    tags: ['middle-east', 'world'],
  },
  {
    name: 'Arab News',
    url: 'https://www.arabnews.com/rss.xml',
    key: 'arab-news',
    reliability: 'medium',
    tags: ['middle-east', 'arab'],
  },
  {
    name: 'The Africa Report',
    url: 'https://www.theafricareport.com/feed/',
    key: 'africa-report',
    reliability: 'high',
    tags: ['africa', 'politics'],
  },
  {
    name: 'AllAfrica',
    url: 'https://allafrica.com/tools/headlines/rdf/world/headlines.rdf',
    key: 'allafrica',
    reliability: 'medium',
    tags: ['africa', 'world'],
  },

  // ─── Europe & Russia ──────────────────────────────────────────────────────
  {
    name: 'Euractiv',
    url: 'https://www.euractiv.com/sections/global-europe/feed/',
    key: 'euractiv',
    reliability: 'high',
    tags: ['europe', 'eu', 'geopolitics'],
  },
  {
    name: 'The Moscow Times',
    url: 'https://www.themoscowtimes.com/rss/news',
    key: 'moscow-times',
    reliability: 'high',
    tags: ['russia', 'eastern-europe'],
  },
  {
    name: 'RFE/RL',
    url: 'https://www.rferl.org/api/z-pipqvuveir-p_uyiuq',
    key: 'rferl',
    reliability: 'high',
    tags: ['russia', 'eastern-europe', 'central-asia'],
  },
  {
    name: 'Kyiv Independent',
    url: 'https://kyivindependent.com/feed/',
    key: 'kyiv-independent',
    reliability: 'high',
    tags: ['ukraine', 'russia', 'war'],
  },

  // ─── Asia-Pacific ─────────────────────────────────────────────────────────
  {
    name: 'South China Morning Post — Asia',
    url: 'https://www.scmp.com/rss/91/feed',
    key: 'scmp-asia',
    reliability: 'high',
    tags: ['asia', 'china', 'geopolitics'],
  },
  {
    name: 'Nikkei Asia',
    url: 'https://asia.nikkei.com/rss/feed/nar',
    key: 'nikkei-asia',
    reliability: 'high',
    tags: ['asia', 'japan', 'economy'],
  },
  {
    name: 'Asia Times',
    url: 'https://asiatimes.com/feed/',
    key: 'asia-times',
    reliability: 'medium',
    tags: ['asia', 'geopolitics'],
  },

  // ─── Americas ─────────────────────────────────────────────────────────────
  {
    name: 'InSight Crime',
    url: 'https://insightcrime.org/feed/',
    key: 'insight-crime',
    reliability: 'high',
    tags: ['latin-america', 'crime', 'security'],
  },
  {
    name: 'Mercopress',
    url: 'https://en.mercopress.com/rss',
    key: 'mercopress',
    reliability: 'medium',
    tags: ['latin-america', 'south-america'],
  },

  // ─── South & Central Asia ─────────────────────────────────────────────────
  {
    name: 'Dawn (Pakistan)',
    url: 'https://www.dawn.com/feeds/world-news',
    key: 'dawn-pakistan',
    reliability: 'high',
    tags: ['south-asia', 'pakistan'],
  },
  {
    name: 'The Wire',
    url: 'https://thewire.in/rss-feed-top-stories',
    key: 'the-wire-india',
    reliability: 'medium',
    tags: ['south-asia', 'india'],
  },

  // ─── Alerts & structured data via RSS ─────────────────────────────────────
  {
    name: 'GDACS Global Alerts',
    url: 'https://www.gdacs.org/xml/rss_24h.xml',
    key: 'gdacs',
    reliability: 'high',
    tags: ['gdacs', 'disaster', 'alert', 'conflict'],
    domain: 'conflict',
  },
  {
    name: 'UN News — Peace & Security',
    url: 'https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml',
    key: 'un-peace',
    reliability: 'high',
    tags: ['un', 'peacekeeping', 'security'],
    domain: 'conflict',
  },
  {
    name: 'UN News — Humanitarian Aid',
    url: 'https://news.un.org/feed/subscribe/en/news/topic/humanitarian-aid/feed/rss.xml',
    key: 'un-humanitarian',
    reliability: 'high',
    tags: ['un', 'humanitarian', 'aid'],
    domain: 'humanitarian',
  },
  {
    name: 'ICRC (Red Cross)',
    url: 'https://www.icrc.org/en/rss/news',
    key: 'icrc',
    reliability: 'high',
    tags: ['humanitarian', 'red-cross', 'conflict'],
    domain: 'humanitarian',
  },
  {
    name: 'MSF (Doctors Without Borders)',
    url: 'https://www.msf.org/rss.xml',
    key: 'msf',
    reliability: 'high',
    tags: ['humanitarian', 'msf', 'crisis'],
    domain: 'humanitarian',
  },
]

// ─── Cyber intelligence feeds ─────────────────────────────────────────────────

export const CYBER_FEEDS: FeedConfig[] = [
  {
    name: 'The Record (Recorded Future)',
    url: 'https://therecord.media/feed/',
    key: 'the-record',
    reliability: 'high',
    tags: ['cyber', 'apt', 'threat-intel'],
    domain: 'cyber',
  },
  {
    name: 'CyberScoop',
    url: 'https://cyberscoop.com/feed/',
    key: 'cyberscoop',
    reliability: 'high',
    tags: ['cyber', 'policy', 'government'],
    domain: 'cyber',
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    key: 'krebs',
    reliability: 'high',
    tags: ['cyber', 'breach', 'crime'],
    domain: 'cyber',
  },
  {
    name: 'Dark Reading',
    url: 'https://www.darkreading.com/rss.xml',
    key: 'dark-reading',
    reliability: 'medium',
    tags: ['cyber', 'vulnerability', 'threat'],
    domain: 'cyber',
  },
  {
    name: 'Bleeping Computer',
    url: 'https://www.bleepingcomputer.com/feed/',
    key: 'bleeping-computer',
    reliability: 'medium',
    tags: ['cyber', 'ransomware', 'malware'],
    domain: 'cyber',
  },
  {
    name: 'CISA Current Activity',
    url: 'https://www.cisa.gov/uscert/ncas/current-activity.xml',
    key: 'cisa',
    reliability: 'high',
    tags: ['cyber', 'cisa', 'advisory', 'vulnerability'],
    domain: 'cyber',
  },
  {
    name: 'Graham Cluley (Security)',
    url: 'https://grahamcluley.com/feed/',
    key: 'graham-cluley',
    reliability: 'high',
    tags: ['cyber', 'threat-intel', 'analysis'],
    domain: 'cyber',
  },
  {
    name: 'Troy Hunt (Have I Been Pwned)',
    url: 'https://www.troyhunt.com/rss/',
    key: 'troy-hunt',
    reliability: 'high',
    tags: ['cyber', 'breach', 'data-leak'],
    domain: 'cyber',
  },
]

// ─── Trade & economic intelligence feeds ─────────────────────────────────────

export const TRADE_FEEDS: FeedConfig[] = [
  {
    name: 'WTO News',
    url: 'https://www.wto.org/english/news_e/rss_e/rss_news_e.xml',
    key: 'wto',
    reliability: 'high',
    tags: ['trade', 'wto', 'tariff', 'policy'],
    domain: 'trade',
  },
  {
    name: 'IMF News',
    url: 'https://www.imf.org/en/news/rss',
    key: 'imf',
    reliability: 'high',
    tags: ['trade', 'imf', 'economy', 'finance'],
    domain: 'trade',
  },
  {
    name: 'Financial Times World',
    url: 'https://www.ft.com/?format=rss',
    key: 'ft-world',
    reliability: 'high',
    tags: ['trade', 'finance', 'markets', 'economics'],
    domain: 'trade',
  },
  {
    name: 'Wall Street Journal World',
    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    key: 'wsj-world',
    reliability: 'high',
    tags: ['trade', 'markets', 'economics', 'policy'],
    domain: 'trade',
  },
  {
    name: 'Politico EU',
    url: 'https://www.politico.eu/rss',
    key: 'politico-eu',
    reliability: 'high',
    tags: ['trade', 'europe', 'policy', 'regulation'],
    domain: 'trade',
  },
]

// ─── Expanded MENA feeds ──────────────────────────────────────────────────────

export const MENA_FEEDS: FeedConfig[] = [
  {
    name: 'Al-Monitor',
    url: 'https://www.al-monitor.com/rss',
    key: 'al-monitor',
    reliability: 'high',
    tags: ['middle-east', 'analysis', 'diplomacy'],
  },
  {
    name: 'The New Arab',
    url: 'https://english.alaraby.co.uk/rss.xml',
    key: 'the-new-arab',
    reliability: 'medium',
    tags: ['middle-east', 'arab', 'conflict'],
  },
  {
    name: 'Iran International',
    url: 'https://www.iranintl.com/en/rss',
    key: 'iran-international',
    reliability: 'high',
    tags: ['iran', 'middle-east'],
  },
  {
    name: 'Egypt Independent',
    url: 'https://egyptindependent.com/feed/',
    key: 'egypt-independent',
    reliability: 'medium',
    tags: ['egypt', 'middle-east', 'north-africa'],
  },
]

// ─── Expanded Africa feeds ────────────────────────────────────────────────────

export const AFRICA_FEEDS: FeedConfig[] = [
  {
    name: 'Premium Times Nigeria',
    url: 'https://www.premiumtimesng.com/feed',
    key: 'premium-times',
    reliability: 'high',
    tags: ['africa', 'nigeria', 'west-africa'],
  },
  {
    name: 'Daily Nation (Kenya)',
    url: 'https://nation.africa/kenya/rss',
    key: 'daily-nation',
    reliability: 'high',
    tags: ['africa', 'kenya', 'east-africa'],
  },
  {
    name: 'The East African',
    url: 'https://www.theeastafrican.co.ke/rss',
    key: 'east-african',
    reliability: 'high',
    tags: ['africa', 'east-africa', 'regional'],
  },
  {
    name: 'Mail & Guardian (South Africa)',
    url: 'https://mg.co.za/feed/',
    key: 'mail-guardian',
    reliability: 'high',
    tags: ['africa', 'south-africa', 'southern-africa'],
  },
  {
    name: 'BusinessDay Nigeria',
    url: 'https://businessday.ng/feed/',
    key: 'business-day-ng',
    reliability: 'medium',
    tags: ['africa', 'nigeria', 'economics'],
  },
]

// ─── Expanded Latin America feeds ─────────────────────────────────────────────

export const LATAM_FEEDS: FeedConfig[] = [
  {
    name: 'Americas Quarterly',
    url: 'https://www.americasquarterly.org/feed/',
    key: 'americas-quarterly',
    reliability: 'high',
    tags: ['latin-america', 'politics', 'analysis'],
  },
  {
    name: 'Agência Brasil',
    url: 'https://agenciabrasil.ebc.com.br/en/rss/ultimasnoticias/feed',
    key: 'agencia-brasil',
    reliability: 'high',
    tags: ['latin-america', 'brazil', 'south-america'],
  },
  {
    name: 'Rio Times Online',
    url: 'https://riotimesonline.com/feed/',
    key: 'rio-times',
    reliability: 'medium',
    tags: ['latin-america', 'brazil'],
  },
]

// ─── Southeast Asia & Pacific feeds ──────────────────────────────────────────

export const APAC_FEEDS: FeedConfig[] = [
  {
    name: 'Bangkok Post',
    url: 'https://www.bangkokpost.com/rss/data/topstories.xml',
    key: 'bangkok-post',
    reliability: 'high',
    tags: ['southeast-asia', 'thailand', 'asean'],
  },
  {
    name: 'The Irrawaddy',
    url: 'https://www.irrawaddy.com/feed',
    key: 'irrawaddy',
    reliability: 'high',
    tags: ['southeast-asia', 'myanmar', 'conflict'],
  },
  {
    name: 'Benar News',
    url: 'https://www.benarnews.org/rss/bnews.xml',
    key: 'benar-news',
    reliability: 'high',
    tags: ['southeast-asia', 'south-asia', 'rfa'],
  },
  {
    name: 'Rappler',
    url: 'https://www.rappler.com/feed/',
    key: 'rappler',
    reliability: 'high',
    tags: ['southeast-asia', 'philippines'],
  },
  {
    name: 'The Jakarta Post',
    url: 'https://www.thejakartapost.com/feed',
    key: 'jakarta-post',
    reliability: 'high',
    tags: ['southeast-asia', 'indonesia', 'asean'],
  },
]

// ─── Eurasia / Eastern Europe feeds ──────────────────────────────────────────

export const EURASIA_FEEDS: FeedConfig[] = [
  {
    name: 'Meduza (English)',
    url: 'https://meduza.io/rss/en/all',
    key: 'meduza',
    reliability: 'high',
    tags: ['russia', 'eastern-europe', 'independent'],
  },
  {
    name: 'Eurasianet',
    url: 'https://eurasianet.org/rss.xml',
    key: 'eurasianet',
    reliability: 'high',
    tags: ['central-asia', 'caucasus', 'eurasia'],
  },
  {
    name: 'Balkan Insight',
    url: 'https://balkaninsight.com/feed/',
    key: 'balkan-insight',
    reliability: 'high',
    tags: ['balkans', 'eastern-europe', 'eu-accession'],
  },
  {
    name: 'OCCRP',
    url: 'https://www.occrp.org/en/feed/',
    key: 'occrp',
    reliability: 'high',
    tags: ['corruption', 'organized-crime', 'eastern-europe'],
  },
  {
    name: 'CABAR.asia',
    url: 'https://cabar.asia/en/feed/',
    key: 'cabar-asia',
    reliability: 'medium',
    tags: ['central-asia', 'kyrgyzstan', 'kazakhstan'],
  },
]

// ─── Global multilateral & state broadcaster feeds ────────────────────────────

export const MULTILATERAL_FEEDS: FeedConfig[] = [
  {
    name: 'France 24 (English)',
    url: 'https://www.france24.com/en/rss',
    key: 'france24',
    reliability: 'high',
    tags: ['france', 'world', 'africa', 'francophone'],
  },
  {
    name: 'DW News World',
    url: 'https://rss.dw.com/rdf/rss-en-world',
    key: 'dw-news',
    reliability: 'high',
    tags: ['germany', 'world', 'europe'],
  },
  {
    name: 'Voice of America',
    url: 'https://www.voanews.com/api/z-qeqp_-oyiui',
    key: 'voa-news',
    reliability: 'high',
    tags: ['world', 'us-policy', 'international'],
  },
  {
    name: 'NHK World',
    url: 'https://www3.nhk.or.jp/rss/news/cat0.xml',
    key: 'nhk-world',
    reliability: 'high',
    tags: ['japan', 'asia', 'world'],
  },
  {
    name: 'RFI English',
    url: 'https://www.rfi.fr/en/rss',
    key: 'rfi-english',
    reliability: 'high',
    tags: ['france', 'africa', 'world', 'francophone'],
  },
  {
    name: 'The Print (India)',
    url: 'https://theprint.in/feed/',
    key: 'the-print',
    reliability: 'high',
    tags: ['india', 'south-asia', 'geopolitics'],
  },
]

export const ALL_RSS_FEEDS: FeedConfig[] = [
  ...RSS_FEEDS,
  ...MENA_FEEDS,
  ...AFRICA_FEEDS,
  ...LATAM_FEEDS,
  ...APAC_FEEDS,
  ...EURASIA_FEEDS,
  ...MULTILATERAL_FEEDS,
  ...CYBER_FEEDS,
  ...TRADE_FEEDS,
]

// Reverse lookup: source display name → bias (for UI display without needing DB field)
export const SOURCE_NAME_BIAS_MAP: Record<string, SourceBias> = Object.fromEntries(
  ALL_RSS_FEEDS
    .map((f) => [f.name, SOURCE_BIAS_MAP[f.key]])
    .filter(([, bias]) => bias !== undefined)
) as Record<string, SourceBias>

export const GDELT_THEMES = [
  'CRISISLEX_CRISISLEXREC',
  'WB_696_POLITICAL_VIOLENCE',
  'MILITARY',
  'SANCTIONS',
  'TAX_DISEASE',
]
