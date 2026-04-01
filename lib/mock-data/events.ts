import type { GeopoliticalEvent } from '../types'

export const mockEvents: GeopoliticalEvent[] = [
  {
    id: 'evt-001',
    title: 'Russia launches largest drone barrage against Ukrainian energy grid',
    summary:
      'Russia launched a coordinated attack using over 150 Shahed-136 drones and Kalibr cruise missiles targeting Ukrainian power generation and transmission infrastructure. Multiple oblasts experienced prolonged blackouts. Ukrainian air defenses intercepted approximately 60% of incoming projectiles. The attack caused significant damage to substations in Kharkiv, Zaporizhzhia, and Kyiv regions.',
    eventType: 'military',
    severity: 'critical',
    countries: ['russia', 'ukraine'],
    actors: ['russian-armed-forces'],
    date: '2026-03-29',
    sources: [
      {
        title: 'Reuters: Russia strikes Ukrainian power grid in major overnight attack',
        url: 'https://reuters.com',
        reliability: 'high',
        publishedAt: '2026-03-29',
      },
      {
        title: 'Ukrainian Air Force Command — Official Statement',
        url: 'https://povitryani.sily.mil.ua',
        reliability: 'high',
        publishedAt: '2026-03-29',
      },
      {
        title: 'ISW: Russian Offensive Campaign Assessment, March 29',
        url: 'https://understandingwar.org',
        reliability: 'high',
        publishedAt: '2026-03-29',
      },
    ],
    tags: ['energy-warfare', 'drone-attack', 'infrastructure', 'ukraine-war'],
    relatedForecasts: ['fc-001'],
    locationDescription: 'Kharkiv, Zaporizhzhia, Kyiv oblasts, Ukraine',
    impactAssessment:
      'Significant degradation of Ukrainian winter energy capacity. Civilian hardship index elevated. No assessed impact on Ukrainian military operational capability.',
  },
  {
    id: 'evt-002',
    title: 'PLA conducts largest Taiwan Strait exercise since 2022',
    summary:
      'The People\'s Liberation Army conducted a major joint exercise designated "Joint Sword-2026A" involving naval, air, and rocket forces. The exercise simulated a blockade and precision strike scenario. Three carrier battle groups participated, with PLA Navy vessels operating within 12 nautical miles of Taiwan\'s territorial waters at multiple points.',
    eventType: 'military',
    severity: 'high',
    countries: ['china', 'taiwan'],
    actors: ['peoples-liberation-army'],
    date: '2026-03-26',
    sources: [
      {
        title: 'PLA Eastern Theater Command — Official Statement',
        url: 'https://81.cn',
        reliability: 'medium',
        publishedAt: '2026-03-26',
      },
      {
        title: 'Taiwan Ministry of National Defense — Situation Report',
        url: 'https://mnd.gov.tw',
        reliability: 'high',
        publishedAt: '2026-03-26',
      },
      {
        title: 'CSIS: China Power — Taiwan Strait Exercise Analysis',
        url: 'https://chinapower.csis.org',
        reliability: 'high',
        publishedAt: '2026-03-27',
      },
    ],
    tags: ['taiwan-strait', 'military-exercise', 'pla', 'china-taiwan'],
    relatedForecasts: ['fc-002'],
    locationDescription: 'Taiwan Strait and surrounding waters',
    impactAssessment:
      'Significant signal of PLA capability and political intent. US 7th Fleet repositioned two carrier groups to monitoring positions. Regional air traffic disrupted for 36 hours.',
  },
  {
    id: 'evt-003',
    title: 'Iran announces 60% uranium enrichment milestone at Fordow',
    summary:
      'Iran\'s Atomic Energy Organization announced that enrichment at the Fordow Fuel Enrichment Plant has achieved 60% purity, bringing Iran closer to weapons-grade 90% enrichment. IAEA inspectors confirmed the enrichment level but noted access limitations. The announcement comes amid stalled negotiations over a potential JCPOA successor agreement.',
    eventType: 'political',
    severity: 'critical',
    countries: ['iran'],
    actors: ['irgc'],
    date: '2026-03-24',
    sources: [
      {
        title: 'IAEA Director General Statement on Iranian Enrichment',
        url: 'https://iaea.org',
        reliability: 'high',
        publishedAt: '2026-03-24',
      },
      {
        title: 'Reuters: Iran says it has enriched uranium to 60% at Fordow',
        url: 'https://reuters.com',
        reliability: 'high',
        publishedAt: '2026-03-24',
      },
    ],
    tags: ['nuclear', 'iran', 'iaea', 'proliferation', 'fordow'],
    relatedForecasts: ['fc-003'],
    locationDescription: 'Fordow Fuel Enrichment Plant, Iran',
    impactAssessment:
      'Significant escalation in nuclear timeline assessments. Israeli strike planning options assessed to have been revisited. US added additional sanctions on AEOI officials.',
  },
  {
    id: 'evt-004',
    title: 'North Korea successfully tests ICBM with MRV capability',
    summary:
      'North Korea conducted a test of the Hwasong-18 ICBM variant with an apparent multiple reentry vehicle (MRV) payload, significantly advancing its ability to defeat missile defense systems. The vehicle flew on a lofted trajectory and landed in Japan\'s exclusive economic zone. Japan scrambled 12 fighters and issued national emergency alerts.',
    eventType: 'military',
    severity: 'critical',
    countries: ['north-korea'],
    actors: ['kim-jong-un'],
    date: '2026-03-20',
    sources: [
      {
        title: 'Japan Joint Staff Office — Official Statement',
        url: 'https://mod.go.jp',
        reliability: 'high',
        publishedAt: '2026-03-20',
      },
      {
        title: '38 North: Analysis of DPRK Missile Test',
        url: 'https://38north.org',
        reliability: 'high',
        publishedAt: '2026-03-21',
      },
      {
        title: 'KCNA: Successful Test-Fire of New-Type ICBM Hwasong-18-2',
        url: 'https://kcna.kp',
        reliability: 'low',
        publishedAt: '2026-03-21',
      },
    ],
    tags: ['north-korea', 'icbm', 'nuclear', 'missile-test', 'mrv'],
    relatedForecasts: ['fc-004'],
    locationDescription: 'Launch site: North Pyongan Province, DPRK. Landing: Sea of Japan EEZ',
    impactAssessment:
      'Significant capability advancement assessed. MRV technology, if confirmed, degrades US terminal-phase missile defense efficacy. UN Security Council emergency session convened.',
  },
  {
    id: 'evt-005',
    title: 'Houthi forces strike Israeli commercial vessel in Red Sea',
    summary:
      'Houthi forces launched a combined anti-ship ballistic missile and drone attack on the Israeli-affiliated cargo vessel MV Polaris Star in the southern Red Sea, causing significant structural damage. The crew of 24 was evacuated. Operation Prosperity Guardian naval assets responded. Houthis claimed the attack as retaliation for Israeli operations in Gaza.',
    eventType: 'military',
    severity: 'high',
    countries: ['iran', 'israel'],
    actors: ['irgc'],
    date: '2026-03-18',
    sources: [
      {
        title: 'US CENTCOM Statement on Red Sea Incident',
        url: 'https://centcom.mil',
        reliability: 'high',
        publishedAt: '2026-03-18',
      },
      {
        title: 'UK MARITME TRADE OPERATIONS Advisory',
        url: 'https://ukmto.org',
        reliability: 'high',
        publishedAt: '2026-03-18',
      },
    ],
    tags: ['houthi', 'red-sea', 'shipping', 'iran-proxy', 'maritime'],
    relatedForecasts: ['fc-003'],
    locationDescription: 'Southern Red Sea, approximately 90nm northwest of Hudaydah',
    impactAssessment:
      'Continued elevation of global shipping costs. Insurance rates for Red Sea transit remain at 5x pre-conflict levels. Major shipping lines maintaining Cape of Good Hope rerouting.',
  },
  {
    id: 'evt-006',
    title: 'Venezuela mobilizes military forces along Guyana border',
    summary:
      'Venezuela deployed approximately 8,000 troops and armored vehicles to the Bolivar state border region adjacent to the disputed Essequibo territory. President Maduro characterized the deployment as a defensive exercise. Guyana requested emergency CARICOM consultations and placed its defense forces on elevated readiness. Exxon Mobil suspended surveying operations in disputed offshore blocks.',
    eventType: 'military',
    severity: 'high',
    countries: ['venezuela'],
    actors: ['nicolas-maduro'],
    date: '2026-03-15',
    sources: [
      {
        title: 'Reuters: Venezuela deploys troops near Guyana border amid Essequibo dispute',
        url: 'https://reuters.com',
        reliability: 'high',
        publishedAt: '2026-03-15',
      },
      {
        title: 'Guyana Ministry of Foreign Affairs Statement',
        url: 'https://minfor.gov.gy',
        reliability: 'high',
        publishedAt: '2026-03-16',
      },
    ],
    tags: ['venezuela', 'guyana', 'essequibo', 'border-dispute', 'military'],
    relatedForecasts: [],
    locationDescription: 'Bolivar State, Venezuela / Western Guyana border region',
    impactAssessment:
      'Risk of miscalculation elevated. ICJ provisional measures requested by Guyana. US Southern Command issued statement of concern.',
  },
  {
    id: 'evt-007',
    title: 'Ukrainian forces launch deep-strike operation into Belgorod Oblast',
    summary:
      'Ukrainian special operations forces, reinforced by elements of the Russian Volunteer Corps and Legion of Free Russia, conducted a multi-pronged incursion into Russia\'s Belgorod Oblast. Forces advanced up to 15km inside Russian territory and held positions for approximately 72 hours before Russian forces restored the border. Ukraine has not officially claimed the operation.',
    eventType: 'military',
    severity: 'critical',
    countries: ['ukraine', 'russia'],
    actors: ['ukrainian-armed-forces', 'russian-armed-forces'],
    date: '2026-03-12',
    sources: [
      {
        title: 'ISW: Ukraine Operations in Belgorod Oblast — Special Assessment',
        url: 'https://understandingwar.org',
        reliability: 'high',
        publishedAt: '2026-03-13',
      },
      {
        title: 'Russian Ministry of Defense Statement',
        url: 'https://mil.ru',
        reliability: 'low',
        publishedAt: '2026-03-12',
      },
      {
        title: 'Meduza: Russian volunteers confirm Belgorod operation',
        url: 'https://meduza.io',
        reliability: 'medium',
        publishedAt: '2026-03-13',
      },
    ],
    tags: ['ukraine', 'belgorod', 'cross-border', 'escalation', 'special-operations'],
    relatedForecasts: ['fc-001'],
    locationDescription: 'Belgorod Oblast, Russia',
    impactAssessment:
      'Significant signaling operation. Demonstrates Ukrainian capacity for cross-border pressure. Russian domestic political sensitivity elevated. Assessed escalation risk: moderate. Putin threatened "asymmetric response."',
  },
  {
    id: 'evt-008',
    title: 'Myanmar junta loses control of Lashio — major city falls to resistance',
    summary:
      'Lashio, the largest city in northern Shan State and site of a major military headquarters, fell to the Myanmar National Democratic Alliance Army (MNDAA) after a 3-week siege. The junta declared a state of emergency in Shan State. This represents the most significant territorial loss for the military since the 2021 coup, cutting key supply and trade routes to China.',
    eventType: 'military',
    severity: 'high',
    countries: ['myanmar'],
    actors: [],
    date: '2026-03-08',
    sources: [
      {
        title: 'Radio Free Asia: MNDAA captures Lashio Military Headquarters',
        url: 'https://rfa.org',
        reliability: 'high',
        publishedAt: '2026-03-08',
      },
      {
        title: 'Irrawaddy: Junta Loses Lashio',
        url: 'https://irrawaddy.com',
        reliability: 'high',
        publishedAt: '2026-03-09',
      },
    ],
    tags: ['myanmar', 'lashio', 'resistance', 'shan-state', 'civil-war'],
    relatedForecasts: [],
    locationDescription: 'Lashio, Northern Shan State, Myanmar',
    impactAssessment:
      'Significant junta legitimacy and capability blow. China-Myanmar economic corridor disrupted. Approximately 200,000 civilians displaced. Regional humanitarian needs elevated.',
  },
  {
    id: 'evt-009',
    title: 'Iran-backed militia conducts coordinated cyberattack on Gulf financial systems',
    summary:
      'A sophisticated cyberattack attributed to an Iran-linked threat actor designated APT-IR-7 targeted banking infrastructure across the UAE, Bahrain, and Kuwait. The attack disrupted interbank settlement systems for approximately 18 hours and exfiltrated transaction data. Forensic analysis linked the tooling to previous Iranian state operations.',
    eventType: 'cyber',
    severity: 'high',
    countries: ['iran'],
    actors: ['irgc'],
    date: '2026-03-05',
    sources: [
      {
        title: 'Mandiant Threat Intelligence: APT-IR-7 Activity Report',
        url: 'https://mandiant.com',
        reliability: 'high',
        publishedAt: '2026-03-07',
      },
      {
        title: 'UAE Central Bank Official Statement',
        url: 'https://centralbank.ae',
        reliability: 'high',
        publishedAt: '2026-03-06',
      },
    ],
    tags: ['cyber', 'iran', 'gulf', 'financial-sector', 'apt'],
    relatedForecasts: ['fc-003'],
    locationDescription: 'UAE, Bahrain, Kuwait — financial sector',
    impactAssessment:
      'Moderate financial disruption contained within 24 hours. Demonstrated continued Iranian offensive cyber capability. Assessment: likely response to sanctions pressure rather than prelude to kinetic escalation.',
  },
  {
    id: 'evt-010',
    title: 'US and Philippines conduct largest-ever Balikatan joint exercises near Taiwan Strait',
    summary:
      'The US and Philippines launched Balikatan 2026, the largest edition of the annual exercise, with over 16,000 combined personnel. Exercises explicitly included simulated maritime blockade-breaking operations and live-fire naval exercises in the Luzon Strait. China lodged formal diplomatic protests and PLA aircraft entered the Philippine ADIZ during the exercise period.',
    eventType: 'military',
    severity: 'moderate',
    countries: ['china', 'taiwan'],
    actors: ['peoples-liberation-army'],
    date: '2026-03-01',
    sources: [
      {
        title: 'US Indo-Pacific Command: Balikatan 2026 Press Release',
        url: 'https://pacom.mil',
        reliability: 'high',
        publishedAt: '2026-03-01',
      },
      {
        title: 'Philippine Department of National Defense Statement',
        url: 'https://dnd.gov.ph',
        reliability: 'high',
        publishedAt: '2026-03-01',
      },
    ],
    tags: ['us-philippines', 'balikatan', 'south-china-sea', 'deterrence', 'military-exercise'],
    relatedForecasts: ['fc-002'],
    locationDescription: 'Luzon Strait and Philippine Sea',
    impactAssessment:
      'Significant deterrence signaling operation. Demonstrates expanded US-Philippines alliance scope. China\'s ADIZ incursions assessed as deliberate counter-signaling.',
  },
  {
    id: 'evt-011',
    title: 'Ethiopian federal forces and Amhara Fano militias clash in Gondar',
    summary:
      'Heavy fighting erupted between Ethiopian National Defense Forces and Amhara Fano irregular forces in Gondar city, the second major urban confrontation since the collapse of ceasefire negotiations in January. An estimated 40,000 civilians were displaced in 48 hours. Both sides reported significant casualties.',
    eventType: 'military',
    severity: 'high',
    countries: ['ethiopia'],
    actors: ['abiy-ahmed'],
    date: '2026-02-28',
    sources: [
      {
        title: 'UN OCHA Ethiopia Situation Report',
        url: 'https://reliefweb.int',
        reliability: 'high',
        publishedAt: '2026-03-01',
      },
      {
        title: 'Reuters: Ethiopia fighting in Gondar displaces tens of thousands',
        url: 'https://reuters.com',
        reliability: 'high',
        publishedAt: '2026-02-28',
      },
    ],
    tags: ['ethiopia', 'amhara', 'fano', 'gondar', 'conflict'],
    relatedForecasts: [],
    locationDescription: 'Gondar, Amhara Region, Ethiopia',
    impactAssessment:
      'Amhara conflict front re-intensifying. Threatens Pretoria Agreement stability. Regional humanitarian organizations requesting emergency access.',
  },
]
