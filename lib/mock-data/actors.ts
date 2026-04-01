import type { Actor } from '../types'

export const mockActors: Actor[] = [
  {
    id: 'vladimir-putin',
    name: 'Vladimir Putin',
    type: 'individual',
    countries: ['russia'],
    role: 'President of the Russian Federation',
    riskContribution: 'high',
    description:
      'Putin has led Russia since 2000, consolidating executive authority and pursuing a revisionist foreign policy centered on restoring Russia\'s sphere of influence. His decision to launch the full-scale Ukraine invasion in February 2022 fundamentally altered European security. Nuclear signaling is a consistent element of his strategic posture.',
    affiliations: ['kremlin', 'united-russia'],
  },
  {
    id: 'xi-jinping',
    name: 'Xi Jinping',
    type: 'individual',
    countries: ['china'],
    role: 'General Secretary, President of the PRC',
    riskContribution: 'high',
    description:
      'Xi has consolidated unprecedented personal authority over Chinese politics, military, and economy. His stated goal of "national rejuvenation" includes reunification with Taiwan. His third term removes previous norms of leadership transition, creating long-term systemic uncertainty.',
    affiliations: ['chinese-communist-party', 'peoples-liberation-army'],
  },
  {
    id: 'kim-jong-un',
    name: 'Kim Jong-un',
    type: 'individual',
    countries: ['north-korea'],
    role: 'Supreme Leader of North Korea',
    riskContribution: 'high',
    description:
      'Kim has overseen significant expansion of North Korea\'s nuclear and missile capabilities. He has enshrined nuclear status in the constitution and abandoned reunification rhetoric. Military cooperation with Russia has provided economic relief and technological exchange opportunities.',
    affiliations: ['korean-workers-party'],
  },
  {
    id: 'russian-armed-forces',
    name: 'Russian Armed Forces',
    type: 'state',
    countries: ['russia'],
    role: 'Primary conventional military instrument of Russian state policy',
    riskContribution: 'high',
    description:
      'The Russian Armed Forces have demonstrated significant attrition in Ukraine but have adapted tactics and maintained offensive pressure through mass mobilization. Drone and missile strikes on Ukrainian civilian infrastructure remain a core element of strategy. Estimated 300,000+ casualties since February 2022.',
    affiliations: ['russian-ministry-of-defense'],
  },
  {
    id: 'irgc',
    name: 'Islamic Revolutionary Guard Corps',
    type: 'state',
    countries: ['iran'],
    role: 'Elite Iranian military and intelligence organization',
    riskContribution: 'high',
    description:
      'The IRGC is the primary instrument of Iranian strategic influence, managing the proxy network spanning Lebanon (Hezbollah), Yemen (Houthis), Iraq (PMF), and Gaza (Hamas). The IRGC Quds Force coordinates extraterritorial operations. The corps also controls significant Iranian economic assets.',
    affiliations: ['iranian-government'],
  },
  {
    id: 'peoples-liberation-army',
    name: "People's Liberation Army",
    type: 'state',
    countries: ['china', 'taiwan'],
    role: 'Chinese military force under CCP control',
    riskContribution: 'high',
    description:
      'The PLA has undergone the most significant modernization in its history under Xi. Taiwan Strait operations have increased in frequency and complexity. The PLA Navy has become a genuine blue-water force. Anti-access/area denial capabilities are designed to deter US intervention in a Taiwan contingency.',
    affiliations: ['chinese-communist-party'],
  },
  {
    id: 'volodymyr-zelensky',
    name: 'Volodymyr Zelensky',
    type: 'individual',
    countries: ['ukraine'],
    role: 'President of Ukraine',
    riskContribution: 'medium',
    description:
      'Zelensky has led Ukraine\'s resistance to Russian invasion with significant international diplomatic success. His communications strategy has been central to maintaining Western support. War-time governance has concentrated executive authority, raising concerns about democratic norms while operational necessity is acknowledged.',
    affiliations: ['ukrainian-government'],
  },
  {
    id: 'nicolas-maduro',
    name: 'Nicolás Maduro',
    type: 'individual',
    countries: ['venezuela'],
    role: 'President of Venezuela',
    riskContribution: 'medium',
    description:
      'Maduro has maintained power through a combination of security force loyalty, electoral manipulation, and repression of opposition. His government\'s economic mismanagement has produced one of the worst peacetime economic collapses in history. The Essequibo territorial claim is increasingly used as a nationalist political instrument.',
    affiliations: ['psuv', 'venezuelan-government'],
  },
]
