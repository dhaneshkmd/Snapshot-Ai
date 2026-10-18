export type ReplyStyleCategory =
  | 'Everyday'
  | 'Agreement & Disagreement'
  | 'Assertive & Persuasive'
  | 'Humour & Creative'
  | 'Emotional & Relationship'
  | 'Professional & Specialist'
  | 'Social Media'
  | 'Cultural & Language';

export interface ReplyStyle {
  id: string;
  name: string;
  category: ReplyStyleCategory;
  description: string;
  instruction: string;
  defaultLength: 'short' | 'medium' | 'detailed';
  compatibleIntensity?: boolean;
}

export const REPLY_STYLES: ReplyStyle[] = [
  // ==========================================
  // CATEGORY A — EVERYDAY COMMUNICATION (1-12)
  // ==========================================
  {
    id: 'natural',
    name: 'Natural',
    category: 'Everyday',
    description: 'Conversational, realistic and human-sounding.',
    instruction: 'Write in a natural, organic conversational voice that sounds genuinely human, avoid robotic phrasing.',
    defaultLength: 'medium',
  },
  {
    id: 'simple',
    name: 'Simple',
    category: 'Everyday',
    description: 'Easy words and straightforward sentences.',
    instruction: 'Use very simple, everyday words and clear, uncluttered sentence structures accessible to any reader.',
    defaultLength: 'short',
  },
  {
    id: 'casual',
    name: 'Casual',
    category: 'Everyday',
    description: 'Relaxed everyday communication.',
    instruction: 'Adopt a relaxed, easygoing tone suitable for everyday social chats, informal but respectful.',
    defaultLength: 'short',
  },
  {
    id: 'friendly',
    name: 'Friendly',
    category: 'Everyday',
    description: 'Warm, approachable and welcoming.',
    instruction: 'Communicate with warmth, cordiality, and good nature, making the other party feel heard and valued.',
    defaultLength: 'medium',
  },
  {
    id: 'very_polite',
    name: 'Very Polite',
    category: 'Everyday',
    description: 'Respectful, courteous and considerate.',
    instruction: 'Use exceptionally polite, gracious phrasing with courteous honorifics and gentle acknowledgments.',
    defaultLength: 'medium',
    compatibleIntensity: true,
  },
  {
    id: 'formal',
    name: 'Formal',
    category: 'Everyday',
    description: 'Appropriate for official communication.',
    instruction: 'Maintain a proper, structured, and dignified tone suitable for official correspondence.',
    defaultLength: 'medium',
  },
  {
    id: 'professional',
    name: 'Professional',
    category: 'Everyday',
    description: 'Businesslike, clear and composed.',
    instruction: 'Craft a composed, polished, workplace-appropriate response that is focused and constructive.',
    defaultLength: 'medium',
  },
  {
    id: 'neutral',
    name: 'Neutral',
    category: 'Everyday',
    description: 'Balanced and emotionally restrained.',
    instruction: 'Provide a completely objective, calm, and emotionally detached reply without bias or charged words.',
    defaultLength: 'short',
  },
  {
    id: 'direct',
    name: 'Direct',
    category: 'Everyday',
    description: 'Clear and immediate without unnecessary detail.',
    instruction: 'Get straight to the core point immediately. Zero fluff, zero beating around the bush.',
    defaultLength: 'short',
    compatibleIntensity: true,
  },
  {
    id: 'short_sweet',
    name: 'Short & Sweet',
    category: 'Everyday',
    description: 'Concise with a pleasant, positive tone.',
    instruction: 'Express the complete thought in 1–2 crisp, pleasant sentences.',
    defaultLength: 'short',
  },
  {
    id: 'detailed',
    name: 'Detailed',
    category: 'Everyday',
    description: 'Comprehensive, with useful explanations.',
    instruction: 'Provide thorough context, clear explanatory rationale, and well-rounded breakdown of the subject.',
    defaultLength: 'detailed',
  },
  {
    id: 'conversational',
    name: 'Conversational',
    category: 'Everyday',
    description: 'Written like a natural peer discussion.',
    instruction: 'Respond as though speaking with a peer in person, using smooth transitions and relatable phrasing.',
    defaultLength: 'medium',
  },

  // ==========================================
  // CATEGORY B — AGREEMENT AND DISAGREEMENT (13-24)
  // ==========================================
  {
    id: 'strong_agreement',
    name: 'Strong Agreement',
    category: 'Agreement & Disagreement',
    description: 'Clearly support the comment with reasons.',
    instruction: 'Wholeheartedly endorse the premise of the comment, adding compelling reinforcement and supporting reasons.',
    defaultLength: 'medium',
    compatibleIntensity: true,
  },
  {
    id: 'partial_agreement',
    name: 'Partial Agreement',
    category: 'Agreement & Disagreement',
    description: 'Agree with some points and qualify others.',
    instruction: 'Validate the sound aspects of the comment while constructively qualifying or nuancing areas where caveats apply.',
    defaultLength: 'medium',
  },
  {
    id: 'respectful_disagreement',
    name: 'Respectful Disagreement',
    category: 'Agreement & Disagreement',
    description: 'Oppose an argument without attacking the person.',
    instruction: 'Respectfully challenge the central thesis or conclusion of the comment with sound reasoning, without any ad hominem attack.',
    defaultLength: 'medium',
    compatibleIntensity: true,
  },
  {
    id: 'strong_disagreement',
    name: 'Strong Disagreement',
    category: 'Agreement & Disagreement',
    description: 'Firmly challenge an argument using relevant reasoning.',
    instruction: 'Directly and uncompromisingly rebut the claim, using robust logic, counter-evidence, and unwavering clarity while maintaining civility.',
    defaultLength: 'medium',
    compatibleIntensity: true,
  },
  {
    id: 'constructive_criticism',
    name: 'Constructive Criticism',
    category: 'Agreement & Disagreement',
    description: 'Point out weaknesses and offer improvements.',
    instruction: 'Highlight logical flaws or practical limitations in the comment, but actively suggest actionable improvements or better alternatives.',
    defaultLength: 'medium',
  },
  {
    id: 'counterargument',
    name: 'Counterargument',
    category: 'Agreement & Disagreement',
    description: 'Present an alternative position with supporting logic.',
    instruction: 'Introduce a well-developed alternative viewpoint, demonstrating why the counter-position is more sound or sustainable.',
    defaultLength: 'medium',
  },
  {
    id: 'devils_advocate',
    name: 'Devil’s Advocate',
    category: 'Agreement & Disagreement',
    description: 'Explore a reasonable opposing perspective.',
    instruction: 'Adopt an intellectually curious posture to probe the boundaries of the comment by raising valid counter-examples.',
    defaultLength: 'medium',
  },
  {
    id: 'balanced_perspective',
    name: 'Balanced Perspective',
    category: 'Agreement & Disagreement',
    description: 'Recognize valid considerations on different sides.',
    instruction: 'Weigh both sides of the debate judiciously, illuminating valid considerations from multiple viewpoints.',
    defaultLength: 'detailed',
  },
  {
    id: 'fact_based_rebuttal',
    name: 'Fact-Based Rebuttal',
    category: 'Agreement & Disagreement',
    description: 'Respond using evidence and verifiable reasoning.',
    instruction: 'Dismantle inaccurate or misleading claims by citing demonstrable facts, logical sequences, and verifiable realities.',
    defaultLength: 'medium',
    compatibleIntensity: true,
  },
  {
    id: 'point_by_point_rebuttal',
    name: 'Point-by-Point Rebuttal',
    category: 'Agreement & Disagreement',
    description: 'Address individual claims systematically.',
    instruction: 'Dissect the comment claim-by-claim, addressing each assertion systematically with precision.',
    defaultLength: 'detailed',
  },
  {
    id: 'diplomatic_response',
    name: 'Diplomatic Response',
    category: 'Agreement & Disagreement',
    description: 'Handle disagreement tactfully.',
    instruction: 'Deftly navigate a contentious point by framing differences as differing priorities, preserving rapport and harmony.',
    defaultLength: 'medium',
  },
  {
    id: 'conflict_resolving',
    name: 'Conflict-Resolving',
    category: 'Agreement & Disagreement',
    description: 'Reduce tension and move toward understanding.',
    instruction: 'De-escalate friction, build common ground, and steer the dialogue toward productive mutual respect.',
    defaultLength: 'medium',
  },

  // ==========================================
  // CATEGORY C — ASSERTIVE AND PERSUASIVE (25-36)
  // ==========================================
  {
    id: 'confident',
    name: 'Confident',
    category: 'Assertive & Persuasive',
    description: 'Clear, assured and composed.',
    instruction: 'Speak with firm authority and self-assurance, projecting certainty and conviction without arrogance.',
    defaultLength: 'medium',
    compatibleIntensity: true,
  },
  {
    id: 'assertive',
    name: 'Assertive',
    category: 'Assertive & Persuasive',
    description: 'Firmly express a position while respecting others.',
    instruction: 'State boundaries, conclusions, or perspectives firmly and directly without apologizing or backing down.',
    defaultLength: 'medium',
    compatibleIntensity: true,
  },
  {
    id: 'bold',
    name: 'Bold',
    category: 'Assertive & Persuasive',
    description: 'Memorable and impactful without unnecessary aggression.',
    instruction: 'Deliver a powerful, unforgettable statement that cuts through ambiguity with striking clarity.',
    defaultLength: 'short',
    compatibleIntensity: true,
  },
  {
    id: 'persuasive',
    name: 'Persuasive',
    category: 'Assertive & Persuasive',
    description: 'Encourage reconsideration using sound arguments.',
    instruction: 'Use rhetorical appeal, relatable framing, and compelling rational incentives to win over the reader.',
    defaultLength: 'medium',
  },
  {
    id: 'logical',
    name: 'Logical',
    category: 'Assertive & Persuasive',
    description: 'Structured reasoning with clear premises.',
    instruction: 'Build a rigorous argument from explicit premises to an inescapable conclusion using deductive and inductive logic.',
    defaultLength: 'medium',
  },
  {
    id: 'analytical',
    name: 'Analytical',
    category: 'Assertive & Persuasive',
    description: 'Examine causes, evidence and implications.',
    instruction: 'Break down the comment into its constituent mechanisms, underlying variables, and downstream effects.',
    defaultLength: 'detailed',
  },
  {
    id: 'critical_thinking',
    name: 'Critical Thinking',
    category: 'Assertive & Persuasive',
    description: 'Question assumptions and identify logical gaps.',
    instruction: 'Interrogate unspoken assumptions, highlight non-sequiturs, and reveal overlooked dimensions of the topic.',
    defaultLength: 'medium',
  },
  {
    id: 'thought_provoking',
    name: 'Thought-Provoking',
    category: 'Assertive & Persuasive',
    description: 'Encourage deeper reflection.',
    instruction: 'Offer a fresh angle or profound realization that prompts the commenter to pause and reconsider their worldview.',
    defaultLength: 'medium',
  },
  {
    id: 'question_challenge',
    name: 'Question-Based Challenge',
    category: 'Assertive & Persuasive',
    description: 'Challenge an argument using meaningful questions.',
    instruction: 'Employ the Socratic method, guiding the author toward self-correction through insightful, pointed questions.',
    defaultLength: 'short',
  },
  {
    id: 'evidence_seeking',
    name: 'Evidence-Seeking',
    category: 'Assertive & Persuasive',
    description: 'Politely ask for sources and verification.',
    instruction: 'Courteously request primary sources, benchmarks, or verifiable data to substantiate the claims made in the comment.',
    defaultLength: 'short',
  },
  {
    id: 'myth_busting',
    name: 'Myth-Busting',
    category: 'Assertive & Persuasive',
    description: 'Distinguish misconceptions from established facts.',
    instruction: 'Clarify widespread fallacies or common misunderstandings related to the comment, restoring factual accuracy.',
    defaultLength: 'medium',
  },
  {
    id: 'reality_check',
    name: 'Reality Check',
    category: 'Assertive & Persuasive',
    description: 'Correct overstatements and unrealistic assumptions.',
    instruction: 'Ground theoretical or exaggerated claims in real-world friction, practical constraints, and everyday truth.',
    defaultLength: 'medium',
    compatibleIntensity: true,
  },

  // ==========================================
  // CATEGORY D — HUMOUR AND CREATIVE EXPRESSION (37-48)
  // ==========================================
  {
    id: 'humorous',
    name: 'Humorous',
    category: 'Humour & Creative',
    description: 'Lighthearted, funny and relevant.',
    instruction: 'Inject playful wit, relatable amusement, and good humor appropriate to the topic without malice.',
    defaultLength: 'short',
  },
  {
    id: 'witty',
    name: 'Witty',
    category: 'Humour & Creative',
    description: 'Clever, sharp and concise.',
    instruction: 'Deliver a clever, sharp-minded quip or mental connection that elicits a knowing smile.',
    defaultLength: 'short',
  },
  {
    id: 'playful',
    name: 'Playful',
    category: 'Humour & Creative',
    description: 'Light teasing without personal insults.',
    instruction: 'Tease gently and cheerfully like a good friend, keeping the mood joyful and uplifting.',
    defaultLength: 'short',
  },
  {
    id: 'light_sarcasm',
    name: 'Light Sarcasm',
    category: 'Humour & Creative',
    description: 'Subtle irony directed at ideas rather than people.',
    instruction: 'Use subtle, clever irony aimed strictly at the absurdity of the premise, never at the individual person.',
    defaultLength: 'short',
    compatibleIntensity: true,
  },
  {
    id: 'dry_humour',
    name: 'Dry Humour',
    category: 'Humour & Creative',
    description: 'Understated, deadpan comedy.',
    instruction: 'Employ a deadpan, matter-of-fact tone where the humor arises from understated understatement.',
    defaultLength: 'short',
  },
  {
    id: 'satirical',
    name: 'Satirical',
    category: 'Humour & Creative',
    description: 'Use irony to examine contradictions.',
    instruction: 'Highlight hypocrisies or contradictions in the comment through clever satirical observation.',
    defaultLength: 'medium',
  },
  {
    id: 'clever_comeback',
    name: 'Clever Comeback',
    category: 'Humour & Creative',
    description: 'Brief, sharp and non-abusive.',
    instruction: 'Produce a razor-sharp, swift, and memorable retort that gracefully turns the comment back on itself.',
    defaultLength: 'short',
  },
  {
    id: 'one_liner',
    name: 'One-Liner',
    category: 'Humour & Creative',
    description: 'Single memorable sentence.',
    instruction: 'Deliver the entire point in a single, punchy, impactful sentence that sticks in memory.',
    defaultLength: 'short',
  },
  {
    id: 'creative',
    name: 'Creative',
    category: 'Humour & Creative',
    description: 'Fresh wording and original expression.',
    instruction: 'Use evocative vocabulary, unexpected associations, and vivid phrasing that feels genuinely inventive.',
    defaultLength: 'medium',
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    category: 'Humour & Creative',
    description: 'Explain a point through a short relatable story.',
    instruction: 'Convey the insight through a micro-narrative or relatable vignette that illustrates the core truth.',
    defaultLength: 'detailed',
  },
  {
    id: 'metaphorical',
    name: 'Metaphorical',
    category: 'Humour & Creative',
    description: 'Use an analogy to communicate the argument.',
    instruction: 'Illuminate the core concept using an intuitive, vivid analogy or metaphor from familiar life.',
    defaultLength: 'medium',
  },
  {
    id: 'rhetorical',
    name: 'Rhetorical',
    category: 'Humour & Creative',
    description: 'Use purposeful rhetorical questions and emphasis.',
    instruction: 'Structure the reply with cadence, deliberate parallelism, and meaningful rhetorical questions.',
    defaultLength: 'medium',
  },

  // ==========================================
  // CATEGORY E — EMOTIONAL AND RELATIONSHIP (49-60)
  // ==========================================
  {
    id: 'empathetic',
    name: 'Empathetic',
    category: 'Emotional & Relationship',
    description: 'Acknowledge the other person’s feelings.',
    instruction: 'Validate the emotional reality and feelings behind the comment first before offering perspective.',
    defaultLength: 'medium',
  },
  {
    id: 'compassionate',
    name: 'Compassionate',
    category: 'Emotional & Relationship',
    description: 'Respond with deep understanding and care.',
    instruction: 'Speak with genuine kindness, gentleness, and human tenderness toward the author’s struggles.',
    defaultLength: 'medium',
  },
  {
    id: 'supportive',
    name: 'Supportive',
    category: 'Emotional & Relationship',
    description: 'Offer encouragement and reassurance.',
    instruction: 'Reinforce the author’s efforts, express steadfast backing, and boost their morale.',
    defaultLength: 'short',
  },
  {
    id: 'motivational',
    name: 'Motivational',
    category: 'Emotional & Relationship',
    description: 'Inspire constructive, energized action.',
    instruction: 'Ignite enthusiasm, remind the reader of their agency, and rally them toward forward momentum.',
    defaultLength: 'medium',
  },
  {
    id: 'appreciative',
    name: 'Appreciative',
    category: 'Emotional & Relationship',
    description: 'Express recognition and gratitude.',
    instruction: 'Express clear, sincere gratitude and acknowledge the specific value of what was shared.',
    defaultLength: 'short',
  },
  {
    id: 'apologetic',
    name: 'Apologetic',
    category: 'Emotional & Relationship',
    description: 'Acknowledge a mistake appropriately.',
    instruction: 'Take accountability with humility, sincerity, and clear corrective intent without defensiveness.',
    defaultLength: 'short',
  },
  {
    id: 'reassuring',
    name: 'Reassuring',
    category: 'Emotional & Relationship',
    description: 'Reduce uncertainty without false promises.',
    instruction: 'Instill confidence and clarity, alleviating anxiety with grounded, steady reality.',
    defaultLength: 'medium',
  },
  {
    id: 'calming',
    name: 'Calming',
    category: 'Emotional & Relationship',
    description: 'De-escalate strong, agitated emotions.',
    instruction: 'Lower the emotional temperature through serene phrasing, patient tone, and reassuring steadiness.',
    defaultLength: 'medium',
  },
  {
    id: 'encouraging',
    name: 'Encouraging',
    category: 'Emotional & Relationship',
    description: 'Build confidence and hope.',
    instruction: 'Highlight positive potential, affirm progress, and offer hopeful, uplifting perspective.',
    defaultLength: 'short',
  },
  {
    id: 'respectful_firm',
    name: 'Respectful but Firm',
    category: 'Emotional & Relationship',
    description: 'Maintain boundaries without hostility.',
    instruction: 'Enforce clear personal or institutional standards civilly, without aggression or capitulation.',
    defaultLength: 'medium',
    compatibleIntensity: true,
  },
  {
    id: 'heartfelt',
    name: 'Heartfelt',
    category: 'Emotional & Relationship',
    description: 'Sincere and emotionally expressive.',
    instruction: 'Share candid, genuine, and emotionally honest sentiment straight from the heart.',
    defaultLength: 'medium',
  },
  {
    id: 'diplomatic_refusal',
    name: 'Diplomatic Refusal',
    category: 'Emotional & Relationship',
    description: 'Politely decline a request or suggestion.',
    instruction: 'Say a courteous, unmistakable "no" while thanking the sender and preserving good will.',
    defaultLength: 'short',
  },

  // ==========================================
  // CATEGORY F — PROFESSIONAL AND SPECIALIST (61-72)
  // ==========================================
  {
    id: 'corporate_executive',
    name: 'Corporate Executive',
    category: 'Professional & Specialist',
    description: 'Senior leadership C-suite communication.',
    instruction: 'Communicate with strategic elevation, cross-functional poise, governance awareness, and vision.',
    defaultLength: 'medium',
  },
  {
    id: 'managerial',
    name: 'Managerial',
    category: 'Professional & Specialist',
    description: 'Practical, accountable and solution-focused.',
    instruction: 'Focus on timelines, deliverables, resource alignment, and concrete next steps.',
    defaultLength: 'medium',
  },
  {
    id: 'customer_service',
    name: 'Customer Service',
    category: 'Professional & Specialist',
    description: 'Helpful, empathetic and resolution-oriented.',
    instruction: 'Put customer satisfaction first: validate the inconvenience, apologize where due, and offer immediate resolution.',
    defaultLength: 'medium',
  },
  {
    id: 'academic',
    name: 'Academic',
    category: 'Professional & Specialist',
    description: 'Scholarly and carefully qualified.',
    instruction: 'Adopt rigorous scholarly language with appropriate caveats, theoretical grounding, and epistemic modesty.',
    defaultLength: 'detailed',
  },
  {
    id: 'scientific',
    name: 'Scientific',
    category: 'Professional & Specialist',
    description: 'Evidence-led, precise and cautious.',
    instruction: 'Emphasize empirical evidence, statistical caution, reproducible principles, and causality versus correlation.',
    defaultLength: 'detailed',
  },
  {
    id: 'technical_expert',
    name: 'Technical Expert',
    category: 'Professional & Specialist',
    description: 'Technically detailed where warranted.',
    instruction: 'Address architectural, algorithmic, or systems-level specifics with technical mastery and clarity.',
    defaultLength: 'detailed',
  },
  {
    id: 'legal_aware',
    name: 'Legal-Aware',
    category: 'Professional & Specialist',
    description: 'Careful with claims, liability and uncertainty.',
    instruction: 'Frame statements judiciously, avoiding definitive factual assertions of liability, noting uncertainty clearly.',
    defaultLength: 'medium',
  },
  {
    id: 'journalistic',
    name: 'Journalistic',
    category: 'Professional & Specialist',
    description: 'Neutral, clear and fact-focused.',
    instruction: 'Report who, what, when, where, and why with objective attribution and neutral observational prose.',
    defaultLength: 'medium',
  },
  {
    id: 'investigative',
    name: 'Investigative',
    category: 'Professional & Specialist',
    description: 'Examine claims and ask meaningful questions.',
    instruction: 'Probe discrepancies, follow the audit trail of claims, and ask probing questions without inventing allegations.',
    defaultLength: 'medium',
  },
  {
    id: 'educator',
    name: 'Educator',
    category: 'Professional & Specialist',
    description: 'Explain patiently using examples.',
    instruction: 'Break down complex concepts into digestible insights with step-by-step clarity and encouraging guidance.',
    defaultLength: 'detailed',
  },
  {
    id: 'safety_professional',
    name: 'Safety Professional',
    category: 'Professional & Specialist',
    description: 'Hazard, risk, control and prevention-oriented.',
    instruction: 'Highlight root hazards, hierarchy of controls, risk mitigation, and compliance standards prioritizing human wellbeing.',
    defaultLength: 'medium',
  },
  {
    id: 'leadership_perspective',
    name: 'Leadership Perspective',
    category: 'Professional & Specialist',
    description: 'Focus on responsibility, decisions and organizational impact.',
    instruction: 'Frame the issue around stewardship, core values, culture, and long-term team impact.',
    defaultLength: 'medium',
  },

  // ==========================================
  // CATEGORY G — SOCIAL MEDIA AND PUBLIC (73-84)
  // ==========================================
  {
    id: 'linkedin_professional',
    name: 'LinkedIn Professional',
    category: 'Social Media',
    description: 'Polished professional networking reply.',
    instruction: 'Write an insightful, professional commentary that builds professional brand authority and invites network engagement.',
    defaultLength: 'medium',
  },
  {
    id: 'facebook_conversational',
    name: 'Facebook Conversational',
    category: 'Social Media',
    description: 'Relatable, community-friendly and accessible.',
    instruction: 'Keep it friendly, familiar, community-oriented, and warmly relatable.',
    defaultLength: 'short',
  },
  {
    id: 'instagram_casual',
    name: 'Instagram Casual',
    category: 'Social Media',
    description: 'Brief, engaging and visually expressive.',
    instruction: 'Keep it punchy, visual, positive, and lightly emoji-accented where natural.',
    defaultLength: 'short',
  },
  {
    id: 'youtube_comment',
    name: 'YouTube Comment',
    category: 'Social Media',
    description: 'Natural creator and audience discussion.',
    instruction: 'Echo the enthusiastic, direct tone of video audiences, discussing timestamps, production, or concepts naturally.',
    defaultLength: 'short',
  },
  {
    id: 'x_twitter_punchy',
    name: 'X/Twitter Punchy',
    category: 'Social Media',
    description: 'Compact, sharp and high-impact.',
    instruction: 'Craft a compact, high-velocity thought that delivers maximum punch in under 280 characters.',
    defaultLength: 'short',
  },
  {
    id: 'reddit_discussion',
    name: 'Reddit Discussion',
    category: 'Social Media',
    description: 'Contextual, substantive and forum-smart.',
    instruction: 'Provide a thoughtful, nuanced, and detailed forum reply that respects subreddit community norms.',
    defaultLength: 'detailed',
  },
  {
    id: 'public_awareness',
    name: 'Public Awareness',
    category: 'Social Media',
    description: 'Informative and accessible to general audiences.',
    instruction: 'Explain important civic or general-interest information with maximum clarity for the general public.',
    defaultLength: 'medium',
  },
  {
    id: 'community_building',
    name: 'Community Building',
    category: 'Social Media',
    description: 'Encourage respectful participation.',
    instruction: 'Unite contributors, celebrate diverse inputs, and foster a welcoming community ethos.',
    defaultLength: 'medium',
  },
  {
    id: 'engagement_starter',
    name: 'Engagement Starter',
    category: 'Social Media',
    description: 'Invite meaningful responses from followers.',
    instruction: 'Ask an open-ended, compelling question that naturally triggers discussion and shares.',
    defaultLength: 'short',
  },
  {
    id: 'expert_opinion',
    name: 'Expert Opinion',
    category: 'Social Media',
    description: 'Present a carefully supported specialist viewpoint.',
    instruction: 'Deliver a definitive, highly credible perspective backed by domain experience and clear rationale.',
    defaultLength: 'medium',
  },
  {
    id: 'clarification',
    name: 'Clarification',
    category: 'Social Media',
    description: 'Correct misunderstandings clearly.',
    instruction: 'Clear up confusion gently and transparently, setting the record straight without defensiveness.',
    defaultLength: 'short',
  },
  {
    id: 'call_to_action',
    name: 'Call to Action',
    category: 'Social Media',
    description: 'Encourage specific constructive next steps.',
    instruction: 'Drive the reader toward a specific, tangible action or link with compelling reason.',
    defaultLength: 'short',
  },

  // ==========================================
  // CATEGORY H — CULTURAL AND LANGUAGE (85-96)
  // ==========================================
  {
    id: 'native_conversational',
    name: 'Native Conversational',
    category: 'Cultural & Language',
    description: 'Sound completely natural in the target language.',
    instruction: 'Prioritize native linguistic idioms, colloquial cadences, and cultural warmth of the target language rather than literal translation.',
    defaultLength: 'medium',
  },
  {
    id: 'local_expression',
    name: 'Local Expression',
    category: 'Cultural & Language',
    description: 'Use culturally appropriate everyday phrases.',
    instruction: 'Employ regional turns of phrase and localized colloquialisms naturally used by native speakers.',
    defaultLength: 'short',
  },
  {
    id: 'traditional_formal',
    name: 'Traditional Formal',
    category: 'Cultural & Language',
    description: 'Conventional respectful classical language.',
    instruction: 'Use elevated traditional grammar, classic respectful expressions, and customary cultural decorum.',
    defaultLength: 'medium',
  },
  {
    id: 'modern_youthful',
    name: 'Modern Youthful',
    category: 'Cultural & Language',
    description: 'Contemporary, fresh and understandable wording.',
    instruction: 'Use vibrant, contemporary language popular with digital natives while remaining intelligible and stylish.',
    defaultLength: 'short',
  },
  {
    id: 'literary',
    name: 'Literary',
    category: 'Cultural & Language',
    description: 'Elegant, expressive prose.',
    instruction: 'Compose beautifully balanced sentences with aesthetic depth, rich imagery, and rhythmic prose.',
    defaultLength: 'medium',
  },
  {
    id: 'poetic',
    name: 'Poetic',
    category: 'Cultural & Language',
    description: 'Figurative and lyrical rhythm.',
    instruction: 'Infuse lyrical beauty, cadence, and thoughtful evocative sentiment into the response.',
    defaultLength: 'short',
  },
  {
    id: 'proverb_based',
    name: 'Proverb-Based',
    category: 'Cultural & Language',
    description: 'Use suitable established cultural proverbs.',
    instruction: 'Anchor the insight in an authentic, time-tested cultural proverb or traditional wisdom adage.',
    defaultLength: 'medium',
  },
  {
    id: 'philosophical',
    name: 'Philosophical',
    category: 'Cultural & Language',
    description: 'Reflective, exploring principles and meaning.',
    instruction: 'Reflect upon first principles, deeper moral questions, and the broader human condition.',
    defaultLength: 'detailed',
  },
  {
    id: 'spiritual_reflection',
    name: 'Spiritual Reflection',
    category: 'Cultural & Language',
    description: 'Gentle, reflective spiritual framing.',
    instruction: 'Offer gentle, peaceful, and universally mindful framing focused on inner peace, humility, and grace.',
    defaultLength: 'medium',
  },
  {
    id: 'inspirational',
    name: 'Inspirational',
    category: 'Cultural & Language',
    description: 'Positive, uplifting language.',
    instruction: 'Elevate spirits, instill hope, and highlight the triumphant human spirit.',
    defaultLength: 'medium',
  },
  {
    id: 'plain_language',
    name: 'Plain Language',
    category: 'Cultural & Language',
    description: 'Suitable for broad public understanding.',
    instruction: 'Follow plain-language principles: short sentences, active voice, zero jargon, crystal clear meaning.',
    defaultLength: 'short',
  },
  {
    id: 'bilingual',
    name: 'Bilingual / Manglish / Hinglish',
    category: 'Cultural & Language',
    description: 'Combine two user-selected languages naturally.',
    instruction: 'Blend the target language and conversational English naturally, mirroring how bilingual urban speakers chat.',
    defaultLength: 'short',
  },
];

