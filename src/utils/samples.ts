// Helper to convert SVG string to Base64 PNG data URL in browser
export async function svgToPngBase64(svgString: string, width = 800, height = 600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(pngUrl);
      } else {
        URL.revokeObjectURL(url);
        resolve(`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`);
    };

    img.src = url;
  });
}

export interface SampleItem {
  id: string;
  title: string;
  emoji: string;
  description: string;
  getSvg: () => string;
}

export const SAMPLE_SCREENSHOTS: SampleItem[] = [
  {
    id: 'comments',
    title: 'Post & Comments',
    emoji: '💬',
    description: 'LinkedIn discussion with 3 comments',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- LinkedIn Header -->
        <rect x="0" y="0" width="800" height="60" fill="#0a66c2"/>
        <text x="40" y="38" fill="#ffffff" font-size="20" font-weight="bold">LinkedIn</text>
        <text x="140" y="38" fill="#e0f2fe" font-size="14">Post Discussion & Comments</text>

        <!-- Main Post -->
        <rect x="40" y="75" width="720" height="110" rx="12" fill="#f8fafc" stroke="#e2e8f0"/>
        <circle cx="70" cy="105" r="18" fill="#3b82f6"/>
        <text x="70" y="111" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">AR</text>
        <text x="100" y="103" fill="#0f172a" font-size="16" font-weight="bold">Alex Rivera • Founder & CEO</text>
        <text x="100" y="122" fill="#64748b" font-size="12">12h • Edited • 🌐</text>
        <text x="60" y="152" fill="#1e293b" font-size="15">AI tooling is accelerating engineering workflows, but real team leverage requires domain judgment.</text>
        <text x="60" y="172" fill="#1e293b" font-size="15">What has been your team's real experience this quarter?</text>

        <!-- Comment 1 -->
        <rect x="40" y="200" width="720" height="95" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/>
        <circle cx="70" cy="225" r="16" fill="#8b5cf6"/>
        <text x="70" y="231" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">PN</text>
        <text x="96" y="224" fill="#0f172a" font-size="15" font-weight="bold">Priya Nair • 1st</text>
        <text x="96" y="240" fill="#64748b" font-size="12">Lead AI Architect at TechCorp • 2h</text>
        <text x="60" y="268" fill="#1e293b" font-size="14">We reduced routine boilerplate by 45%, but architectural guardrails and code review are more crucial than ever.</text>
        <text x="60" y="286" fill="#64748b" font-size="12">Like • Reply • 34 Likes</text>

        <!-- Comment 2 -->
        <rect x="40" y="310" width="720" height="95" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/>
        <circle cx="70" cy="335" r="16" fill="#059669"/>
        <text x="70" y="341" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">DC</text>
        <text x="96" y="334" fill="#0f172a" font-size="15" font-weight="bold">David Chen • 2nd</text>
        <text x="96" y="350" fill="#64748b" font-size="12">VP Engineering at CloudScale • 1h</text>
        <text x="60" y="378" fill="#1e293b" font-size="14">I am still cautious about hallucinated dependencies and latency spikes in mission-critical real-time banking pipelines.</text>
        <text x="60" y="396" fill="#64748b" font-size="12">Like • Reply • 19 Likes</text>

        <!-- Comment 3 -->
        <rect x="40" y="420" width="720" height="95" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/>
        <circle cx="70" cy="445" r="16" fill="#d97706"/>
        <text x="70" y="451" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">AM</text>
        <text x="96" y="444" fill="#0f172a" font-size="15" font-weight="bold">Amina Al-Mansoor • 3rd</text>
        <text x="96" y="460" fill="#64748b" font-size="12">Global Product Lead • 35m</text>
        <text x="60" y="488" fill="#1e293b" font-size="14">The real breakthrough for our distributed team is multilingual collaboration across Malayalam, Arabic and English!</text>
        <text x="60" y="506" fill="#64748b" font-size="12">Like • Reply • 28 Likes</text>

        <!-- Footer / Input bar -->
        <rect x="40" y="535" width="720" height="45" rx="22" fill="#ffffff" stroke="#94a3b8"/>
        <text x="65" y="562" fill="#94a3b8" font-size="14">Add a thoughtful comment...</text>
      </svg>
    `,
  },
  {
    id: 'chat',
    title: 'Conversation',
    emoji: '💬',
    description: 'Manager asking for revised proposal',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- Mobile Header Bar -->
        <rect x="0" y="0" width="800" height="90" fill="#1e293b"/>
        <circle cx="50" cy="45" r="24" fill="#3b82f6"/>
        <text x="50" y="53" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">SJ</text>
        <text x="90" y="40" fill="#ffffff" font-size="22" font-weight="600">Sarah Jenkins (VP Product)</text>
        <text x="90" y="65" fill="#10b981" font-size="14">Online • Slack Mobile</text>
        <circle cx="750" cy="45" r="6" fill="#94a3b8"/>
        <circle cx="730" cy="45" r="6" fill="#94a3b8"/>
        
        <!-- Chat Date Divider -->
        <rect x="340" y="115" width="120" height="28" rx="14" fill="#334155"/>
        <text x="400" y="134" fill="#cbd5e1" font-size="13" text-anchor="middle">Today, 2:45 PM</text>

        <!-- Message from Sarah -->
        <rect x="50" y="170" width="560" height="150" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <text x="80" y="210" fill="#f8fafc" font-size="20" font-weight="500">Hey Alex! Hope the week is going well.</text>
        <text x="80" y="245" fill="#f8fafc" font-size="20" font-weight="500">Can you send me the revised client proposal by tomorrow</text>
        <text x="80" y="280" fill="#f8fafc" font-size="20" font-weight="500">10:00 AM? The enterprise exec team wants to review it.</text>
        <text x="560" y="305" fill="#94a3b8" font-size="13">2:46 PM</text>

        <!-- Second quick ping -->
        <rect x="50" y="340" width="460" height="70" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <text x="80" y="382" fill="#f8fafc" font-size="19" font-weight="500">Also include the updated tier 2 pricing breakdown please 🙏</text>
        <text x="460" y="398" fill="#94a3b8" font-size="13">2:47 PM</text>

        <!-- Input Box at Bottom -->
        <rect x="40" y="510" width="720" height="60" rx="30" fill="#1e293b" stroke="#475569" stroke-width="2"/>
        <text x="80" y="546" fill="#64748b" font-size="18">Reply to Sarah Jenkins...</text>
        <circle cx="720" cy="540" r="20" fill="#3b82f6"/>
        <polygon points="715,532 730,540 715,548" fill="#ffffff"/>
      </svg>
    `,
  },
  {
    id: 'job',
    title: 'Job Opening',
    emoji: '💼',
    description: 'LinkedIn opening for Marketing Manager',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- LinkedIn Header -->
        <rect x="0" y="0" width="800" height="70" fill="#0a66c2"/>
        <rect x="40" y="18" width="34" height="34" rx="6" fill="#ffffff"/>
        <text x="57" y="42" fill="#0a66c2" font-size="24" font-weight="bold" text-anchor="middle">in</text>
        <text x="90" y="43" fill="#ffffff" font-size="20" font-weight="bold">Jobs</text>

        <!-- Job Card -->
        <rect x="40" y="95" width="720" height="460" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
        
        <!-- Company Logo & Title -->
        <rect x="70" y="125" width="60" height="60" rx="12" fill="#0ea5e9"/>
        <text x="100" y="162" fill="#ffffff" font-size="24" font-weight="bold" text-anchor="middle">ABC</text>
        
        <text x="150" y="145" fill="#0f172a" font-size="24" font-weight="bold">Growth Marketing Manager</text>
        <text x="150" y="172" fill="#334155" font-size="18">ABC Technologies Inc. • Bangalore, India (Hybrid)</text>
        <text x="150" y="196" fill="#64748b" font-size="14">Posted 2 days ago • Over 120 applicants</text>

        <!-- Tags -->
        <rect x="70" y="225" width="120" height="32" rx="16" fill="#e0f2fe"/>
        <text x="130" y="246" fill="#0369a1" font-size="14" font-weight="600" text-anchor="middle">₹24L - ₹32L/yr</text>
        <rect x="205" y="225" width="110" height="32" rx="16" fill="#f1f5f9"/>
        <text x="260" y="246" fill="#475569" font-size="14" font-weight="500" text-anchor="middle">Full-time</text>
        <rect x="330" y="225" width="130" height="32" rx="16" fill="#f1f5f9"/>
        <text x="395" y="246" fill="#475569" font-size="14" font-weight="500" text-anchor="middle">Mid-Senior level</text>

        <!-- Key Qualifications -->
        <text x="70" y="300" fill="#0f172a" font-size="18" font-weight="bold">About the role & requirements:</text>
        <text x="70" y="332" fill="#334155" font-size="16">• 4+ years of B2B SaaS growth marketing, SEO, paid acquisition & lifecycle.</text>
        <text x="70" y="362" fill="#334155" font-size="16">• Proven track record scaling inbound pipeline from $500k to $3M ARR.</text>
        <text x="70" y="392" fill="#334155" font-size="16">• Experience with HubSpot, Google Analytics 4, LinkedIn Campaign Manager.</text>
        <text x="70" y="422" fill="#334155" font-size="16">• Application Deadline: October 25, 2026. Hiring Manager: Rajiv Menon.</text>

        <!-- Apply Button in Screenshot -->
        <rect x="70" y="465" width="200" height="50" rx="25" fill="#0a66c2"/>
        <text x="170" y="497" fill="#ffffff" font-size="18" font-weight="bold" text-anchor="middle">Easy Apply</text>
        <rect x="290" y="465" width="120" height="50" rx="25" fill="#ffffff" stroke="#0a66c2" stroke-width="2"/>
        <text x="350" y="497" fill="#0a66c2" font-size="17" font-weight="600" text-anchor="middle">Save</text>
      </svg>
    `,
  },
  {
    id: 'chart',
    title: 'Stock Chart',
    emoji: '📈',
    description: 'Tata Motors surge +4.7% stock chart',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- Header -->
        <text x="50" y="60" fill="#ffffff" font-size="28" font-weight="bold">TATA MOTORS</text>
        <text x="270" y="60" fill="#94a3b8" font-size="18">NSE: TATAMOTORS</text>
        <text x="50" y="110" fill="#ffffff" font-size="38" font-weight="bold">₹1,284.50</text>
        <text x="260" y="110" fill="#10b981" font-size="24" font-weight="bold">+57.80 (+4.71%)</text>
        <text x="50" y="140" fill="#64748b" font-size="14">Market Open • Oct 12, 03:15 PM IST</text>

        <!-- Chart Grid Lines -->
        <line x1="50" y1="200" x2="750" y2="200" stroke="#1e293b" stroke-dasharray="4"/>
        <line x1="50" y1="280" x2="750" y2="280" stroke="#1e293b" stroke-dasharray="4"/>
        <line x1="50" y1="360" x2="750" y2="360" stroke="#1e293b" stroke-dasharray="4"/>
        <text x="710" y="195" fill="#64748b" font-size="12">1,290.00</text>
        <text x="710" y="275" fill="#64748b" font-size="12">1,250.00</text>
        <text x="710" y="355" fill="#64748b" font-size="12">1,220.00</text>

        <!-- Green Chart Area & Line -->
        <path d="M 50,370 Q 120,360 180,340 T 300,310 T 420,270 T 540,220 T 660,190 L 750,180 L 750,420 L 50,420 Z" fill="url(#chartGrad)" opacity="0.4"/>
        <path d="M 50,370 Q 120,360 180,340 T 300,310 T 420,270 T 540,220 T 660,190 L 750,180" fill="none" stroke="#10b981" stroke-width="4"/>
        <circle cx="750" cy="180" r="6" fill="#10b981"/>

        <!-- Details Bar -->
        <rect x="50" y="460" width="700" height="100" rx="12" fill="#161f30" stroke="#1e293b"/>
        <text x="80" y="495" fill="#94a3b8" font-size="14">Day High</text>
        <text x="80" y="525" fill="#ffffff" font-size="18" font-weight="600">₹1,294.00</text>
        
        <text x="240" y="495" fill="#94a3b8" font-size="14">Day Low</text>
        <text x="240" y="525" fill="#ffffff" font-size="18" font-weight="600">₹1,221.30</text>

        <text x="400" y="495" fill="#94a3b8" font-size="14">Volume</text>
        <text x="400" y="525" fill="#ffffff" font-size="18" font-weight="600">18.42M</text>

        <text x="560" y="495" fill="#94a3b8" font-size="14">52W High</text>
        <text x="560" y="525" fill="#ffffff" font-size="18" font-weight="600">₹1,320.00</text>

        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `,
  },
  {
    id: 'receipt',
    title: 'Receipt / Expense',
    emoji: '📄',
    description: 'Cafe & Roastery itemized receipt',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#f1f5f9;font-family:Courier,monospace;">
        <rect x="180" y="30" width="440" height="540" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.05))"/>
        
        <text x="400" y="80" fill="#0f172a" font-size="20" font-weight="bold" text-anchor="middle">BLUE TOKAI COFFEE ROASTERS</text>
        <text x="400" y="105" fill="#64748b" font-size="13" text-anchor="middle">Indiranagar 100ft Road, Bangalore</text>
        <text x="400" y="125" fill="#64748b" font-size="13" text-anchor="middle">GSTIN: 29AABCU9603R1ZM</text>
        
        <line x1="210" y1="145" x2="590" y2="145" stroke="#cbd5e1" stroke-dasharray="4"/>
        <text x="210" y="170" fill="#334155" font-size="13">Date: 12-Oct-2026 14:12</text>
        <text x="460" y="170" fill="#334155" font-size="13">Bill #: BK-9042</text>
        <text x="210" y="190" fill="#334155" font-size="13">Cashier: Rohan K.</text>
        <line x1="210" y1="205" x2="590" y2="205" stroke="#cbd5e1" stroke-dasharray="4"/>

        <!-- Items -->
        <text x="210" y="235" fill="#0f172a" font-size="14" font-weight="bold">ITEM</text>
        <text x="470" y="235" fill="#0f172a" font-size="14" font-weight="bold">QTY</text>
        <text x="540" y="235" fill="#0f172a" font-size="14" font-weight="bold">PRICE</text>

        <text x="210" y="270" fill="#334155" font-size="14">Iced Sea Salt Mocha</text>
        <text x="480" y="270" fill="#334155" font-size="14">2</text>
        <text x="540" y="270" fill="#334155" font-size="14">$13.50</text>

        <text x="210" y="305" fill="#334155" font-size="14">Almond Croissant</text>
        <text x="480" y="305" fill="#334155" font-size="14">1</text>
        <text x="540" y="305" fill="#334155" font-size="14">$5.25</text>

        <text x="210" y="340" fill="#334155" font-size="14">Attikan Estate Whole Beans</text>
        <text x="480" y="340" fill="#334155" font-size="14">1</text>
        <text x="540" y="340" fill="#334155" font-size="14">$11.50</text>

        <line x1="210" y1="370" x2="590" y2="370" stroke="#cbd5e1"/>
        <text x="210" y="400" fill="#64748b" font-size="14">Subtotal:</text>
        <text x="540" y="400" fill="#334155" font-size="14">$30.25</text>

        <text x="210" y="425" fill="#64748b" font-size="14">Tax (CGST+SGST 5%):</text>
        <text x="540" y="425" fill="#334155" font-size="14">$1.51</text>

        <text x="210" y="450" fill="#64748b" font-size="14">Service Charge (5%):</text>
        <text x="540" y="450" fill="#334155" font-size="14">$1.51</text>

        <line x1="210" y1="475" x2="590" y2="475" stroke="#0f172a" stroke-width="2"/>
        <text x="210" y="510" fill="#0f172a" font-size="18" font-weight="bold">TOTAL PAID:</text>
        <text x="525" y="510" fill="#0f172a" font-size="20" font-weight="bold">$33.27</text>
        <text x="210" y="540" fill="#64748b" font-size="12">Paid via Apple Pay (Visa ending in 4108)</text>
      </svg>
    `,
  },
  {
    id: 'product',
    title: 'Product',
    emoji: '🛍',
    description: 'Noise Cancelling Headphones listing',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
        <!-- Header -->
        <rect x="0" y="0" width="800" height="65" fill="#131921"/>
        <text x="40" y="42" fill="#ff9900" font-size="26" font-weight="bold">amazon</text>
        <rect x="180" y="14" width="460" height="38" rx="6" fill="#ffffff"/>
        <text x="200" y="38" fill="#64748b" font-size="15">Search Sony WH-1000XM5</text>

        <!-- Product Image Placeholder Box -->
        <rect x="50" y="100" width="280" height="280" rx="16" fill="#f8fafc" stroke="#e2e8f0"/>
        <circle cx="190" cy="230" r="70" fill="none" stroke="#334155" stroke-width="14"/>
        <circle cx="150" cy="240" r="26" fill="#334155"/>
        <circle cx="230" cy="240" r="26" fill="#334155"/>
        <text x="190" y="340" fill="#64748b" font-size="13" text-anchor="middle">Silver / Platinum edition</text>

        <!-- Product Info -->
        <text x="360" y="130" fill="#0f172a" font-size="22" font-weight="bold">Sony WH-1000XM5 Wireless Industry</text>
        <text x="360" y="160" fill="#0f172a" font-size="22" font-weight="bold">Leading Noise Canceling Headphones</text>
        <text x="360" y="195" fill="#0284c7" font-size="15">Visit the Sony Store</text>

        <!-- Rating -->
        <text x="360" y="230" fill="#eab308" font-size="18">★★★★★</text>
        <text x="450" y="230" fill="#0284c7" font-size="15">4.7 out of 5 (14,290 ratings)</text>

        <!-- Price -->
        <rect x="360" y="260" width="60" height="24" rx="4" fill="#dc2626"/>
        <text x="390" y="277" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">-15%</text>
        <text x="435" y="280" fill="#0f172a" font-size="30" font-weight="bold">$339.99</text>
        <text x="560" y="280" fill="#64748b" font-size="18" text-decoration="line-through">$399.99</text>
        
        <text x="360" y="325" fill="#15803d" font-size="16" font-weight="600">FREE Prime Delivery Tomorrow, Oct 13</text>
        <text x="360" y="355" fill="#334155" font-size="14">Color: Silver • Battery life: 30 Hours • Fast Charge: 3 min for 3 hrs</text>

        <!-- Action buttons inside product UI -->
        <rect x="360" y="400" width="200" height="46" rx="23" fill="#ffd814"/>
        <text x="460" y="429" fill="#0f172a" font-size="16" font-weight="bold" text-anchor="middle">Add to Cart</text>
        <rect x="580" y="400" width="170" height="46" rx="23" fill="#ffa41c"/>
        <text x="665" y="429" fill="#0f172a" font-size="16" font-weight="bold" text-anchor="middle">Buy Now</text>
      </svg>
    `,
  },
];
