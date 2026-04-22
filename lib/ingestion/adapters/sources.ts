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
  'reuters-world':    'center',
  'bbc-world':        'center-left',
  'aljazeera':        'center-left',
  'ap-world':         'center',
  'foreign-policy':   'center',
  'defense-one':      'center',
  'war-on-the-rocks': 'center',
  'the-diplomat':     'center',
  'bellingcat':       'center-left',
  'middle-east-eye':  'center-left',
  'arab-news':        'center-right',
  'africa-report':    'center',
  'allafrica':        'center',
  'euractiv':         'center',
  'moscow-times':     'center-left',
  'rferl':            'center',
  'kyiv-independent': 'center-left',
  'scmp-asia':        'center',
  'nikkei-asia':      'center',
  'asia-times':       'center',
  'insight-crime':    'center',
  'mercopress':       'center',
  'dawn-pakistan':    'center',
  'the-wire-india':   'center-left',
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

export const ALL_RSS_FEEDS: FeedConfig[] = [
  ...RSS_FEEDS,
  ...CYBER_FEEDS,
  ...TRADE_FEEDS,
]

// Reverse lookup: source display name → bias (for UI display without needing DB field)
export const SOURCE_NAME_BIAS_MAP: Record<string, SourceBias> = Object.fromEntries(
  RSS_FEEDS
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
