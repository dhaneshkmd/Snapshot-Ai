import { HazardCategory, StandardReference } from './hseTypes';

export interface StandardKnowledgeItem {
  category: HazardCategory;
  standards: {
    osha: StandardReference[];
    iso: StandardReference[];
    ukHse: StandardReference[];
    uae: StandardReference[];
    india: StandardReference[];
    ilo: StandardReference[];
  };
}

export const VERIFIED_HSE_STANDARDS: Record<HazardCategory, StandardReference[]> = {
  'Working at Height': [
    {
      standard: 'OSHA 29 CFR 1926.501(b)(1)',
      title: 'Duty to have fall protection (Unprotected sides & edges)',
      clause: '1926.501(b)(1)',
      summary: 'Guardrail systems, safety net systems, or personal fall arrest systems required at 6 feet (1.8m) or higher.',
    },
    {
      standard: 'ISO 45001:2018',
      title: 'Operational planning and control - Fall hazards',
      clause: 'Clause 8.1.2',
      summary: 'Hierarchy of controls: eliminate height work where possible, followed by collective edge protection and personal arrest.',
    },
    {
      standard: 'UK Work at Height Regulations 2005',
      title: 'Avoidance of risks from work at height',
      clause: 'Regulation 6',
      summary: 'Take suitable and sufficient measures to prevent any person falling a distance liable to cause personal injury.',
    },
  ],
  'Scaffolding & Access': [
    {
      standard: 'OSHA 29 CFR 1926.451',
      title: 'General requirements for scaffolds',
      clause: '1926.451(g)(1)',
      summary: 'Fall protection, proper base plates, bracing, fully planked working decks, and tagged inspection status.',
    },
    {
      standard: 'UK HSE TG20:21',
      title: 'Operational Guide to Good Practice for Tube and Fitting Scaffolding',
      clause: 'NASC TG20',
      summary: 'Erection by competent scaffolders, guardrails (950mm), intermediate rails, and 150mm toe-boards.',
    },
  ],
  'Lifting & Rigging': [
    {
      standard: 'OSHA 29 CFR 1926.1400',
      title: 'Cranes and Derricks in Construction',
      clause: '1926.1417',
      summary: 'Exclusion zones beneath suspended loads, certified rigging tackle, trained banksman/signaler, and daily crane inspections.',
    },
    {
      standard: 'UK LOLER 1998',
      title: 'Lifting Operations and Lifting Equipment Regulations',
      clause: 'Regulation 8',
      summary: 'All lifting operations must be properly planned by a competent person, appropriately supervised, and carried out safely.',
    },
  ],
  'Excavation & Trenching': [
    {
      standard: 'OSHA 29 CFR 1926.651 & 652',
      title: 'Specific Excavation Requirements & Protective Systems',
      clause: '1926.652(a)(1)',
      summary: 'Protective systems (sloping, benching, shoring, or shielding) required for trenches 5 feet (1.5m) or deeper; daily competent person check.',
    },
    {
      standard: 'UK HSE HSG150',
      title: 'Health and safety in construction - Excavations',
      clause: 'Chapter 5',
      summary: 'Support sides or batter back; prevent plant or spoil within minimum 1m edge perimeter; provide edge barriers and safe ladders.',
    },
    {
      standard: 'ILO Convention C167',
      title: 'Safety and Health in Construction Convention',
      clause: 'Article 19',
      summary: 'Adequate precautions shall be taken in any excavation to prevent earth from caving in and prevent workers or plant from falling.',
    },
  ],
  'Electrical Safety': [
    {
      standard: 'OSHA 29 CFR 1926.404 / 405',
      title: 'Wiring design and protection - Ground fault protection',
      clause: '1926.404(b)(1)',
      summary: 'GFCI protection or an assured equipment grounding conductor program for all temporary 120V/240V circuits.',
    },
    {
      standard: 'UK Electricity at Work Regulations 1989',
      title: 'Work on or near live conductors',
      clause: 'Regulation 14',
      summary: 'No person shall be engaged in work activity on or near live conductors unless it is unreasonable for it to be dead and precautions taken.',
    },
  ],
  'Confined Space': [
    {
      standard: 'OSHA 29 CFR 1926.1203',
      title: 'Permit-Required Confined Spaces in Construction',
      clause: '1926.1203',
      summary: 'Atmospheric pre-testing, forced ventilation, continuous monitoring, standby attendant, and documented rescue plan.',
    },
    {
      standard: 'UK Confined Spaces Regulations 1997',
      title: 'Work in confined spaces',
      clause: 'Regulation 4',
      summary: 'A person shall not enter a confined space unless it is not reasonably practicable to achieve purpose without entering.',
    },
  ],
  'Mobile Plant & Traffic': [
    {
      standard: 'OSHA 29 CFR 1926.601 & 602',
      title: 'Motor vehicles and mechanized equipment',
      clause: '1926.602',
      summary: 'Pedestrian and plant physical segregation, operating reversing alarms, high-visibility clothing, and designated marshals.',
    },
    {
      standard: 'UK HSE HSG136',
      title: 'Workplace transport safety - An overview',
      clause: 'HSG136',
      summary: 'Segregate pedestrian walkways from mobile machinery using physical barriers and maintain adequate sightlines.',
    },
  ],
  'Machinery & Guarding': [
    {
      standard: 'OSHA 29 CFR 1910.212',
      title: 'General requirements for all machines',
      clause: '1910.212(a)(1)',
      summary: 'One or more methods of machine guarding shall be provided to protect operator and other employees from nip points, rotating parts, and flying sparks.',
    },
  ],
  'Lockout / Tagout (LOTO)': [
    {
      standard: 'OSHA 29 CFR 1910.147',
      title: 'The control of hazardous energy (lockout/tagout)',
      clause: '1910.147(c)(1)',
      summary: 'Energy control program consisting of energy control procedures, employee training, and periodic inspections.',
    },
  ],
  'Fire & Hot Work': [
    {
      standard: 'OSHA 29 CFR 1926.352',
      title: 'Fire prevention in welding and cutting',
      clause: '1926.352(d)',
      summary: 'Hot work permit, fire blanket shielding, accessible charged fire extinguisher, and mandatory 30-minute post-work fire watch.',
    },
    {
      standard: 'NFPA 51B',
      title: 'Standard for Fire Prevention During Welding, Cutting, and Other Hot Work',
      clause: 'NFPA 51B',
      summary: 'Establish 35-ft (11m) combustible-free zone or cover combustible materials with listed welding blankets.',
    },
  ],
  'Chemical & Hazardous Substances': [
    {
      standard: 'OSHA 29 CFR 1910.1200 / 1926.59',
      title: 'Hazard Communication (HazCom)',
      clause: '1910.1200',
      summary: 'GHS container labeling, available Safety Data Sheets (SDS), and secondary containment for liquid chemical storage.',
    },
    {
      standard: 'UK COSHH Regulations 2002',
      title: 'Control of Substances Hazardous to Health',
      clause: 'Regulation 7',
      summary: 'Ensure that the exposure of employees to substances hazardous to health is either prevented or adequately controlled.',
    },
  ],
  'PPE Compliance': [
    {
      standard: 'OSHA 29 CFR 1926.95 & 100',
      title: 'Criteria for personal protective equipment & Head protection',
      clause: '1926.100(a)',
      summary: 'Employees working in areas where there is possible danger of head injury from impact or falling objects shall be protected by helmets.',
    },
    {
      standard: 'ISO 45001:2018',
      title: 'Hierarchy of Controls - PPE as last resort',
      clause: 'Clause 8.1.2(e)',
      summary: 'Provide adequate personal protective equipment only after higher level engineering and collective controls are maximized.',
    },
  ],
  'Housekeeping & Slips/Trips': [
    {
      standard: 'OSHA 29 CFR 1926.25',
      title: 'Housekeeping in construction areas',
      clause: '1926.25(a)',
      summary: 'During the course of construction, form and scrap lumber with protruding nails, and all other debris, shall be kept cleared from work areas.',
    },
    {
      standard: 'UK Workplace (Health, Safety and Welfare) Regs 1992',
      title: 'Condition of floors and traffic routes',
      clause: 'Regulation 12',
      summary: 'Floors and traffic routes shall be kept free from obstructions and from any substance which may cause a person to slip or trip.',
    },
  ],
  'Ergonomics & Manual Handling': [
    {
      standard: 'UK Manual Handling Operations Regulations 1992',
      title: 'Ergonomic risk reduction in manual handling',
      clause: 'Regulation 4',
      summary: 'Avoid hazardous manual handling so far as reasonably practicable; assess risk and introduce mechanical lifting aids.',
    },
  ],
  'Dust, Fumes & Noise': [
    {
      standard: 'OSHA 29 CFR 1926.1153',
      title: 'Respirable crystalline silica',
      clause: '1926.1153(c)',
      summary: 'Engineering controls (wet suppression or vacuum dust collection) required during masonry, concrete, and stone cutting.',
    },
  ],
  'Environmental & Dewatering': [
    {
      standard: 'ISO 14001:2015',
      title: 'Environmental management systems - Operational control',
      clause: 'Clause 8.1',
      summary: 'Prevent discharge of silty, oily, or contaminated dewatering runoff into natural waterways without sedimentation or filtration.',
    },
  ],
  'Temporary Works': [
    {
      standard: 'BS 5975:2019',
      title: 'Code of practice for temporary works procedures',
      clause: 'Section 2',
      summary: 'Formal appointment of Temporary Works Coordinator (TWC), design briefs, structural calculations, and permit-to-load/strike.',
    },
  ],
  'Emergency Access & Egress': [
    {
      standard: 'OSHA 29 CFR 1926.34',
      title: 'Means of egress in construction',
      clause: '1926.34(a)',
      summary: 'In every building or structure exits shall be so arranged and maintained as to provide free and unobstructed egress from all parts at all times.',
    },
  ],
  'Process Safety & Pressure Systems': [
    {
      standard: 'OSHA 29 CFR 1910.119',
      title: 'Process safety management of highly hazardous chemicals',
      clause: '1910.119(j)',
      summary: 'Mechanical integrity, relief valve inspection, documented inspection frequencies, and management of change (MOC).',
    },
  ],
  'General Workplace Safety': [
    {
      standard: 'ILO Code of Practice',
      title: 'Safety and Health in Construction',
      clause: 'General Principles',
      summary: 'Employers shall provide and maintain workplaces, plant, equipment and systems of work that are safe and without risk to health.',
    },
    {
      standard: 'ISO 45001:2018',
      title: 'Occupational health and safety management systems',
      clause: 'Clause 6.1.2',
      summary: 'Hazard identification and assessment of risks and opportunities across routine and non-routine workplace activities.',
    },
  ],
};

export function getApplicableStandards(category: HazardCategory): StandardReference[] {
  return VERIFIED_HSE_STANDARDS[category] || VERIFIED_HSE_STANDARDS['General Workplace Safety'];
}
