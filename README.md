
# HDFC Mutual Fund — Goal-Based SIP Calculator
### FinCal Innovation Hackathon Submission — Co-Sponsored by HDFC Mutual Fund

---

## 🌐 Live Demo

> Click below to test the calculator instantly — no setup required!

### 👉 https://fincal-sip-calculator.vercel.app/

---

## 📌 About

A Goal-Based SIP Investment Calculator built for the FinCal Innovation Hackathon
co-sponsored by HDFC Mutual Fund. Designed exclusively for Investor Education and
Awareness — helping everyday Indian investors understand how inflation, time horizon,
and expected returns shape their monthly investment requirements.

> This tool does not promote any specific scheme or make any performance commitments.

---

## ✨ Features

### 🎯 Core Calculator
- 6 visual goal cards — Education, Home, Retirement, Wedding, Vehicle, Custom
- Interactive sliders for Time Horizon, Inflation Rate, Expected Return
- Mathematically verified results — zero difference from industry standard formulas
- All assumptions user-editable and clearly disclosed

### 📈 Enhancements (as per hackathon PDF)
- Step-Up SIP — Annual top-up with year-wise compounding logic
- Inflation Buckets — Education (8%), Medical (10%), Lifestyle (6%)
- Late Start Penalty — Real cost of delaying investment by 1-5 years
- Scenario Presets — Conservative / Moderate / Aggressive

### 🎓 Educational Features
- Smart Insights — 4 auto-generated insights after every calculation
- Tooltip Explainers — Contextual help on every slider
- Formula Step Explainer — Collapsible step-by-step breakdown with real values
- Behavioural Nudges — Live warnings for unrealistic assumptions

### 📊 Visualisation
- Dual-line Growth Chart (Corpus vs Invested)
- Donut Chart — Your Money vs Market Returns
- Visual Milestone Timeline — dot-on-track from Rs 5L to Rs 10Cr
- Risk Gauge — SVG arc (Low / Moderate / Elevated / High Risk)
- Animated Number Counter — smooth count-up on all results

### 🤖 AI Financial Advisor
- Powered by Groq API (LLaMA 3.1) — fast, free, India-compatible
- Context-aware — AI knows your current SIP plan
- 6 quick-question shortcuts
- Voice Input — en-IN / hi-IN / ta-IN speech recognition
- Responds automatically in user selected language

### 🌐 Trilingual Support
| Language | Status |
|----------|--------|
| English (EN) | Full support |
| Hindi (हिन्दी) | Full support |
| Tamil (தமிழ்) | Full support |

### 📄 Other
- PDF Download — Full investment plan with insights and disclaimer
- WCAG 2.1 AA — Full accessibility compliance
- Fully Responsive — Desktop, Tablet, Mobile, Small Mobile

---

## 🛠️ Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.5.9 | Frontend framework |
| Node.js | 22.11.0 | Backend runtime |
| npm | 10.9.0 | Package manager |
| MySQL | 8.x | Database |
| Drupal | 10.5.6 | CMS integration |
| PHP | 8.1 | Drupal backend |
| Groq API | LLaMA 3.1 | AI Financial Advisor |
| Vercel | - | Deployment platform |
| Recharts | - | Growth chart library |

---

## 📁 Project Structure
```
fincal-v2/
├── components/
│   ├── GrowthChart.js        # Interactive dual-line area chart
│   └── MilestoneTable.js     # Year-by-year milestone table
├── db/
│   └── schema.sql            # MySQL database schema
├── drupal/
│   └── modules/sip_calculator/  # Drupal 10.5.6 module
├── lib/
│   ├── finance.js            # All financial formulas
│   ├── db.js                 # MySQL connection pool
│   └── i18n.js               # EN / Hindi / Tamil translations
├── pages/
│   ├── api/
│   │   ├── calculate.js      # SIP calculation REST API
│   │   └── ai-advisor.js     # AI Financial Advisor (Groq)
│   └── index.js              # Main calculator page
├── styles/
│   └── globals.css           # HDFC brand styles + responsive
├── .env.local                # API keys (not in repo)
├── next.config.js
└── package.json
```

