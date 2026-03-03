import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, LineController, BarController, Filler } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import { fmt, fmtFull, monthNames, isLight, getChartColors } from '../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController, PointElement, LineElement, LineController, Filler);

export default function AutoLoanCalc() {
  const [inputs, setInputs] = useState({
    vehiclePrice: 40000,
    loanTerm: 60,
    interestRate: 5.0,
    cashIncentives: 0,
    downPayment: 5000,
    tradeInValue: 0,
    amountOwedOnTrade: 0,
    salesTax: 7.0,
    titleRegFees: 500,
    includeTaxFeesInLoan: true,
  });
  const [results, setResults] = useState(null);
  const [amortView, setAmortView] = useState('yearly');
  const [extraOpen, setExtraOpen] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => setChartKey(k => k + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const set = (field, value) => setInputs(prev => ({ ...prev, [field]: value }));

  const calculate = () => {
    const {
      vehiclePrice, loanTerm, interestRate, cashIncentives,
      downPayment, tradeInValue, amountOwedOnTrade,
      salesTax, titleRegFees, includeTaxFeesInLoan,
    } = inputs;

    const taxAmount = vehiclePrice * salesTax / 100;
    const tradeEquity = tradeInValue - amountOwedOnTrade;
    const upfrontCredits = downPayment + Math.max(0, tradeEquity) + cashIncentives;

    let loanAmount;
    if (includeTaxFeesInLoan) {
      loanAmount = vehiclePrice + taxAmount + titleRegFees - upfrontCredits;
      if (tradeEquity < 0) loanAmount += Math.abs(tradeEquity);
    } else {
      loanAmount = vehiclePrice - upfrontCredits;
      if (tradeEquity < 0) loanAmount += Math.abs(tradeEquity);
    }

    if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0) return;

    const upfrontPayment = includeTaxFeesInLoan
      ? upfrontCredits
      : upfrontCredits + taxAmount + titleRegFees;

    const monthlyRate = interestRate / 100 / 12;
    const n = loanTerm;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

    const totalLoanPayments = monthlyPayment * n;
    const totalInterest = totalLoanPayments - loanAmount;
    const totalCost = vehiclePrice + totalInterest + taxAmount + titleRegFees;

    // Amortization
    const amortData = [];
    let balance = loanAmount;
    const now = new Date();
    const startMonth = now.getMonth();
    const startYear = now.getFullYear();

    for (let i = 1; i <= n; i++) {
      const interestPmt = balance * monthlyRate;
      const principalPmt = monthlyPayment - interestPmt;
      balance = Math.max(0, balance - principalPmt);
      const m = (startMonth + i) % 12;
      const y = startYear + Math.floor((startMonth + i) / 12);
      amortData.push({
        month: i, date: `${monthNames[m]} ${y}`,
        interest: interestPmt, principal: principalPmt, balance, payment: monthlyPayment,
      });
    }

    const totalYears = Math.ceil(n / 12);
    const yearlyData = [];
    for (let yr = 0; yr < totalYears; yr++) {
      const slice = amortData.slice(yr * 12, (yr + 1) * 12);
      if (!slice.length) break;
      yearlyData.push({
        label: `${startYear + yr + 1}`,
        balance: slice[slice.length - 1].balance,
        interest: slice.reduce((s, d) => s + d.interest, 0),
        principal: slice.reduce((s, d) => s + d.principal, 0),
      });
    }

    const breakdownColors = ['#6C5CE7', '#00CEC9', '#FDCB6E', '#FD79A8'];
    const breakdownItems = [
      { name: 'Principal', total: loanAmount, color: breakdownColors[0] },
      { name: 'Interest', total: totalInterest, color: breakdownColors[1] },
    ];
    if (taxAmount > 0) breakdownItems.push({ name: 'Sales Tax', total: taxAmount, color: breakdownColors[2] });
    if (titleRegFees > 0) breakdownItems.push({ name: 'Fees', total: titleRegFees, color: breakdownColors[3] });

    setResults({
      monthlyPayment, loanAmount, totalLoanPayments, totalInterest,
      totalCost, taxAmount, titleRegFees, vehiclePrice, upfrontPayment,
      breakdownItems, amortData, yearlyData,
      loanTerm, interestRate, totalYears,
    });

    if (window.innerWidth < 768) {
      setTimeout(() => document.getElementById('heroCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  };

  useEffect(() => { calculate(); }, []);

  return (
    <>
      {/* Input Card */}
      <div className="card">
        <div className="card-title">
          <div className="icon" style={{ background: 'rgba(0,206,201,0.15)', color: 'var(--accent-2)' }}>🚗</div>
          Vehicle Loan Details
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Auto Price</label>
            <div className="input-wrap">
              <span className="input-prefix">$</span>
              <input type="number" value={inputs.vehiclePrice} onChange={e => set('vehiclePrice', +e.target.value)} min="0" inputMode="numeric" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Loan Term</label>
            <div className="input-wrap">
              <select value={inputs.loanTerm} onChange={e => set('loanTerm', +e.target.value)}>
                <option value={24}>24 months (2 yr)</option>
                <option value={36}>36 months (3 yr)</option>
                <option value={48}>48 months (4 yr)</option>
                <option value={60}>60 months (5 yr)</option>
                <option value={72}>72 months (6 yr)</option>
                <option value={84}>84 months (7 yr)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Interest Rate (APR)</label>
            <div className="input-wrap">
              <input type="number" value={inputs.interestRate} onChange={e => set('interestRate', +e.target.value)} min="0" max="30" step="0.1" inputMode="decimal" />
              <span className="input-suffix">%</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Down Payment</label>
            <div className="input-wrap">
              <span className="input-prefix">$</span>
              <input type="number" value={inputs.downPayment} onChange={e => set('downPayment', +e.target.value)} min="0" inputMode="numeric" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Trade-in Value</label>
            <div className="input-wrap">
              <span className="input-prefix">$</span>
              <input type="number" value={inputs.tradeInValue} onChange={e => set('tradeInValue', +e.target.value)} min="0" inputMode="numeric" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Amount Owed on Trade-in</label>
            <div className="input-wrap">
              <span className="input-prefix">$</span>
              <input type="number" value={inputs.amountOwedOnTrade} onChange={e => set('amountOwedOnTrade', +e.target.value)} min="0" inputMode="numeric" />
            </div>
          </div>

          {/* Taxes, Fees & Incentives */}
          <div className="toggle-section form-group-full">
            <div className="toggle-header" onClick={() => setExtraOpen(o => !o)}>
              <span>Taxes, Fees & Incentives</span>
              <div className={`toggle-arrow${extraOpen ? ' open' : ''}`}>▼</div>
            </div>
            <div className={`toggle-content${extraOpen ? ' open' : ''}`}>
              <div className="tax-grid">
                <div className="form-group">
                  <label className="form-label">Sales Tax</label>
                  <div className="input-wrap">
                    <input type="number" value={inputs.salesTax} onChange={e => set('salesTax', +e.target.value)} min="0" max="20" step="0.1" inputMode="decimal" />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Cash Incentives / Rebates</label>
                  <div className="input-wrap">
                    <span className="input-prefix">$</span>
                    <input type="number" value={inputs.cashIncentives} onChange={e => set('cashIncentives', +e.target.value)} min="0" inputMode="numeric" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Title, Registration & Other Fees</label>
                  <div className="input-wrap">
                    <span className="input-prefix">$</span>
                    <input type="number" value={inputs.titleRegFees} onChange={e => set('titleRegFees', +e.target.value)} min="0" inputMode="numeric" />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>
                    <input
                      type="checkbox"
                      checked={inputs.includeTaxFeesInLoan}
                      onChange={e => set('includeTaxFeesInLoan', e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    Include taxes & fees in loan
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="calc-btn" onClick={calculate}>Calculate Auto Loan</button>
      </div>

      {/* Results */}
      {!results ? (
        <div className="placeholder">
          <div className="ph-icon">🚗</div>
          <p>Enter your vehicle loan details and hit <strong>Calculate</strong></p>
        </div>
      ) : (
        <div className="results-area">
          <div className="hero-result fade-in" id="heroCard">
            <div className="hero-label">Estimated Monthly Payment</div>
            <div className="hero-amount">{fmtFull(results.monthlyPayment)}</div>
            <div className="hero-sub">{results.loanTerm} months at {results.interestRate}% APR</div>
          </div>

          <div className="stats-grid fade-in fade-in-d1">
            <StatCard label="Vehicle Price" value={fmt(results.vehiclePrice)} />
            <StatCard label="Loan Amount" value={fmt(results.loanAmount)} />
            <StatCard label="Upfront Payment" value={fmt(results.upfrontPayment)} />
            <StatCard label="Total Interest" value={fmt(results.totalInterest)} />
            <StatCard label="Total Loan Payments" value={fmt(results.totalLoanPayments)} />
            <StatCard label="Total Cost" value={fmt(results.totalCost)} />
          </div>

          <div className="charts-row fade-in fade-in-d2">
            <div className="card breakdown-card" style={{ marginBottom: 0 }}>
              <div className="card-title" style={{ marginBottom: 14 }}>Cost Breakdown</div>
              <div className="breakdown-row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 2 }}>
                <span className="breakdown-name"><span className="breakdown-col-header" style={{ marginLeft: 18 }}>Category</span></span>
                <div className="breakdown-values"><span className="breakdown-col-header">Amount</span></div>
              </div>
              {results.breakdownItems.map((item, i) => (
                <div key={i} className="breakdown-row">
                  <span className="breakdown-name">
                    <span className="breakdown-dot" style={{ background: item.color }} />
                    <span className="breakdown-name-text">{item.name}</span>
                  </span>
                  <div className="breakdown-values"><span>{fmt(item.total)}</span></div>
                </div>
              ))}
              <div className="breakdown-row total">
                <span className="breakdown-name"><span className="breakdown-dot" style={{ background: 'transparent' }} />Total Cost</span>
                <div className="breakdown-values"><span>{fmt(results.totalCost)}</span></div>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title" style={{ marginBottom: 4 }}>Loan Breakdown</div>
              <div className="doughnut-wrap">
                <AutoDoughnut key={`ad-${chartKey}`} items={results.breakdownItems} />
              </div>
            </div>
          </div>

          <div className="bottom-row fade-in fade-in-d3">
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title" style={{ marginBottom: 4 }}>Balance Over Time</div>
              <div className="area-chart-wrap">
                <BalanceChart key={`bc-${chartKey}`} data={results.yearlyData} />
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">Amortization Schedule</div>
              <div className="amort-controls">
                <button className={`amort-btn${amortView === 'yearly' ? ' active' : ''}`} onClick={() => setAmortView('yearly')}>Yearly</button>
                <button className={`amort-btn${amortView === 'monthly' ? ' active' : ''}`} onClick={() => setAmortView('monthly')}>Monthly</button>
              </div>
              <AmortTable data={results.amortData} view={amortView} totalYears={results.totalYears} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ========== SUB-COMPONENTS ========== */

function AutoDoughnut({ items }) {
  const cc = getChartColors();
  return (
    <Doughnut
      data={{
        labels: items.map(i => i.name),
        datasets: [{ data: items.map(i => i.total), backgroundColor: items.map(i => i.color), borderWidth: 0, hoverOffset: 8 }],
      }}
      options={{
        cutout: '68%', responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: cc.legend, font: { family: 'DM Sans', size: 11 }, padding: 14, usePointStyle: true, pointStyleWidth: 10 } },
          tooltip: {
            backgroundColor: cc.tooltipBg, titleColor: cc.textColor, bodyColor: cc.textColor,
            titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' },
            borderColor: cc.tooltipBorder, borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}` },
          },
        },
      }}
    />
  );
}

function BalanceChart({ data: yearlyData }) {
  const cc = getChartColors();
  return (
    <Bar
      data={{
        labels: yearlyData.map(d => d.label),
        datasets: [
          { label: 'Principal', data: yearlyData.map(d => d.principal), backgroundColor: '#6C5CE7', borderRadius: 2, stack: 'payment', order: 2 },
          { label: 'Interest', data: yearlyData.map(d => d.interest), backgroundColor: '#00CEC9', borderRadius: 2, stack: 'payment', order: 2 },
          {
            label: 'Remaining Balance', data: yearlyData.map(d => d.balance), type: 'line',
            borderColor: '#FD79A8', backgroundColor: isLight() ? 'rgba(253,121,168,0.06)' : 'rgba(253,121,168,0.08)',
            fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5,
            borderWidth: 2.5, yAxisID: 'y1', order: 1,
          },
        ],
      }}
      options={{
        responsive: true, maintainAspectRatio: true, interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { color: cc.legend, font: { family: 'DM Sans', size: 11 }, usePointStyle: true, pointStyleWidth: 10, padding: 16 } },
          tooltip: {
            backgroundColor: cc.tooltipBg, titleColor: cc.textColor, bodyColor: cc.textColor,
            titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' },
            borderColor: cc.tooltipBorder, borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` },
          },
        },
        scales: {
          x: { ticks: { color: cc.tick, font: { family: 'DM Sans', size: 10 } }, grid: { color: cc.gridFaint } },
          y: { position: 'left', ticks: { color: cc.tick, font: { family: 'DM Sans', size: 10 }, callback: v => fmt(v) }, grid: { color: cc.grid } },
          y1: { position: 'right', ticks: { color: cc.tick, font: { family: 'DM Sans', size: 10 }, callback: v => fmt(v) }, grid: { display: false } },
        },
      }}
    />
  );
}

function AmortTable({ data, view, totalYears }) {
  if (view === 'monthly') {
    return (
      <div className="amort-table-wrap">
        <table className="amort">
          <thead><tr><th>Period</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.date}</td><td>{fmtFull(d.payment)}</td><td>{fmtFull(d.principal)}</td><td>{fmtFull(d.interest)}</td><td>{fmtFull(d.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const years = [];
  for (let yr = 0; yr < totalYears; yr++) {
    const slice = data.slice(yr * 12, (yr + 1) * 12);
    if (!slice.length) break;
    years.push({
      label: `Year ${yr + 1}`,
      payment: slice.reduce((s, d) => s + d.payment, 0),
      principal: slice.reduce((s, d) => s + d.principal, 0),
      interest: slice.reduce((s, d) => s + d.interest, 0),
      balance: slice[slice.length - 1].balance,
    });
  }

  return (
    <div className="amort-table-wrap">
      <table className="amort">
        <thead><tr><th>Period</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
        <tbody>
          {years.map((y, i) => (
            <tr key={i} className="year-row">
              <td>{y.label}</td><td>{fmt(y.payment)}</td><td>{fmt(y.principal)}</td><td>{fmt(y.interest)}</td><td>{fmt(y.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
