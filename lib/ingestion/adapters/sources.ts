export type SourceBias = 'left' | 'center-left' | 'center' | 'center-right' | 'right'

export interface FeedConfig {
  name: string
  url: string
  key: string
  reliability: 'high' | 'medium' | 'low'
  tags: string[]
}

// Lookup by source key — used at display time without needing a DB field
export const SOURCE_BIAS_MAP: Record<string, SourceBias> = {
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