---

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/shobikarajamani270-a11y/fincal-sip-calculator.git
cd fincal-sip-calculator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create `.env.local` in root folder:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=sip_calculator
GROQ_API_KEY=gsk_your_groq_key_here
```
Get free Groq API key at: https://console.groq.com

### 4. Run development server
```bash
npm run dev
```

### 5. Open in browser

**On Laptop / Desktop:**
```
http://localhost:3000
```

> Note: The terminal may show http://0.0.0.0:3000 — this is completely normal.
> Always open http://localhost:3000 in your browser on laptop.

**On Mobile (same WiFi network as laptop):**
```
Step 1 — Find your laptop IP address:
Run in terminal: ipconfig   (Windows)

Step 2 — Look for IPv4 Address under Wireless LAN:
Example: 192.168.43.178

Step 3 — Open on phone browser:
http://192.168.43.178:3000
```

> Make sure your phone and laptop are connected to the same WiFi network.

### 6. Database Setup (Optional)
Only required to save calculation history via the API.
```bash
mysql -u root -p < db/schema.sql
```

---

## 🧮 Financial Formulas

### Step 1 — Inflate Goal Value
```
FV = Present Cost x (1 + Inflation Rate / 100) ^ Years
```

### Step 2 — Required Monthly SIP
```
r   = Annual Return / 100 / 12
n   = Years x 12
SIP = FV x r / (((1 + r)^n - 1) x (1 + r))
```

### Step-Up SIP
```
New SIP = Previous SIP x (1 + Top-up Rate)
FV = Sum of FV of each year's SIP compounded to end of tenure
```

---

## ✅ Verified Sample Calculations
All results verified at zero difference from industry standard.

| Goal | Present Cost | Years | Inflation | Return | SIP/month |
|------|-------------|-------|-----------|--------|-----------|
| Education | Rs 15,00,000 | 12 | 6% | 12% | Rs 9,366 |
| Home | Rs 50,00,000 | 15 | 6% | 12% | Rs 23,748 |
| Retirement | Rs 1,00,00,000 | 25 | 6% | 12% | Rs 22,617 |
| Wedding | Rs 20,00,000 | 5 | 6% | 12% | Rs 32,447 |
| Vehicle | Rs 12,00,000 | 4 | 6% | 12% | Rs 24,500 |

---

## 📱 Responsive Breakpoints

| Device | Breakpoint | Layout |
|--------|-----------|--------|
| Large Desktop | > 1280px | Full 2-column grid |
| Laptop | > 1024px | 2-column grid |
| Tablet | <= 1024px | Single column |
| Mobile | <= 768px | Compact single column |
| Small Mobile | <= 480px | Most compact layout |

---

## ♿ Accessibility (WCAG 2.1 AA)
- Semantic HTML with proper landmark roles
- Full ARIA labels on all inputs and interactive elements
- aria-live on results section for screen readers
- Keyboard navigation fully supported
- Skip-to-main-content link
- Minimum contrast ratio 4.5:1
- Error states with role="alert"
- Focus-visible on all interactive elements

---

## 🎨 Brand Guidelines
- Blue: #224c87
- Red: #da3832
- Grey: #919090
- Fonts: Montserrat, Arial, Verdana
- No growth arrows or exaggerated visual metaphors

---

## ✔️ Compliance
- Exact HDFC Mutual Fund mandated disclaimer in 3+ places
- No scheme recommendations anywhere
- No performance commitments or guarantee language
- All assumptions editable and transparently disclosed
- Positioned as Investor Education and Awareness only

---

## ⚠️ Disclaimer

> This tool has been designed for information purposes only. Actual results may vary
> depending on various factors involved in capital market. Investor should not consider
> above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may
> or may not be sustained in future and is not a guarantee of any future returns.

---

## 👩‍💻 Developed By

**Shobika R and Kirutheen Kumar R** for 
FinCal Innovation Hackathon — Co-Sponsored by HDFC Mutual Fund

---

## 🔗 Links

| | Link |
|--|------|
| Live Demo | https://fincal-sip-calculator.vercel.app/ |
| GitHub | https://github.com/shobikarajamani270-a11y/Fincal-sip-calculator |
