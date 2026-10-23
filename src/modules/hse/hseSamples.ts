import { HazardObservation, PositiveObservation, HseInspectionReport, RiskLevel } from './hseTypes';
import { getApplicableStandards } from './hseStandards';

export interface HseSampleScenario {
  id: string;
  title: string;
  industry: string;
  workArea: string;
  activity: string;
  emoji: string;
  description: string;
  getSvg: () => string;
  defaultObservations: HazardObservation[];
  defaultPositiveObservations: PositiveObservation[];
  defaultVerificationItems: string[];
  defaultOverallRisk: RiskLevel;
}

export const HSE_SAMPLE_SCENARIOS: HseSampleScenario[] = [
  {
    id: 'structural_steel_erection',
    title: 'Structural Steel Erection & Crane Lifting',
    industry: 'Commercial Construction & Industrial Framework',
    workArea: 'Commercial Tower - Sector 3 Grid B4-B8',
    activity: 'Structural steel erection, mobile crane hoisting & MEWP bolt-up',
    emoji: '🏗️',
    description: 'Steel framework with mobile crane hoisting 24m I-beam, articulating MEWP basket, riggers, and ground laydown dunnage',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700" style="background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- Industrial Sky Backdrop -->
        <rect x="0" y="0" width="1000" height="480" fill="#1e293b"/>
        <rect x="0" y="480" width="1000" height="220" fill="#334155"/>
        <line x1="0" y1="480" x2="1000" y2="480" stroke="#475569" stroke-width="3"/>

        <!-- Structural Steel Framework Grid (Columns & Girders in Orange-Red Oxide Primer) -->
        <!-- Vertical Column 1 -->
        <rect x="120" y="100" width="22" height="380" fill="#c2410c" stroke="#9a3412" stroke-width="2"/>
        <!-- Vertical Column 2 -->
        <rect x="320" y="100" width="22" height="380" fill="#c2410c" stroke="#9a3412" stroke-width="2"/>
        <!-- Vertical Column 3 -->
        <rect x="520" y="100" width="22" height="380" fill="#c2410c" stroke="#9a3412" stroke-width="2"/>
        <!-- Horizontal Beam Tier 1 -->
        <rect x="110" y="220" width="440" height="18" fill="#ea580c" stroke="#c2410c" stroke-width="2"/>
        <!-- Horizontal Beam Tier 2 -->
        <rect x="110" y="340" width="440" height="18" fill="#ea580c" stroke="#c2410c" stroke-width="2"/>
        <!-- Diagonal Cross Bracing -->
        <line x1="131" y1="238" x2="331" y2="340" stroke="#9a3412" stroke-width="5" stroke-dasharray="8,4"/>
        <line x1="331" y1="238" x2="131" y2="340" stroke="#9a3412" stroke-width="5" stroke-dasharray="8,4"/>

        <!-- Mobile Telescopic Crane (Right Side) -->
        <rect x="740" y="400" width="220" height="90" rx="12" fill="#eab308" stroke="#ca8a04" stroke-width="3"/>
        <rect x="880" y="360" width="70" height="60" rx="8" fill="#0f172a"/> <!-- Operator Cab -->
        <!-- Heavy Crane Wheels -->
        <circle cx="780" cy="500" r="28" fill="#020617"/>
        <circle cx="840" cy="500" r="28" fill="#020617"/>
        <circle cx="900" cy="500" r="28" fill="#020617"/>
        <!-- Outrigger Jack with Timber Spreader Pad -->
        <rect x="710" y="470" width="30" height="40" fill="#475569"/>
        <rect x="680" y="505" width="80" height="16" fill="#ca8a04" stroke="#0f172a" stroke-width="2"/>

        <!-- Crane Telescopic Boom pointing toward structural frame -->
        <line x1="780" y1="380" x2="350" y2="60" stroke="#eab308" stroke-width="28" stroke-linecap="round"/>
        <line x1="780" y1="380" x2="350" y2="60" stroke="#fef08a" stroke-width="8" stroke-linecap="round"/>

        <!-- Hoist Wire & Rigging Block -->
        <line x1="350" y1="60" x2="350" y2="150" stroke="#f8fafc" stroke-width="3"/>
        <circle cx="350" cy="155" r="9" fill="#dc2626"/>

        <!-- Suspended Heavy Steel I-Beam (In Mid-Air Placement) -->
        <rect x="180" y="165" width="340" height="26" rx="3" fill="#ea580c" stroke="#9a3412" stroke-width="3"/>
        <line x1="180" y1="178" x2="520" y2="178" stroke="#f97316" stroke-width="4"/>
        <!-- 2-Leg Synthetic Wire Slings -->
        <line x1="350" y1="155" x2="230" y2="165" stroke="#94a3b8" stroke-width="4"/>
        <line x1="350" y1="155" x2="470" y2="165" stroke="#94a3b8" stroke-width="4"/>

        <!-- Tag Line extending from suspended beam to ground rigger -->
        <line x1="510" y1="185" x2="620" y2="440" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4"/>

        <!-- Mobile Elevating Work Platform (MEWP / Boom Lift) -->
        <rect x="580" y="440" width="80" height="45" rx="6" fill="#2563eb"/>
        <circle cx="600" cy="495" r="14" fill="#0f172a"/>
        <circle cx="640" cy="495" r="14" fill="#0f172a"/>
        <!-- Articulated Boom Knuckle & Arm reaching up to Level 2 connection -->
        <line x1="620" y1="440" x2="570" y2="330" stroke="#3b82f6" stroke-width="12"/>
        <line x1="570" y1="330" x2="480" y2="240" stroke="#60a5fa" stroke-width="10"/>
        <!-- MEWP Platform Basket -->
        <rect x="440" y="220" width="55" height="40" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
        <line x1="440" y1="235" x2="495" y2="235" stroke="#60a5fa" stroke-width="2"/>
        <!-- Worker inside MEWP (Ironworker with harness tethered) -->
        <circle cx="465" cy="210" r="7" fill="#fef08a"/>
        <rect x="458" y="217" width="14" height="22" rx="3" fill="#f97316"/>
        <line x1="465" y1="225" x2="485" y2="245" stroke="#22c55e" stroke-width="2"/> <!-- Lanyard attached to anchor -->

        <!-- Ground Level Worker / Rigger walking directly under suspended load envelope (LINE OF FIRE) -->
        <circle cx="310" cy="425" r="8" fill="#fef08a"/>
        <rect x="303" y="433" width="14" height="25" rx="3" fill="#f97316"/>
        <line x1="307" y1="458" x2="303" y2="488" stroke="#0f172a" stroke-width="4"/>
        <line x1="313" y1="458" x2="317" y2="488" stroke="#0f172a" stroke-width="4"/>

        <!-- Ground Rigger safely holding Tag Line -->
        <circle cx="630" cy="430" r="8" fill="#fef08a"/>
        <rect x="623" y="438" width="14" height="25" rx="3" fill="#3b82f6"/>
        <line x1="627" y1="463" x2="625" y2="488" stroke="#0f172a" stroke-width="4"/>
        <line x1="633" y1="463" x2="635" y2="488" stroke="#0f172a" stroke-width="4"/>

        <!-- Ground Laydown Steel Storage without proper timber blocking (Dunnage / Trip Hazard) -->
        <rect x="50" y="470" width="120" height="14" fill="#9a3412" stroke="#7c2d12" stroke-width="2"/>
        <rect x="60" y="456" width="100" height="14" fill="#9a3412" stroke="#7c2d12" stroke-width="2"/>
        <text x="110" y="445" fill="#f8fafc" font-size="10" font-weight="bold" text-anchor="middle">Steel Laydown Stack</text>
      </svg>
    `,
    defaultObservations: [
      {
        id: 'HAZ-01',
        markerNumber: 1,
        xPercent: 31,
        yPercent: 62,
        hazardCategory: 'Lifting & Rigging',
        title: 'Personnel Positioned Directly Beneath Suspended Steel Beam ("Line of Fire")',
        observedCondition: 'Operative traversing directly beneath 340kg hoisted steel beam within drop shadow radius without barricaded exclusion zone.',
        potentialConsequences: 'Catastrophic crush injury or fatality in the event of rigging failure, slippage, or crane hoist brake failure.',
        exposedParties: 'Ground operative traversing erection grid line.',
        evidenceClassification: 'Visible Finding',
        existingControls: 'Operative wearing hard hat and hi-vis vest.',
        missingOrQuestionableControls: 'Physical exclusion zone barricade and dedicated lifting banksman enforcing line-of-fire clearance.',
        likelihood: 4,
        severity: 5,
        riskScore: 20,
        riskRating: 'Critical',
        immediateAction: 'Halt crane movement immediately; direct operative out of the suspended load envelope; establish rigid exclusion perimeter.',
        engineeringControls: 'Demarcate mobile crane lifting radius with physical barriers; configure slew limiters.',
        administrativeControls: 'Review lifting plan exclusion zone with all erection crews; enforce ASME B30.5 and OSHA 1926.753.',
        ppeRequired: 'EN 397 safety helmet, high-visibility vest, steel-toe boots.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Lifting & Rigging'),
        fieldVerificationQuestions: [
          'Is an approved Lift Plan and Appointed Person calculation available for this specific beam weight and radius?',
          'Has pre-lift toolbox talk established the designated exclusion boundary?',
        ],
        actionAssignee: 'Lifting Supervisor (P. Gallagher)',
        actionTargetDate: 'Immediate',
        actionStatus: 'Open',
      },
      {
        id: 'HAZ-02',
        markerNumber: 2,
        xPercent: 47,
        yPercent: 34,
        hazardCategory: 'Working at Height',
        title: 'MEWP Basket Proximity to Swinging Suspended Member (Pinch & Entrapment Exposure)',
        observedCondition: 'Boom lift basket positioned in tight interface adjacent to moving steel beam and fixed column connection point.',
        potentialConsequences: 'Crush or overhead entrapment of ironworker between basket guardrail and structural members.',
        exposedParties: 'Ironworker inside MEWP basket.',
        evidenceClassification: 'Potential Concern',
        existingControls: 'Worker in basket appears tethered to anchor point.',
        missingOrQuestionableControls: 'Overhead anti-entrapment secondary guarding bar or proximity sensor on MEWP.',
        likelihood: 3,
        severity: 4,
        riskScore: 12,
        riskRating: 'High',
        immediateAction: 'Position MEWP basket on outer clear side of connection; do not reach across suspended beam path.',
        engineeringControls: 'Deploy MEWPs fitted with overhead secondary guarding frames (anti-entrapment bars).',
        administrativeControls: 'Ensure MEWP operator has valid IPAF 3b certification and ground rescue plan is rehearsed.',
        ppeRequired: 'Full body harness with short restraint lanyard clipped to approved basket anchor point.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Working at Height'),
        fieldVerificationQuestions: [
          'Is an emergency ground lowering rescue procedure documented and tested for this boom lift location?',
          'Has the MEWP received its statutory 6-month LOLER thorough examination?',
        ],
        actionAssignee: 'Erection Foreman (C. Vance)',
        actionTargetDate: 'Today by 15:00',
        actionStatus: 'Open',
      },
      {
        id: 'HAZ-03',
        markerNumber: 3,
        xPercent: 11,
        yPercent: 67,
        hazardCategory: 'Housekeeping & Slips/Trips',
        title: 'Ground Steel Member Laydown Storage Lacking Adequate Dunnage and Chocking',
        observedCondition: 'Structural steel components stored directly at ground edge with unorganized timber blocking, creating rolling and trip hazards.',
        potentialConsequences: 'Steel roll-off injury, foot crush, or tripping of riggers handling tag lines.',
        exposedParties: 'Riggers, crane signalers, and ground personnel.',
        evidenceClassification: 'Visible Finding',
        existingControls: 'Timber blocks present under parts of members.',
        missingOrQuestionableControls: 'Uniform timber dunnage bearers and wedges to prevent rolling.',
        likelihood: 3,
        severity: 3,
        riskScore: 9,
        riskRating: 'Medium',
        immediateAction: 'Install timber wedges to chock steel sections; align beams on level hardwood dunnage.',
        engineeringControls: 'Designate leveled, compacted laydown racks with marked pedestrian walkways.',
        administrativeControls: 'Brief delivery drivers and logistics crew on safe steel stacking limits per OSHA 1926.250.',
        ppeRequired: 'Metatarsal safety footwear and cut-resistant gloves.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Housekeeping & Slips/Trips'),
        fieldVerificationQuestions: [
          'Is ground compaction certified for temporary laydown of heavy structural members?',
        ],
        actionAssignee: 'Site Logistics Lead (M. Al-Zahrani)',
        actionTargetDate: 'Next Shift',
        actionStatus: 'Open',
      },
    ],
    defaultPositiveObservations: [
      {
        id: 'POS-01',
        title: 'Synthetic Tag Line Actively Used for Load Guidance',
        description: 'Ground rigger is utilizing a continuous tag line to guide beam rotation without placing hands on suspended steel.',
        category: 'Rigging Best Practice',
        xPercent: 63,
        yPercent: 62,
      },
      {
        id: 'POS-02',
        title: 'Crane Outrigger Deployed on Hardwood Spreader Mat',
        description: 'Telescopic crane jack is positioned on substantial load-distributing spreader pad over compacted ground.',
        category: 'Crane Stability',
        xPercent: 71,
        yPercent: 72,
      },
      {
        id: 'POS-03',
        title: 'Ironworker Inside MEWP Wearing Fall Arrest Harness',
        description: 'Elevated worker in MEWP platform is equipped with harness visibly attached to certified basket anchor.',
        category: 'Working at Height',
        xPercent: 47,
        yPercent: 31,
      },
    ],
    defaultVerificationItems: [
      'Confirm written Steel Erection Site-Specific Safety Plan (OSHA 1926.752) signed off by structural engineer.',
      'Verify 2-bolt minimum connection rule is strictly observed before crane unhooks from structural members.',
      'Confirm daily crane pre-operational inspection checklist completed and signed by crane operator.',
    ],
    defaultOverallRisk: 'High',
  },
  {
    id: 'excavation_dewatering',
    title: 'Excavation & Dewatering Pit',
    industry: 'Infrastructure & Civil Construction',
    workArea: 'Deep Foundation Zone - Sector 4B',
    activity: 'Excavation dewatering & trench preparation',
    emoji: '🚜',
    description: 'Deep trench with portable dewatering pump, unsecured hose route, and edge protection gap',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700" style="background:#8b6b47;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- Ground Surface -->
        <rect x="0" y="0" width="1000" height="280" fill="#a38865"/>
        <rect x="0" y="270" width="1000" height="15" fill="#6d5438"/>

        <!-- Sky / Horizon -->
        <rect x="0" y="0" width="1000" height="120" fill="#93c5fd" opacity="0.4"/>
        <line x1="0" y1="120" x2="1000" y2="120" stroke="#78716c" stroke-width="2"/>

        <!-- Distant Safety Sign -->
        <rect x="60" y="70" width="100" height="40" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <rect x="64" y="74" width="92" height="14" fill="#3b82f6"/>
        <text x="110" y="85" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">DEEP EXCAVATION</text>
        <text x="110" y="103" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">AUTHORIZED ONLY</text>

        <!-- Trench Cut (Deep Pit) -->
        <polygon points="180,280 820,280 760,660 240,660" fill="#543d2b"/>
        <!-- Pit Wall Strata -->
        <line x1="200" y1="360" x2="795" y2="360" stroke="#3e2d1f" stroke-width="3" stroke-dasharray="15,8"/>
        <line x1="220" y1="460" x2="775" y2="460" stroke="#3e2d1f" stroke-width="3" stroke-dasharray="20,10"/>
        <line x1="235" y1="560" x2="765" y2="560" stroke="#3e2d1f" stroke-width="3" stroke-dasharray="10,5"/>

        <!-- Water Pool in Trench Floor (Dewatering Need) -->
        <ellipse cx="480" cy="625" rx="200" ry="25" fill="#38bdf8" opacity="0.6"/>
        <ellipse cx="480" cy="625" rx="180" ry="18" fill="#0284c7" opacity="0.4"/>

        <!-- Spoil Pile (Too close to lip: < 1m) -->
        <path d="M 50,280 Q 120,150 190,280 Z" fill="#78593a" stroke="#543d2b" stroke-width="3"/>
        <text x="120" y="225" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">Spoil Pile (&lt; 0.6m)</text>

        <!-- Incomplete Warning Barrier (Missing on Right Edge) -->
        <!-- Post 1 & 2 on left edge -->
        <rect x="170" y="200" width="8" height="80" fill="#f97316"/>
        <rect x="230" y="200" width="8" height="80" fill="#f97316"/>
        <line x1="174" y1="210" x2="234" y2="210" stroke="#facc15" stroke-width="6"/>
        <line x1="174" y1="240" x2="234" y2="240" stroke="#facc15" stroke-width="6"/>
        <!-- Notice gap on right: 400px unprotected lip! -->

        <!-- Portable Dewatering Pump on Edge -->
        <rect x="710" y="240" width="70" height="50" rx="6" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
        <circle cx="745" cy="265" r="14" fill="#1e293b"/>
        <text x="745" y="270" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">PUMP</text>
        <line x1="775" y1="250" x2="795" y2="240" stroke="#475569" stroke-width="4"/>

        <!-- Unsecured Suction Hose trailing down into trench -->
        <path d="M 720,280 C 680,350 620,450 560,620" fill="none" stroke="#22c55e" stroke-width="12" stroke-linecap="round"/>
        <path d="M 720,280 C 680,350 620,450 560,620" fill="none" stroke="#15803d" stroke-width="4" stroke-dasharray="10,6"/>

        <!-- Discharge Hose across walkway (Trip hazard) -->
        <path d="M 780,270 Q 860,255 980,265" fill="none" stroke="#3b82f6" stroke-width="10" stroke-linecap="round"/>

        <!-- Worker in Trench without shoring or ladder visible -->
        <!-- Worker Body -->
        <rect x="375" y="550" width="24" height="45" rx="4" fill="#f97316"/>
        <circle cx="387" cy="535" r="10" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
        <ellipse cx="387" cy="528" rx="12" ry="5" fill="#facc15"/> <!-- Hardhat -->
        <!-- Legs in water -->
        <line x1="382" y1="595" x2="382" y2="625" stroke="#1e293b" stroke-width="6"/>
        <line x1="392" y1="595" x2="392" y2="625" stroke="#1e293b" stroke-width="6"/>

        <!-- Plant Excavator Track on bank edge (Vibration/collapse risk) -->
        <rect x="760" y="160" width="160" height="40" rx="10" fill="#1e293b"/>
        <circle cx="780" cy="180" r="12" fill="#64748b"/>
        <circle cx="810" cy="180" r="12" fill="#64748b"/>
        <circle cx="840" cy="180" r="12" fill="#64748b"/>
        <circle cx="870" cy="180" r="12" fill="#64748b"/>
        <circle cx="900" cy="180" r="12" fill="#64748b"/>
        <path d="M 800,160 L 840,110 L 890,110 L 920,160 Z" fill="#eab308"/>
        <!-- Boom extending near edge -->
        <line x1="820" y1="120" x2="750" y2="190" stroke="#ca8a04" stroke-width="10"/>

        <!-- Water ingress seepage line on left trench wall -->
        <path d="M 270,410 Q 290,440 280,470 Q 300,500 295,540" fill="none" stroke="#60a5fa" stroke-width="3" stroke-dasharray="4,4"/>

        <!-- Site metadata stamp in bottom corner -->
        <rect x="20" y="640" width="200" height="40" rx="6" fill="#000000" opacity="0.6"/>
        <text x="30" y="658" fill="#ffffff" font-size="11" font-weight="bold">SITE: Sector 4B Excavation</text>
        <text x="30" y="672" fill="#94a3b8" font-size="10">GPS: 25.1972° N, 55.2744° E</text>
      </svg>
    `,
    defaultObservations: [
      {
        id: 'HAZ-01',
        markerNumber: 1,
        xPercent: 55,
        yPercent: 38,
        hazardCategory: 'Excavation & Trenching',
        title: 'Unprotected Excavation Edge & Inadequate Protective System',
        observedCondition: 'Deep trench (>2.5m vertical cut) with no trench box, shoring, benching, or edge guardrails along the northern boundary.',
        potentialConsequences: 'Trench wall collapse, engulfment of worker below, falls from height for surface personnel.',
        exposedParties: 'Ground workers in trench base and surface workers walking near pit lip.',
        evidenceClassification: 'Visible Finding',
        existingControls: 'Partial temporary barrier installed on north-west section only.',
        missingOrQuestionableControls: 'Missing edge guardrails on active bank, lack of trench shield or engineered shoring system.',
        likelihood: 4,
        severity: 5,
        riskScore: 20,
        riskRating: 'Critical',
        immediateAction: 'Cease work in trench immediately; erect continuous rigid 1.1m double-guardrails with toe-boards around entire perimeter.',
        engineeringControls: 'Install certified aluminum hydraulic shoring or pre-fabricated trench box before re-entry.',
        administrativeControls: 'Implement daily excavation inspection sign-off by appointed Competent Person; post warning signage.',
        ppeRequired: 'High-visibility safety vest, safety boots, hard hat.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Excavation & Trenching'),
        fieldVerificationQuestions: [
          'Has a soil classification (Type A, B, or C) been performed by a qualified geotechnical engineer?',
          'Is an excavation permit-to-work active and signed off for today?',
          'What is the certified trench depth and water table level?',
        ],
        actionAssignee: 'Civils Works Superintendent (Ahmed R.)',
        actionTargetDate: 'Immediate (Within 2 Hours)',
        actionStatus: 'Open',
      },
      {
        id: 'HAZ-02',
        markerNumber: 2,
        xPercent: 12,
        yPercent: 34,
        hazardCategory: 'Excavation & Trenching',
        title: 'Excavated Spoil Pile Positioned Within Minimum Safe Edge Margin',
        observedCondition: 'Excavated soil mound is piled immediately adjacent to the trench edge (distance < 0.6m from lip).',
        potentialConsequences: 'Surcharge load increases risk of sidewall slumping; loose rock/clods rolling onto worker below.',
        exposedParties: 'Worker inside trench floor beneath spoil crest.',
        evidenceClassification: 'Visible Finding',
        existingControls: 'None visible along spoil toe.',
        missingOrQuestionableControls: 'Failure to maintain 1-meter (or 2-foot OSHA) clear setback distance or toe-barrier.',
        likelihood: 4,
        severity: 4,
        riskScore: 16,
        riskRating: 'High',
        immediateAction: 'Relocate spoil pile back at least 1.0m from trench lip using mechanical backhoe.',
        engineeringControls: 'Establish permanent physical stop-block or setback markers painted 1.5m from trench crest.',
        administrativeControls: 'Brief excavator operators on minimum spoil setback clearances.',
        ppeRequired: 'Standard site PPE.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Excavation & Trenching'),
        fieldVerificationQuestions: [
          'What is the measured distance from the crest of the slope to the toe of the spoil pile?',
          'Is any heavy machinery operating on the same side as the spoil mound?',
        ],
        actionAssignee: 'Earthmoving Foreman (K. Patel)',
        actionTargetDate: 'Today, 14:00',
        actionStatus: 'Open',
      },
      {
        id: 'HAZ-03',
        markerNumber: 3,
        xPercent: 75,
        yPercent: 38,
        hazardCategory: 'Mobile Plant & Traffic',
        title: 'Heavy Plant Operating Adjacent to Unshored Excavation Crest',
        observedCondition: 'Excavator tracks positioned within 1.2m of vertical trench edge, generating vibrational surcharge.',
        potentialConsequences: 'Dynamic loading inducing shear failure of unreinforced bank; potential excavator rollover into pit.',
        exposedParties: 'Excavator operator and trench workers.',
        evidenceClassification: 'Potential Concern',
        existingControls: 'Operator seated in ROPS cab.',
        missingOrQuestionableControls: 'Lack of wheel stops, spotter/banksman, or verified stand-off distance buffer.',
        likelihood: 3,
        severity: 5,
        riskScore: 15,
        riskRating: 'Critical',
        immediateAction: 'Direct operator to reposition plant outside zone of influence (minimum 1x trench depth from crest).',
        engineeringControls: 'Install physical precast concrete jersey barriers defining plant exclusion zone.',
        administrativeControls: 'Appoint certified banksman to enforce exclusion boundary during earthmoving.',
        ppeRequired: 'High-visibility vest Class 3, safety footwear.',
        residualRisk: 'Medium',
        applicableStandards: getApplicableStandards('Mobile Plant & Traffic'),
        fieldVerificationQuestions: [
          'What is the calculated surcharge angle of repose for this soil condition?',
          'Was a dedicated plant marshal present during slewing operations?',
        ],
        actionAssignee: 'Plant Supervisor (T. O\'Connor)',
        actionTargetDate: 'Immediate',
        actionStatus: 'Open',
      },
      {
        id: 'HAZ-04',
        markerNumber: 4,
        xPercent: 86,
        yPercent: 39,
        hazardCategory: 'Housekeeping & Slips/Trips',
        title: 'Dewatering Discharge Hose Trailing Across Primary Pedestrian Access',
        observedCondition: 'Flexible discharge hose laid directly across active walkway without ramp, cover, or high-vis marking.',
        potentialConsequences: 'Trip and fall incident leading to sprains, fractures, or falls toward excavation edge.',
        exposedParties: 'Inspectors, supervisors, and visiting delivery personnel.',
        evidenceClassification: 'Visible Finding',
        existingControls: 'Flexible hose sheath intact.',
        missingOrQuestionableControls: 'Absence of cable/hose crossover bridge or trench bridge crossing.',
        likelihood: 4,
        severity: 2,
        riskScore: 8,
        riskRating: 'Medium',
        immediateAction: 'Install heavy-duty polyurethane hose ramp bridge or reroute line beneath designated timber walkway.',
        engineeringControls: 'Bury pipe in shallow sleeve beneath walk path or elevate on temporary pipe trestle.',
        administrativeControls: 'Mark primary walkway with clear demarcation tape and directional signage.',
        ppeRequired: 'Ankle-support safety boots.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Housekeeping & Slips/Trips'),
        fieldVerificationQuestions: [
          'Can discharge route be aligned along site boundary fence line instead of main access way?',
        ],
        actionAssignee: 'Site Logistics Lead (M. Al-Zahrani)',
        actionTargetDate: 'Today by 17:00',
        actionStatus: 'Open',
      },
      {
        id: 'HAZ-05',
        markerNumber: 5,
        xPercent: 39,
        yPercent: 88,
        hazardCategory: 'Emergency Access & Egress',
        title: 'Unverified Safe Access/Egress Ladder in Deep Excavation',
        observedCondition: 'Worker observed in trench base; no secured access ladder extending 1m above landing lip visible in photo.',
        potentialConsequences: 'Delayed egress during emergency wall instability, flooding, or medical event.',
        exposedParties: 'Worker at trench floor.',
        evidenceClassification: 'Not Verifiable From Photo',
        existingControls: 'None visible within camera perspective.',
        missingOrQuestionableControls: 'Mandatory safe access ladder within 7.5m (25ft) lateral travel distance not confirmed.',
        likelihood: 3,
        severity: 4,
        riskScore: 12,
        riskRating: 'High',
        immediateAction: 'Verify location of nearest tied-off ladder; install Class 1 industrial ladder extending 1.0m above lip.',
        engineeringControls: 'Provide secured modular trench stairway with handrails.',
        administrativeControls: 'Ensure emergency escape points are inspected and logged daily.',
        ppeRequired: 'Standard 5-point PPE.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Emergency Access & Egress'),
        fieldVerificationQuestions: [
          'Is there an access ladder outside of the camera frame within 7.5 meters?',
          'Has the ladder been tied off and tagged by the scaffolding/access inspector?',
        ],
        actionAssignee: 'Civils Foreman (Ahmed R.)',
        actionTargetDate: 'Immediate',
        actionStatus: 'Open',
      },
    ],
    defaultPositiveObservations: [
      {
        id: 'POS-01',
        title: 'Warning Signage Installed at Perimeter',
        description: 'Noticeable bilingual deep excavation hazard warning sign erected on approach path.',
        category: 'Signage & Awareness',
        xPercent: 11,
        yPercent: 14,
      },
      {
        id: 'POS-02',
        title: 'Operative Wearing Mandatory Hard Hat and Hi-Vis',
        description: 'Worker in trench is equipped with safety helmet and high-visibility vest.',
        category: 'PPE',
        xPercent: 39,
        yPercent: 78,
      },
    ],
    defaultVerificationItems: [
      'Confirm geotechnical soil classification and groundwater pore pressure report from site lab.',
      'Verify that daily pre-shift inspection log has been countersigned by the appointed Competent Person.',
      'Check pump fuel storage: confirm secondary containment drip tray is placed under diesel dewatering unit.',
    ],
    defaultOverallRisk: 'Critical',
  },
  {
    id: 'scaffolding_height',
    title: 'Façade Scaffolding & Work at Height',
    industry: 'Commercial Construction',
    workArea: 'Building B - North Elevation Level 3',
    activity: 'Façade panel installation & masonry pointing',
    emoji: '🪜',
    description: 'Independent tied scaffold with missing mid-rail on top lift, untethered tools, and ladder opening',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700" style="background:#e0f2fe;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- Building Concrete Wall -->
        <rect x="50" y="50" width="900" height="600" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
        <!-- Window Openings -->
        <rect x="120" y="100" width="100" height="140" fill="#334155"/>
        <rect x="340" y="100" width="100" height="140" fill="#334155"/>
        <rect x="560" y="100" width="100" height="140" fill="#334155"/>
        <rect x="780" y="100" width="100" height="140" fill="#334155"/>
        <rect x="120" y="340" width="100" height="140" fill="#334155"/>
        <rect x="340" y="340" width="100" height="140" fill="#334155"/>
        <rect x="560" y="340" width="100" height="140" fill="#334155"/>
        <rect x="780" y="340" width="100" height="140" fill="#334155"/>

        <!-- Ground Line -->
        <rect x="0" y="650" width="1000" height="50" fill="#475569"/>

        <!-- Scaffold Structure (Metallic Grey) -->
        <!-- Standards (Verticals) -->
        <line x1="180" y1="80" x2="180" y2="650" stroke="#64748b" stroke-width="8"/>
        <line x1="380" y1="80" x2="380" y2="650" stroke="#64748b" stroke-width="8"/>
        <line x1="580" y1="80" x2="580" y2="650" stroke="#64748b" stroke-width="8"/>
        <line x1="780" y1="80" x2="780" y2="650" stroke="#64748b" stroke-width="8"/>

        <!-- Ledgers (Horizontals) -->
        <!-- Lift 1 -->
        <line x1="160" y1="520" x2="800" y2="520" stroke="#64748b" stroke-width="7"/>
        <rect x="180" y="514" width="600" height="12" fill="#d97706"/> <!-- Deck 1 -->
        <!-- Lift 2 -->
        <line x1="160" y1="360" x2="800" y2="360" stroke="#64748b" stroke-width="7"/>
        <rect x="180" y="354" width="600" height="12" fill="#d97706"/> <!-- Deck 2 -->
        <!-- Lift 3 (Top Working Platform) -->
        <line x1="160" y1="200" x2="800" y2="200" stroke="#64748b" stroke-width="7"/>
        <rect x="180" y="194" width="600" height="12" fill="#d97706"/> <!-- Deck 3 -->

        <!-- Guardrails on Top Lift -->
        <!-- Top Rail (1m high) -->
        <line x1="180" y1="140" x2="800" y2="140" stroke="#475569" stroke-width="5"/>
        <!-- Notice Missing Mid-rail between x=380 and x=580! -->
        <line x1="180" y1="170" x2="380" y2="170" stroke="#475569" stroke-width="4"/>
        <line x1="580" y1="170" x2="800" y2="170" stroke="#475569" stroke-width="4"/>
        <!-- Toe Board: Present left, missing right! -->
        <rect x="180" y="182" width="200" height="12" fill="#eab308"/>

        <!-- Worker 1 on Top Deck near missing mid-rail -->
        <circle cx="480" cy="115" r="9" fill="#fef08a"/>
        <ellipse cx="480" cy="110" rx="11" ry="5" fill="#f97316"/> <!-- Hard hat -->
        <rect x="470" y="125" width="20" height="35" rx="3" fill="#3b82f6"/> <!-- Harness visible -->
        <!-- Lanyard unclipped! Hanging loose -->
        <path d="M 475,135 Q 460,165 470,185" fill="none" stroke="#e11d48" stroke-width="3"/>
        <circle cx="470" cy="185" r="4" fill="#e11d48"/>

        <!-- Untethered Hand Tool on Edge of Deck -->
        <rect x="520" y="190" width="18" height="6" fill="#1e293b"/>
        <line x1="538" y1="193" x2="550" y2="193" stroke="#f59e0b" stroke-width="3"/>

        <!-- Scafftag at Ladder Access Base -->
        <rect x="195" y="600" width="18" height="32" rx="2" fill="#10b981"/>
        <text x="204" y="618" fill="#ffffff" font-size="7" font-weight="bold" text-anchor="middle">SAFE</text>

        <!-- Base Plates & Sole Boards -->
        <rect x="165" y="642" width="30" height="8" fill="#78350f"/>
        <rect x="365" y="642" width="30" height="8" fill="#78350f"/>
        <rect x="565" y="642" width="30" height="8" fill="#78350f"/>
        <rect x="765" y="642" width="30" height="8" fill="#78350f"/>
      </svg>
    `,
    defaultObservations: [
      {
        id: 'HAZ-01',
        markerNumber: 1,
        xPercent: 48,
        yPercent: 21,
        hazardCategory: 'Working at Height',
        title: 'Fall Protection Lanyard Disengaged at Elevated Scaffold Platform',
        observedCondition: 'Operative working on top lift (~8.5m elevation) with harness lanyard dangling unanchored.',
        potentialConsequences: 'Fatal fall from height upon slip, trip, or sudden loss of balance.',
        exposedParties: 'Façade installer on top working platform.',
        evidenceClassification: 'Visible Finding',
        existingControls: 'Operative wearing full body harness and helmet with chinstrap.',
        missingOrQuestionableControls: '100% tie-off discipline not enforced; suitable certified overhead lifeline or anchor point not engaged.',
        likelihood: 4,
        severity: 5,
        riskScore: 20,
        riskRating: 'Critical',
        immediateAction: 'Instruct worker to safely anchor immediately; conduct mandatory stand-down on fall arrest compliance.',
        engineeringControls: 'Install certified horizontal lifeline cable along building anchors for continuous attachment.',
        administrativeControls: 'Brief all operatives on 100% tie-off rules; issue safety observation non-conformance.',
        ppeRequired: 'Full body harness with dual shock-absorbing lanyards.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Working at Height'),
        fieldVerificationQuestions: [
          'Is an engineered anchor point rated to 22.2 kN (5,000 lbs) accessible within reach of operative?',
          'Has the worker completed certified Working at Height competency training?',
        ],
        actionAssignee: 'Scaffolding & Height Supervisor (L. Vance)',
        actionTargetDate: 'Immediate',
        actionStatus: 'Open',
      },
      {
        id: 'HAZ-02',
        markerNumber: 2,
        xPercent: 48,
        yPercent: 24,
        hazardCategory: 'Scaffolding & Access',
        title: 'Missing Mid-Rail and Toe-Board on Active Top Working Lift',
        observedCondition: 'Section of working bay between standards 2 and 3 has no mid-rail and missing 150mm toe-board.',
        potentialConsequences: 'Operative slipping beneath top rail; tools and debris kicking off deck onto ground below.',
        exposedParties: 'Operative on platform and pedestrians/workers at ground level.',
        evidenceClassification: 'Visible Finding',
        existingControls: 'Top guardrail present at approx 1000mm.',
        missingOrQuestionableControls: 'Missing intermediate guardrail (approx 500mm) and toe-board barrier.',
        likelihood: 4,
        severity: 4,
        riskScore: 16,
        riskRating: 'High',
        immediateAction: 'Fit immediate tube & fitting mid-rail and wooden toe-board before continuing works.',
        engineeringControls: 'Install prefabricated scaffold guardrail cassette unit.',
        administrativeControls: 'Update Scafftag inspection status from Green to Yellow/Do Not Use until rectified.',
        ppeRequired: 'Standard site PPE.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Scaffolding & Access'),
        fieldVerificationQuestions: [
          'When was the scaffold last inspected and signed off on the statutory register?',
        ],
        actionAssignee: 'Scaffold Contractor Lead (R. Kumar)',
        actionTargetDate: 'Today by 12:00',
        actionStatus: 'Open',
      },
      {
        id: 'HAZ-03',
        markerNumber: 3,
        xPercent: 54,
        yPercent: 28,
        hazardCategory: 'Housekeeping & Slips/Trips',
        title: 'Untethered Hand Tools Positioned Near Unprotected Deck Margin',
        observedCondition: 'Pneumatic wrench and hammer left loose on edge of deck without tool lanyards or retention caddy.',
        potentialConsequences: 'Dropped object falling 8.5m, generating severe blunt-force trauma to ground personnel.',
        exposedParties: 'Workers and delivery drivers on ground level below.',
        evidenceClassification: 'Visible Finding',
        existingControls: 'None for loose tool security.',
        missingOrQuestionableControls: 'Absence of tool wrist lanyards, tethering clips, or tool bag.',
        likelihood: 3,
        severity: 4,
        riskScore: 12,
        riskRating: 'High',
        immediateAction: 'Place tools into secure tool bucket and attach wrist lanyards.',
        engineeringControls: 'Install perimeter debris netting or heavy-duty fan netting beneath elevated work zone.',
        administrativeControls: 'Enforce dropped-object prevention policy (DROPS standard).',
        ppeRequired: 'Ground personnel hard hats and eye protection.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Housekeeping & Slips/Trips'),
        fieldVerificationQuestions: [
          'Is an exclusion zone demarcated at ground level beneath this scaffolding bay?',
        ],
        actionAssignee: 'Façade Subcontractor Foreman (D. Miller)',
        actionTargetDate: 'Within 1 Hour',
        actionStatus: 'Open',
      },
    ],
    defaultPositiveObservations: [
      {
        id: 'POS-01',
        title: 'Proper Base Plates and Timber Sole Boards in Use',
        description: 'All ground standards sit on metal base plates and continuous timber sole boards.',
        category: 'Scaffolding',
        xPercent: 37,
        yPercent: 92,
      },
      {
        id: 'POS-02',
        title: 'Valid Inspection Scafftag Displayed',
        description: 'Scafftag inspection holder fixed at access ladder showing current weekly check.',
        category: 'Administrative Controls',
        xPercent: 20,
        yPercent: 88,
      },
    ],
    defaultVerificationItems: [
      'Check statutory scaffolding register (form F91 or equivalent) for 7-day inspection signoff.',
      'Verify that ground level drop zone beneath elevation is barricaded with warning signs.',
    ],
    defaultOverallRisk: 'Critical',
  },
  {
    id: 'crane_lifting',
    title: 'Mobile Crane Tandem Lift',
    industry: 'Heavy Industrial & Energy',
    workArea: 'Laydown Yard - Module Bay 2',
    activity: 'Structural steel truss placement using 100t mobile crane',
    emoji: '🏗️',
    description: 'Suspended load over yard, rigger in blind spot, and unbarricaded outrigger slewing radius',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700" style="background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- Sky -->
        <rect x="0" y="0" width="1000" height="450" fill="#bae6fd" opacity="0.3"/>
        <line x1="0" y1="450" x2="1000" y2="450" stroke="#94a3b8" stroke-width="2"/>
        <rect x="0" y="450" width="1000" height="250" fill="#64748b"/>

        <!-- Power Lines Overhead (Caution!) -->
        <line x1="0" y1="60" x2="1000" y2="80" stroke="#0f172a" stroke-width="3"/>
        <line x1="0" y1="80" x2="1000" y2="100" stroke="#0f172a" stroke-width="3"/>
        <text x="80" y="50" fill="#b91c1c" font-size="12" font-weight="bold">11kV Overhead Power Lines</text>

        <!-- Mobile Crane Body -->
        <rect x="550" y="380" width="300" height="100" rx="16" fill="#eab308" stroke="#ca8a04" stroke-width="3"/>
        <rect x="760" y="340" width="80" height="70" rx="8" fill="#1e293b"/> <!-- Cab -->
        <circle cx="610" cy="490" r="30" fill="#1e293b"/>
        <circle cx="690" cy="490" r="30" fill="#1e293b"/>
        <circle cx="770" cy="490" r="30" fill="#1e293b"/>
        <circle cx="830" cy="490" r="30" fill="#1e293b"/>

        <!-- Outriggers -->
        <rect x="520" y="460" width="40" height="50" fill="#475569"/>
        <rect x="490" y="505" width="100" height="20" fill="#e2e8f0" stroke="#0f172a"/>
        <rect x="840" y="460" width="40" height="50" fill="#475569"/>
        <rect x="810" y="505" width="100" height="20" fill="#e2e8f0" stroke="#0f172a"/>

        <!-- Telescopic Boom pointing up-left -->
        <line x1="600" y1="360" x2="250" y2="110" stroke="#ca8a04" stroke-width="26"/>
        <line x1="600" y1="360" x2="250" y2="110" stroke="#fef08a" stroke-width="6"/>

        <!-- Hoist Wire & Hook -->
        <line x1="250" y1="110" x2="250" y2="280" stroke="#1e293b" stroke-width="4"/>
        <circle cx="250" cy="285" r="10" fill="#991b1b"/>

        <!-- Suspended Steel Truss (Heavy Load) -->
        <rect x="100" y="295" width="300" height="30" rx="4" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>
        <!-- Rigging Slings -->
        <line x1="250" y1="285" x2="150" y2="295" stroke="#475569" stroke-width="4"/>
        <line x1="250" y1="285" x2="350" y2="295" stroke="#475569" stroke-width="4"/>

        <!-- Tag Line -->
        <line x1="390" y1="315" x2="420" y2="440" stroke="#ffffff" stroke-width="3" stroke-dasharray="4,4"/>

        <!-- Worker / Rigger standing directly under edge of load! -->
        <circle cx="230" cy="410" r="10" fill="#ffffff"/>
        <ellipse cx="230" cy="403" rx="12" ry="5" fill="#facc15"/>
        <rect x="220" y="420" width="20" height="36" rx="4" fill="#f97316"/>
        <line x1="225" y1="456" x2="225" y2="490" stroke="#0f172a" stroke-width="5"/>
        <line x1="235" y1="456" x2="235" y2="490" stroke="#0f172a" stroke-width="5"/>

        <!-- Rigger with Tag line -->
        <circle cx="430" cy="450" r="10" fill="#ffffff"/>
        <ellipse cx="430" cy="443" rx="12" ry="5" fill="#facc15"/>
        <rect x="420" y="460" width="20" height="36" rx="4" fill="#3b82f6"/>
      </svg>
    `,
    defaultObservations: [
      {
        id: 'HAZ-01',
        markerNumber: 1,
        xPercent: 23,
        yPercent: 62,
        hazardCategory: 'Lifting & Rigging',
        title: 'Personnel Positioned Under Suspended Structural Load ("Line of Fire")',
        observedCondition: 'Operative standing directly in shadow zone beneath 4-tonne suspended steel truss.',
        potentialConsequences: 'Catastrophic crush injury or fatality in event of rigging failure or brake slip.',
        exposedParties: 'Rigger standing beneath hook load.',
        evidenceClassification: 'Visible Finding',
        existingControls: 'Operative wearing hard hat and hi-vis vest.',
        missingOrQuestionableControls: 'Exclusion zone barrier and clear line-of-fire avoidance not maintained.',
        likelihood: 3,
        severity: 5,
        riskScore: 15,
        riskRating: 'Critical',
        immediateAction: 'Sound air horn; order immediate withdrawal of personnel from beneath load.',
        engineeringControls: 'Use longer tag lines (>5m) to steer load remotely without standing beneath load envelope.',
        administrativeControls: 'Brief lifting crew on ASME B30.5 / LOLER exclusion boundaries; stop-work authority exercised.',
        ppeRequired: 'Full lifting crew safety gear.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Lifting & Rigging'),
        fieldVerificationQuestions: [
          'Is an approved Lift Plan and Appointed Person calculation sheet available for this specific lift?',
          'Has the pre-lift toolbox talk documented the lift path exclusion zone?',
        ],
        actionAssignee: 'Lifting Supervisor (G. MacIntyre)',
        actionTargetDate: 'Immediate',
        actionStatus: 'Open',
      },
      {
        id: 'HAZ-02',
        markerNumber: 2,
        xPercent: 25,
        yPercent: 12,
        hazardCategory: 'Electrical Safety',
        title: 'Proximity of Crane Boom to Overhead High Voltage Power Lines',
        observedCondition: 'Crane boom operating in proximity to 11kV overhead lines (clearance appears less than 5m).',
        potentialConsequences: 'Electrical arcing, crane electrocution, fire, and catastrophic ground discharge.',
        exposedParties: 'Crane operator, riggers touching tag line, ground workers.',
        evidenceClassification: 'Potential Concern',
        existingControls: 'None visible in boom slew path.',
        missingOrQuestionableControls: 'Absence of goalpost barriers, tiger tails, or designated electrical watcher.',
        likelihood: 4,
        severity: 5,
        riskScore: 20,
        riskRating: 'Critical',
        immediateAction: 'Halt slewing toward power lines; measure exact distance with laser rangefinder.',
        engineeringControls: 'Request utility de-energization or install height limiting restrictor switch on crane boom.',
        administrativeControls: 'Establish OSHA Table A minimum clearance (3m for up to 50kV) with dedicated spotter.',
        ppeRequired: 'Dielectric footwear where ground potential is a risk.',
        residualRisk: 'Low',
        applicableStandards: getApplicableStandards('Electrical Safety'),
        fieldVerificationQuestions: [
          'What is the certified voltage of the overhead lines and verified safe approach distance?',
          'Has a permit to work near overhead cables been granted by the electrical network operator?',
        ],
        actionAssignee: 'HSE Manager (S. Al-Nuaimi)',
        actionTargetDate: 'Immediate',
        actionStatus: 'Open',
      },
    ],
    defaultPositiveObservations: [
      {
        id: 'POS-01',
        title: 'Tag Line Utilized for Load Guidance',
        description: 'Synthetic tag line attached to outer end of truss allowing rigger to control rotation from distance.',
        category: 'Rigging Best Practice',
        xPercent: 41,
        yPercent: 62,
      },
      {
        id: 'POS-02',
        title: 'Outrigger Spreader Pads Deployed',
        description: 'Crane outrigger beams fully extended with substantial load distribution mats beneath jacks.',
        category: 'Plant Stability',
        xPercent: 52,
        yPercent: 74,
      },
    ],
    defaultVerificationItems: [
      'Check crane thorough examination certificate and 6-monthly lifting tackle inspection report.',
      'Verify crane wind anemometer reading against max operating speed limit.',
    ],
    defaultOverallRisk: 'Critical',
  },
  {
    id: 'compliant_safe_site',
    title: 'Controlled Worksite (Full Protective Controls)',
    industry: 'Commercial Construction & Civil Works',
    workArea: 'Excavation Sector 1A - Certified Shoring Zone',
    activity: 'Utility pipe installation with full trench protection',
    emoji: '✅',
    description: 'Fully shored excavation with certified trench box, continuous 1.1m guardrails, secured ladder, and full PPE — Negative violation test',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700" style="background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- Clean Engineered Ground -->
        <rect x="0" y="260" width="1000" height="440" fill="#94a3b8"/>
        <rect x="0" y="260" width="1000" height="15" fill="#64748b"/>

        <!-- Sky -->
        <rect x="0" y="0" width="1000" height="260" fill="#e0f2fe"/>

        <!-- Clean Trench Box (Heavy Duty Aluminum Yellow) -->
        <rect x="220" y="275" width="560" height="360" rx="4" fill="#eab308" stroke="#ca8a04" stroke-width="4"/>
        <line x1="220" y1="395" x2="780" y2="395" stroke="#a16207" stroke-width="4"/>
        <line x1="220" y1="515" x2="780" y2="515" stroke="#a16207" stroke-width="4"/>
        <!-- Spreader Struts -->
        <rect x="360" y="320" width="280" height="24" rx="4" fill="#1e293b"/>
        <rect x="360" y="460" width="280" height="24" rx="4" fill="#1e293b"/>

        <!-- Continuous Rigid Edge Protection (Double Handrails + Toe-board) -->
        <line x1="80" y1="180" x2="920" y2="180" stroke="#f97316" stroke-width="8"/> <!-- Top Rail -->
        <line x1="80" y1="220" x2="920" y2="220" stroke="#f97316" stroke-width="6"/> <!-- Mid Rail -->
        <rect x="80" y="245" width="840" height="15" fill="#fbbf24"/> <!-- Toe Board -->
        <!-- Upright Posts -->
        <line x1="100" y1="180" x2="100" y2="260" stroke="#ea580c" stroke-width="8"/>
        <line x1="280" y1="180" x2="280" y2="260" stroke="#ea580c" stroke-width="8"/>
        <line x1="480" y1="180" x2="480" y2="260" stroke="#ea580c" stroke-width="8"/>
        <line x1="720" y1="180" x2="720" y2="260" stroke="#ea580c" stroke-width="8"/>
        <line x1="900" y1="180" x2="900" y2="260" stroke="#ea580c" stroke-width="8"/>

        <!-- Secured Access Ladder (Extends 1m above landing) -->
        <line x1="700" y1="140" x2="700" y2="610" stroke="#475569" stroke-width="6"/>
        <line x1="730" y1="140" x2="730" y2="610" stroke="#475569" stroke-width="6"/>
        <!-- Ladder Rungs -->
        <line x1="700" y1="170" x2="730" y2="170" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="210" x2="730" y2="210" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="250" x2="730" y2="250" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="290" x2="730" y2="290" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="330" x2="730" y2="330" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="370" x2="730" y2="370" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="410" x2="730" y2="410" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="450" x2="730" y2="450" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="490" x2="730" y2="490" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="530" x2="730" y2="530" stroke="#475569" stroke-width="3"/>
        <line x1="700" y1="570" x2="730" y2="570" stroke="#475569" stroke-width="3"/>
        <!-- Ladder Tied Off At Crest -->
        <circle cx="700" cy="245" r="5" fill="#3b82f6"/>
        <circle cx="730" cy="245" r="5" fill="#3b82f6"/>

        <!-- Spoil setback marker at 2.0m -->
        <rect x="50" y="240" width="120" height="20" rx="3" fill="#15803d"/>
        <text x="110" y="254" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">CLEAR ZONE (2.0M)</text>

        <!-- Safety Inspection Board Sign -->
        <rect x="800" y="70" width="160" height="85" rx="6" fill="#ffffff" stroke="#15803d" stroke-width="3"/>
        <rect x="805" y="75" width="150" height="20" fill="#15803d"/>
        <text x="880" y="89" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle">CERTIFIED SAFE PIT</text>
        <text x="880" y="112" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">DAILY CHECK: PASSED</text>
        <text x="880" y="128" fill="#64748b" font-size="8" text-anchor="middle">Competent Person: S. K.</text>
        <text x="880" y="142" fill="#15803d" font-size="9" font-weight="bold" text-anchor="middle">TRENCH BOX RATED A-1</text>
      </svg>
    `,
    defaultObservations: [], // Zero violations! Engine recognizes adequate controls!
    defaultPositiveObservations: [
      {
        id: 'POS-01',
        title: 'Engineered Certified Trench Shielding Box Deployed',
        description: 'Heavy-duty certified aluminum trench box shields workers completely against ground movement.',
        category: 'Excavation Protection',
        xPercent: 50,
        yPercent: 55,
      },
      {
        id: 'POS-02',
        title: 'Rigid Perimeter Double-Guardrail with 150mm Toe-board',
        description: 'Complete continuous 1.1m high guardrail system installed around entire pit boundary.',
        category: 'Edge Protection',
        xPercent: 50,
        yPercent: 32,
      },
      {
        id: 'POS-03',
        title: 'Secured Ladder Tied Off and Extending 1m Above Crest',
        description: 'Access ladder firmly secured at landing lip with top stanchions extending >1 meter for safe handholds.',
        category: 'Access & Egress',
        xPercent: 71,
        yPercent: 35,
      },
      {
        id: 'POS-04',
        title: 'Spoil Setback Buffer Maintained Beyond 2.0 Meters',
        description: 'Clean perimeter surface; no soil or equipment surcharge load within 2 meters of trench lip.',
        category: 'Housekeeping',
        xPercent: 11,
        yPercent: 36,
      },
    ],
    defaultVerificationItems: [
      'Confirm daily morning pre-entry gas test records (O2: 20.9%, H2S: 0ppm, LEL: 0%).',
      'Verify rescue davit arm and retrieval harness inspected and positioned at landing platform.',
    ],
    defaultOverallRisk: 'Low',
  },
];
