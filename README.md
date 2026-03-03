# 🧭 Clearpath — Financial Calculators

Modern, responsive financial calculators with interactive charts and detailed breakdowns.

🔗 **Live:** [clearpath-calculators.netlify.app](https://clearpath-calculators.netlify.app)

---

## 📱 Calculators

### 🏡 Mortgage Calculator

Estimate your monthly home loan payment with a full cost breakdown.

**Inputs:** Home price, down payment ($ or %), loan term, interest rate, start date, property tax, home insurance, HOA fees, and PMI.

**Results:** Monthly payment, payoff date, 6-stat overview, monthly breakdown table, payment split donut chart, balance over time chart, and a full amortization schedule (yearly or monthly view).

### 🚗 Auto Loan Calculator

Calculate your monthly car payment and see the true total cost.

**Inputs:** Auto price, loan term, APR, down payment, trade-in value, amount owed on trade-in, sales tax, cash incentives/rebates, title & registration fees, and an option to include taxes & fees in the loan.

**Results:** Monthly payment, 6-stat overview, cost breakdown table, loan breakdown donut chart, balance over time chart, and a full amortization schedule (yearly or monthly view).

---

## ✨ Features

- 🌗 **Light & dark mode** — toggle in the header, remembers your preference
- 📊 **Interactive Chart.js charts** — hover for detailed tooltips
- 📱 **Fully responsive** — desktop, tablet, and phone
- ⚡ **Auto-calculates** on page load with sensible defaults

---

## 🛠️ Run Locally

```bash
git clone https://github.com/yourusername/clearpath.git
cd clearpath
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📦 Build & Deploy

```bash
npm run build
```

Upload the `dist` folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

---

## 🧰 Tech Stack

| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router | Page navigation |
| Chart.js + react-chartjs-2 | Charts & visualizations |
| Vite | Build tool |
| Google Fonts | DM Sans + Playfair Display |

---

<p align="center">Built with ☕ and 🧮 — <strong>Clearpath</strong> © 2026</p>
