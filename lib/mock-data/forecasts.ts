import type { Forecast } from '../types'

export const mockForecasts: Forecast[] = [
  {
    id: 'fc-001',
    title: 'Russia-Ukraine ceasefire before Q3 2026',
    question:
      'Will a formal ceasefire agreement between Russia and Ukraine be signed and take effect before July 1, 2026?',
    status: 'active',
    probability: 18,
    confidenceLevel: 'medium',
    confidenceNotes:
      'Assessment is constrained by limited visibility into Kremlin decision-making and uncertainty about US administration policy direction. Multiple credible scenarios remain plausible.',
    rationale:
      'Both parties currently lack sufficient incentive to accept ceasefire terms the other side can agree to. Russia seeks territorial consolidation of currently occupied areas; Ukraine refuses to cede sovereignty. US pressure on Ukraine to negotiate has increased but has not yet produced a credible framework. The battlefield situation remains attritional with no decisive momentum on either side. Historical base rate for ceasefires in modern territorial wars within 4 years is approximately 15-20%.',
    uncertaintyNotes:
      'Key uncertainties: (1) US administration willingness to impose terms on Ukraine; (2) Whether Russian logistics can sustain offensive pressure through summer; (3) Possibility of battlefield surprise that changes incentive structures; (4) Internal Russian political dynamics including potential elite pressure on Putin.',
    timeHorizon: 'Q2 2026',
    targetDate: '2026-06-30',
    region: 'eastern-europe',
    countries: ['russia', 'ukraine'],
    resolutionCriteria:
      'This forecast resolves YES if: a formal written ceasefire agreement is signed by authorized representatives of both the Russian Federation and Ukraine, AND the agreement results in a demonstrable cessation of major offensive operations for a period of at least 7 consecutive days before July 1, 2026. A partial or local ceasefire does not satisfy resolution criteria.',
    versionNumber: 7,
    history: [
      {
        date: '2025-10-01',
        probability: 8,
        confidenceLevel: 'low',
        changeReason: 'Initial forecast. Limited diplomatic activity. Battlefield stalemated.',
      },
      {
        date: '2025-11-15',
        probability: 12,
        confidenceLevel: 'low',
        changeReason: 'US election results increase probability of changed approach to Ukraine conflict.',
      },
      {
        date: '2026-01-10',
        probability: 24,
        confidenceLevel: 'medium',
        changeReason:
          'New US administration signals openness to mediating negotiations. Increased diplomatic traffic observed.',
      },
      {
        date: '2026-02-01',
        probability: 28,
        confidenceLevel: 'medium',
        changeReason: 'Reports of backchannel negotiations. Ukrainian position softening on some territorial questions.',
      },
      {
        date: '2026-02-28',
        probability: 22,
        confidenceLevel: 'medium',
        changeReason:
          'Ukraine Belgorod incursion signals continued offensive orientation. Russia rejected preliminary framework.',
      },
      {
        date: '2026-03-15',
        probability: 20,
        confidenceLevel: 'medium',
        changeReason: 'Talks stalled. Russia launched major infrastructure strike package.',
      },
      {
        date: '2026-03-30',
        probability: 18,
        confidenceLevel: 'medium',
        changeReason: 'Further infrastructure attacks signal Russian preference for continued pressure over negotiation.',
      },
    ],
    evidence: [
      {
        id: 'ev-001',
        title: 'US Special Envoy appointed for Ukraine negotiations',
        description: 'State Department announced dedicated envoy, signaling institutional commitment to mediation.',
        direction: 'supporting',
        weight: 'moderate',
        addedAt: '2026-01-10',
      },
      {
        id: 'ev-002',
        title: 'Russian March energy infrastructure strikes',
        description:
          'Large-scale strikes signal continued offensive military orientation rather than negotiating posture.',
        direction: 'opposing',
        weight: 'strong',
        addedAt: '2026-03-29',
      },
      {
        id: 'ev-003',
        title: 'Ukraine Belgorod cross-border operation',
        description: 'Operation signals Ukrainian military still pursuing active pressure strategy.',
        direction: 'opposing',
        weight: 'moderate',
        addedAt: '2026-03-12',
      },
    ],
    relatedEvents: ['evt-001', 'evt-007'],
    tags: ['russia-ukraine', 'ceasefire', 'diplomacy', 'eastern-europe'],
    createdAt: '2025-10-01',
    lastUpdated: '2026-03-30',
  },
  {
    id: 'fc-002',
    title: 'Taiwan Strait military incident escalation by end of 2026',
    question:
      'Will a military incident in or near the Taiwan Strait result in casualties or significant material loss for any party before December 31, 2026?',
    status: 'active',
    probability: 32,
    confidenceLevel: 'low',
    confidenceNotes:
      'Low confidence reflects genuine uncertainty about PLA decision-making, the role of miscalculation, and rapidly evolving exercise patterns. This is a high-impact, moderate-probability scenario with poor predictive indicators.',
    rationale:
      'PLA exercises near Taiwan have increased significantly in frequency, complexity, and geographic scope. The March 2026 Joint Sword exercise demonstrated advanced blockade simulation capabilities. However, Xi Jinping is assessed to prefer coercion over kinetic action absent a triggering event (formal independence declaration, etc.). The risk of miscalculation during exercises is real but historically has been managed. US-Philippines alliance expansion and increased forward presence create more frequent friction points.',
    uncertaintyNotes:
      'Key uncertainties: (1) Whether any Taiwan political statement or arms deal could trigger PRC response; (2) Miscalculation risk during large exercises near crowded airspace; (3) Whether US force posture changes affect PLA red lines; (4) Xi Jinping health and political succession pressures.',
    timeHorizon: 'End of 2026',
    targetDate: '2026-12-31',
    region: 'east-asia',
    countries: ['china', 'taiwan'],
    resolutionCriteria:
      'Resolves YES if: any military engagement occurs between PLA forces and either ROC or US/allied forces that results in (a) confirmed casualties on any side, OR (b) destruction or significant damage to military assets. Naval vessel collisions or aircraft intercepts resulting in damage count. Exercises, incursions, and warning shots without material impact do not satisfy criteria.',
    versionNumber: 5,
    history: [
      {
        date: '2025-09-01',
        probability: 20,
        confidenceLevel: 'low',
        changeReason: 'Initial assessment. Baseline PLA exercise tempo elevated but below crisis threshold.',
      },
      {
        date: '2025-12-01',
        probability: 25,
        confidenceLevel: 'low',
        changeReason: 'Taiwan arms deal announced. PLA exercises intensified in response.',
      },
      {
        date: '2026-02-01',
        probability: 28,
        confidenceLevel: 'low',
        changeReason: 'Balikatan exercise scope expanded significantly. US-Philippines posture more forward.',
      },
      {
        date: '2026-03-28',
        probability: 32,
        confidenceLevel: 'low',
        changeReason:
          'Joint Sword 2026A scale exceeded previous exercises. Near-territorial water incursions noted. Probability increased.',
      },
    ],
    relatedEvents: ['evt-002', 'evt-010'],
    tags: ['taiwan', 'china', 'military', 'taiwan-strait', 'pla'],
    createdAt: '2025-09-01',
    lastUpdated: '2026-03-28',
  },
  {
    id: 'fc-003',
    title: 'Iran nuclear negotiations resume in Q2 2026',
    question:
      'Will formal multilateral negotiations on a successor agreement to the JCPOA resume between Iran and P5+1 parties before July 1, 2026?',
    status: 'active',
    probability: 41,
    confidenceLevel: 'medium',
    confidenceNotes:
      'Medium confidence. There are credible signals on both sides suggesting interest in talks, but significant obstacles remain. The assessment is sensitive to US domestic political dynamics and Iranian domestic factional competition.',
    rationale:
      'Iran\'s nuclear program advancement to 60% enrichment has increased international pressure for a negotiated solution. The IAEA has flagged significant concerns about Iranian cooperation. US sanctions pressure is creating economic pain. However, the gap between Iranian demands (full sanctions removal upfront) and US conditions (step-by-step approach) remains large. Backchannel activity through Oman has reportedly increased in Q1 2026. Iran has an economic interest in talks but hardliners retain veto power.',
    uncertaintyNotes:
      'Critical dependencies: (1) Whether Oman backchannel produces a framework; (2) Iranian Supreme Leader Khamenei health and factional politics; (3) US willingness to offer sanctions relief as confidence-building measure; (4) Impact of Iran-linked cyberattacks and Houthi activity on US negotiating posture.',
    timeHorizon: 'Q2 2026',
    targetDate: '2026-06-30',
    region: 'middle-east',
    countries: ['iran'],
    resolutionCriteria:
      'Resolves YES if: official delegations from Iran and at least two P5 member states hold formal, acknowledged negotiating sessions explicitly concerning Iranian nuclear program limitations in exchange for sanctions relief, before July 1, 2026. Back-channel talks do not satisfy criteria. The session must be publicly acknowledged by at least one party.',
    versionNumber: 4,
    history: [
      {
        date: '2025-11-01',
        probability: 30,
        confidenceLevel: 'low',
        changeReason: 'Initial forecast. Limited diplomatic activity. Iran focused on Gaza support.',
      },
      {
        date: '2026-01-15',
        probability: 38,
        confidenceLevel: 'medium',
        changeReason: 'Reports of Oman backchannel activity. Iranian FM signals openness.',
      },
      {
        date: '2026-02-20',
        probability: 44,
        confidenceLevel: 'medium',
        changeReason: 'US envoy met with Iranian counterparts in Geneva. Positive signals.',
      },
      {
        date: '2026-03-25',
        probability: 41,
        confidenceLevel: 'medium',
        changeReason:
          'Fordow enrichment announcement complicated diplomatic track. Reassessed probability downward slightly.',
      },
    ],
    relatedEvents: ['evt-003', 'evt-005', 'evt-009'],
    tags: ['iran', 'nuclear', 'jcpoa', 'diplomacy', 'nonproliferation'],
    createdAt: '2025-11-01',
    lastUpdated: '2026-03-25',
  },
  {
    id: 'fc-004',
    title: 'North Korea conducts nuclear test by end of 2026',
    question:
      'Will North Korea detonate a nuclear device in an underground test, constituting its 7th nuclear test, before December 31, 2026?',
    status: 'active',
    probability: 27,
    confidenceLevel: 'low',
    confidenceNotes:
      'Low confidence given opacity of DPRK decision-making. Tunnel activity at Punggye-ri is observable via satellite but does not confirm imminent test. Test decision is assessed to be a personal decision of Kim Jong-un with very few decision-makers involved.',
    rationale:
      'North Korea has completed preparations at the Punggye-ri test site for a potential 7th nuclear test. Kim Jong-un has strong incentives to test: validating miniaturized warhead designs for ICBM MRV capability, signaling to domestic audience, and demonstrating leverage in any future diplomacy. However, testing has strategic costs (Chinese pressure, accelerated South Korean and Japanese defense spending). The DPRK-Russia cooperation deepening may reduce short-term incentive to test if alternative benefits are flowing.',
    uncertaintyNotes:
      'Key uncertainties: (1) Whether diplomatic opportunities (Trump interest) constrain test; (2) Chinese pressure effectiveness; (3) Whether MRV ICBM test substitutes for nuclear test; (4) Kim Jong-un health and domestic political calendar.',
    timeHorizon: 'End of 2026',
    targetDate: '2026-12-31',
    region: 'east-asia',
    countries: ['north-korea'],
    resolutionCriteria:
      'Resolves YES if: seismic monitoring agencies (CTBTO, USGS, or equivalent) detect an underground seismic event at or near the Punggye-ri test site consistent with a nuclear detonation (magnitude 4.0+ on Richter scale), AND North Korea officially confirms or the international community reaches consensus attribution to a nuclear test.',
    versionNumber: 3,
    history: [
      {
        date: '2025-10-15',
        probability: 22,
        confidenceLevel: 'low',
        changeReason: 'Initial forecast. Punggye-ri tunnels assessed ready. No imminent signals.',
      },
      {
        date: '2026-01-01',
        probability: 25,
        confidenceLevel: 'low',
        changeReason: 'Kim New Year speech hardened rhetoric. Test probability edged up.',
      },
      {
        date: '2026-03-22',
        probability: 27,
        confidenceLevel: 'low',
        changeReason: 'ICBM MRV test increases capability validation pressure. Test probability marginally up.',
      },
    ],
    relatedEvents: ['evt-004'],
    tags: ['north-korea', 'nuclear-test', 'dprk', 'proliferation'],
    createdAt: '2025-10-15',
    lastUpdated: '2026-03-22',
  },
  {
    id: 'fc-005',
    title: 'Venezuela military action in Essequibo before Q4 2026',
    question:
      'Will Venezuelan military forces conduct a kinetic operation (incursion, seizure, or lethal engagement) inside territory administered by Guyana before October 1, 2026?',
    status: 'active',
    probability: 12,
    confidenceLevel: 'medium',
    confidenceNotes:
      'Medium confidence. Venezuela\'s military capability for sustained operations is limited, and the international cost of overt aggression is assessed as a significant deterrent. However, the Maduro government\'s domestic political needs create incentive for escalatory signaling.',
    rationale:
      'Venezuela\'s Essequibo claim is a domestic political tool for the Maduro government to distract from economic crisis. The March 2026 troop deployment is consistent with prior escalation cycles that have historically de-escalated. Venezuelan Armed Forces are assessed to lack the logistical capacity for sustained operations in the dense jungle terrain of Essequibo. International isolation would worsen dramatically. However, small-scale incidents (illegal crossings, seizure of survey vessels) are plausible below the threshold of this forecast.',
    uncertaintyNotes:
      'Key uncertainties: (1) Venezuelan domestic political desperation — a sufficiently cornered Maduro might gamble; (2) Whether US/Brazil signaling is sufficient deterrent; (3) Risk of unauthorized actions by lower-level commanders; (4) Guyana counter-provocation.',
    timeHorizon: 'Q3 2026',
    targetDate: '2026-09-30',
    region: 'latin-america',
    countries: ['venezuela'],
    resolutionCriteria:
      'Resolves YES if: Venezuelan military personnel are confirmed to have entered territory currently administered by Guyana with weapons, AND the incursion is (a) official/acknowledged OR (b) results in any armed engagement. Economic acts (oil concessions, etc.) do not resolve this forecast.',
    versionNumber: 2,
    history: [
      {
        date: '2025-12-15',
        probability: 8,
        confidenceLevel: 'medium',
        changeReason:
          'Initial forecast following ICJ proceedings. Military action assessed unlikely but non-negligible.',
      },
      {
        date: '2026-03-16',
        probability: 12,
        confidenceLevel: 'medium',
        changeReason:
          'Venezuela troop mobilization to border increases probability of incident. Revised upward.',
      },
    ],
    relatedEvents: ['evt-006'],
    tags: ['venezuela', 'guyana', 'essequibo', 'latin-america', 'territorial-dispute'],
    createdAt: '2025-12-15',
    lastUpdated: '2026-03-16',
  },
  {
    id: 'fc-006',
    title: 'Myanmar junta collapse or negotiated settlement by end of 2026',
    question:
      'Will the Myanmar military junta either (a) collapse as a functioning national government, losing control of at least 3 of 7 administrative regions/states, OR (b) enter formal peace negotiations with resistance coalition, before December 31, 2026?',
    status: 'active',
    probability: 23,
    confidenceLevel: 'low',
    confidenceNotes:
      'Low confidence given high uncertainty about pace of resistance operations, Chinese pressure on both sides, and junta internal cohesion. The situation is evolving rapidly and the forecast window is long.',
    rationale:
      'The junta has lost effective control of significant territory in Shan, Rakhine, Chin, and Sagaing states. However, key population centers (Mandalay, Yangon) remain under junta control. The junta retains air power and can cause significant damage even without territorial control. Resistance forces lack coordination for a decisive national offensive. China\'s preference for a negotiated settlement provides some junta protection. The scenario of formal talks is historically unlikely for Myanmar military culture.',
    uncertaintyNotes:
      'Key uncertainties: (1) Whether Mandalay front opens in 2026; (2) Chinese mediation effectiveness; (3) Internal junta coup risk; (4) Resistance coalition cohesion vs. ethnic group competition.',
    timeHorizon: 'End of 2026',
    targetDate: '2026-12-31',
    region: 'southeast-asia',
    countries: ['myanmar'],
    resolutionCriteria:
      'Resolves YES if either: (A) Resistance forces are confirmed to control at least 3 of Myanmar\'s 14 states/regions at the administrative-capital level, with junta forces absent; OR (B) An internationally acknowledged ceasefire and negotiating process begins with participation from the National Unity Government and military junta.',
    versionNumber: 2,
    history: [
      {
        date: '2026-01-01',
        probability: 15,
        confidenceLevel: 'low',
        changeReason: 'Initial forecast. Resistance gaining momentum but decisive collapse assessed unlikely.',
      },
      {
        date: '2026-03-10',
        probability: 23,
        confidenceLevel: 'low',
        changeReason:
          'Lashio fall is most significant junta territorial loss to date. Resistance operational coherence improving. Revised upward.',
      },
    ],
    relatedEvents: ['evt-008'],
    tags: ['myanmar', 'civil-war', 'junta', 'resistance', 'southeast-asia'],
    createdAt: '2026-01-01',
    lastUpdated: '2026-03-10',
  },
]
