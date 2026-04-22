import crypto from 'crypto'

/** Generate a stable short ID from a string (URL or GUID) */
export function slugify(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16)
}

// Country name → ISO2 code mapping for the countries in the platform
const COUNTRY_ALIASES: Record<string, string> = {
  // Eastern Europe
  ukraine: 'UA',
  russian: 'RU',
  russia: 'RU',
  belarus: 'BY',
  moldova: 'MD',
  // East Asia
  china: 'CN',
  chinese: 'CN',
  taiwan: 'TW',
  'north korea': 'KP',
  'south korea': 'KR',
  korean: 'KR',
  japan: 'JP',
  // Middle East
  iran: 'IR',
  iranian: 'IR',
  israel: 'IL',
  israeli: 'IL',
  'saudi arabia': 'SA',
  saudi: 'SA',
  turkey: 'TR',
  turkish: 'TR',
  syria: 'SY',
  syrian: 'SY',
  iraq: 'IQ',
  iraqi: 'IQ',
  yemen: 'YE',
  yemeni: 'YE',
  lebanon: 'LB',
  lebanese: 'LB',
  // Sub-Saharan Africa
  ethiopia: 'ET',
  ethiopian: 'ET',
  sudan: 'SD',
  sudanese: 'SD',
  nigeria: 'NG',
  nigerian: 'NG',
  somalia: 'SO',
  somali: 'SO',
  mali: 'ML',
  malian: 'ML',
  // Southeast Asia
  myanmar: 'MM',
  burma: 'MM',
  burmese: 'MM',
  'south china sea': 'CN',
  // Latin America
  venezuela: 'VE',
  venezuelan: 'VE',
  haiti: 'HT',
  haitian: 'HT',
  mexico: 'MX',
  colombian: 'CO',
  colombia: 'CO',
  // Major powers (for context)
  'united states': 'US',
  american: 'US',
  'united kingdom': 'GB',
  british: 'GB',
  france: 'FR',
  french: 'FR',
  germany: 'DE',
  german: 'DE',
}

/** Extract ISO2 country codes mentioned in text */
export function extractCountryHints(text: string): string[] {
  const lower = text.toLowerCase()
  const found = new Set<string>()

  for (const [alias, iso2] of Object.entries(COUNTRY_ALIASES)) {
    if (lower.includes(alias)) {
      found.add(iso2)
    }
  }

  return Array.from(found)
}