// The 6 default prominent styles displayed on the front UI
export const DEFAULT_REPLY_STYLE_IDS = [
  'professional',
  'friendly',
  'bold',
  'humorous',
  'fact_based_rebuttal',
  'respectful_disagreement',
];

export const DEFAULT_REPLY_STYLES = DEFAULT_REPLY_STYLE_IDS.map(
  (id) => REPLY_STYLES.find((s) => s.id === id)!
);

export function getStyleById(id: string): ReplyStyle {
  return REPLY_STYLES.find((s) => s.id === id) || REPLY_STYLES[0];
}

export function searchReplyStyles(query: string): ReplyStyle[] {
  const q = query.toLowerCase().trim();
  if (!q) return REPLY_STYLES;
  return REPLY_STYLES.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
  );
}

/**
 * Automatically suggests 3 suitable styles based on the comment's tone and context
 */
export function suggestStylesForComment(commentText: string): ReplyStyle[] {
  const lower = commentText.toLowerCase();

  // Technical / Data argument
  if (lower.includes('data') || lower.includes('proof') || lower.includes('percent') || lower.includes('source') || lower.includes('research') || lower.includes('study')) {
    return [getStyleById('fact_based_rebuttal'), getStyleById('analytical'), getStyleById('respectful_disagreement')];
  }

  // Hostile / Aggressive
  if (lower.includes('stupid') || lower.includes('waste') || lower.includes('fake') || lower.includes('worst') || lower.includes('hate') || lower.includes('scam')) {
    return [getStyleById('calming'), getStyleById('respectful_firm'), getStyleById('fact_based_rebuttal')];
  }

  // Congratulatory / Positive
  if (lower.includes('congrats') || lower.includes('awesome') || lower.includes('happy') || lower.includes('great work') || lower.includes('well done') || lower.includes('love this')) {
    return [getStyleById('friendly'), getStyleById('appreciative'), getStyleById('short_sweet')];
  }

  // LinkedIn / Business / Leadership
  if (lower.includes('leadership') || lower.includes('strategy') || lower.includes('career') || lower.includes('company') || lower.includes('hiring') || lower.includes('team')) {
    return [getStyleById('professional'), getStyleById('leadership_perspective'), getStyleById('thought_provoking')];
  }

  // Questioning / Inquisitive
  if (commentText.includes('?') || lower.includes('how') || lower.includes('why') || lower.includes('what if')) {
    return [getStyleById('educator'), getStyleById('balanced_perspective'), getStyleById('friendly')];
  }

  // Default suggestions
  return [getStyleById('professional'), getStyleById('friendly'), getStyleById('respectful_disagreement')];
}
