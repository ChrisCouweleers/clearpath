import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, LineController, BarController, Filler } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import { fmt, fmtFull, monthNames, fullMonthNames, isLight, getChartColors } from '../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController, PointElement, LineElement, LineController, Filler);

export default function MortgageCalc() {
  const [inputs, setInputs] = useState({
    homePrice: 400000, downPaymentAmt: 80000, downPaymentPct: 20,
    loanTerm: 30, interestRate: 6.0, startMonth: 1, startYear: 2026,
    propertyTax: 4800, homeInsurance: 1500, hoaFee: 0, pmiCost: 0,
  });
  const [results, setResults] = useState(null);
  const [amortView, setAmortView] = useState('yearly');
  const [taxOpen, setTaxOpen] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  // Watch for theme changes to re-render charts
  useEffect(() => {
    const observer = new MutationObserver(() => setChartKey(k => k + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const set = (field, value) => {
    setInputs(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'homePrice') {
        next.downPaymentAmt = Math.round(value * prev.downPaymentPct / 100);
      } else if (field === 'downPaymentAmt') {
        next.downPaymentPct = prev.homePrice > 0 ? parseFloat((value / prev.homePrice * 100).toFixed(1)) : 0;
      } else if (field === 'downPaymentPct') {
        next.downPaymentAmt = Math.round(prev.homePrice * value / 100);
      }
      return next;
    });
  };

  const calculate = () => {
    const { homePrice, downPaymentAmt, loanTerm, interestRate, startMonth, startYear,
      propertyTax, homeInsurance, hoaFee, pmiCost } = inputs;

    const loanAmount = homePrice - downPaymentAmt;
    if (loanAmount <= 0 || interestRate <= 0) return;

    const monthlyRate = interestRate / 100 / 12;
    const n = loanTerm * 12;
    const mortgagePayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

    const monthlyTax = propertyTax / 12;
    const monthlyIns = homeInsurance / 12;
    const monthlyPmi = pmiCost / 12;
    const extras = monthlyTax + monthlyIns + hoaFee + monthlyPmi;
    const totalMonthly = mortgagePayment + extras;

    // Amortization
    const amortData = [];
    let balance = loanAmount;
    for (let i = 1; i <= n; i++) {
      const interestPmt = balance * monthlyRate;
      const principalPmt = mortgagePayment - interestPmt;
      balance = Math.max(0, balance - principalPmt);
      const m = (startMonth + i - 1) % 12;
      const y = startYear + Math.floor((startMonth + i - 1) / 12);
      amortData.push({ month: i, date: `${monthNames[m]} ${y}`, interest: interestPmt, principal: principalPmt, balance, payment: mortgagePayment });
    }

    const totalMortgage = mortgagePayment * n;
    const totalInterest = totalMortgage - loanAmount;
    const totalExtras = extras * n;
    const totalOOP = totalMortgage + totalExtras + downPaymentAmt;
    const endMonth = (startMonth + n) % 12;
    const endYear = startYear + Math.floor((startMonth + n) / 12);

    const colors = ['#6C5CE7','#00CEC9','#FDCB6E','#FD79A8','#00B894'];
    const breakdownItems = [
      { name: 'Principal & Interest', monthly: mortgagePayment, total: totalMortgage, color: colors[0] },
    ];
    if (monthlyTax > 0) breakdownItems.push({ name: 'Property Tax', monthly: monthlyTax, total: monthlyTax * n, color: colors[1] });
    if (monthlyIns > 0) breakdownItems.push({ name: 'Home Insurance', monthly: monthlyIns, total: monthlyIns * n, color: colors[2] });
    if (hoaFee > 0) breakdownItems.push({ name: 'HOA Fee', monthly: hoaFee, total: hoaFee * n, color: colors[3] });
    if (monthlyPmi > 0) breakdownItems.push({ name: 'PMI', monthly: monthlyPmi, total: monthlyPmi * n, color: colors[4] });

    const yearlyData = [];
    for (let yr = 0; yr < loanTerm; yr++) {
      const idx = Math.min((yr + 1) * 12 - 1, amortData.length - 1);
      const slice = amortData.slice(yr * 12, (yr + 1) * 12);
      yearlyData.push({
        label: `${startYear + yr + 1}`,
        balance: amortData[idx].balance,
        interest: slice.reduce((s, d) => s + d.interest, 0),
        principal: slice.reduce((s, d) => s + d.principal, 0),
      });
    }

    setResults({
      totalMonthly, homePrice, loanAmount, downPayment: downPaymentAmt,
      totalInterest, totalMortgage, totalOOP, totalExtras,
      endMonth, endYear, loanTerm, interestRate,
      breakdownItems, amortData, yearlyData, n,
    });

    if (window.innerWidth < 768) {
      setTimeout(() => document.getElementById('heroCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  };

  // Auto-calculate on mount
  useEffect(() => { calculate(); }, []);

  return (
    <>
      {/* Input Card */}
      <div className="card">
        <div className="card-title">
          <div className="icon" style={{ background: 'rgba(108,92,231,0.15)', color: 'var(--accent)' }}>🏠</div>
          Loan Details
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Home Price</label>
            <div className="input-wrap">
              <span className="input-prefix">$</span>
              <input type="number" value={inputs.homePrice} onChange={e => set('homePrice', +e.target.value)} min="0" inputMode="numeric" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Down Payment</label>
            <div className="row-2">
              <div className="input-wrap">
                <span className="input-prefix">$</span>
                <input type="number" value={inputs.downPaymentAmt} onChange={e => set('downPaymentAmt', +e.target.value)} min="0" inputMode="numeric" />
              </div>
              <div className="input-wrap">
                <input type="number" value={inputs.downPaymentPct} onChange={e => set('downPaymentPct', +e.target.value)} min="0" max="100" step="0.5" inputMode="decimal" />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Loan Term</label>
            <div className="input-wrap">
              <select value={inputs.loanTerm} onChange={e => set('loanTerm', +e.target.value)}>
                <option value={30}>30 years</option>
                <option value={20}>20 years</option>
                <option value={15}>15 years</option>
                <option value={10}>10 years</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Interest Rate</label>
            <div className="input-wrap">
              <input type="number" value={inputs.interestRate} onChange={e => set('interestRate', +e.target.value)} min="0" max="30" step="0.125" inputMode="decimal" />
              <span className="input-suffix">%</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Start Month</label>
            <div className="input-wrap">
              <select value={inputs.startMonth} onChange={e => set('startMonth', +e.target.value)}>
                {fullMonthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Start Year</label>
            <div className="input-wrap">
              <input type="number" value={inputs.startYear} onChange={e => set('startYear', +e.target.value)} min="2020" max="2050" inputMode="numeric" />
            </div>
          </div>

          {/* Taxes toggle */}
          <div className="toggle-section form-group-full">
            <div className="toggle-header" onClick={() => setTaxOpen(o => !o)}>
              <span>Taxes & Additional Costs</span>
              <div className={`toggle-arrow${taxOpen ? ' open' : ''}`}>▼</div>
            </div>
            <div className={`toggle-content${taxOpen ? ' open' : ''}`}>
              <div className="tax-grid">
                <div className="form-group">
                  <label className="form-label">Annual Property Tax</label>
                  <div className="input-wrap">
                    <span className="input-prefix">$</span>
                    <input type="number" value={inputs.propertyTax} onChange={e => set('propertyTax', +e.target.value)} min="0" inputMode="numeric" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Annual Home Insurance</label>
                  <div className="input-wrap">
                    <span className="input-prefix">$</span>
                    <input type="number" value={inputs.homeInsurance} onChange={e => set('homeInsurance', +e.target.value)} min="0" inputMode="numeric" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly HOA Fee</label>
                  <div className="input-wrap">
                    <span className="input-prefix">$</span>
                    <input type="number" value={inputs.hoaFee} onChange={e => set('hoaFee', +e.target.value)} min="0" inputMode="numeric" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Annual PMI</label>
                  <div className="input-wrap">
                    <span className="input-prefix">$</span>
                    <input type="number" value={inputs.pmiCost} onChange={e => set('pmiCost', +e.target.value)} min="0" inputMode="numeric" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="calc-btn" onClick={calculate}>Calculate Mortgage</button>
      </div>

      {/* Results */}
      {!results ? (
        <div className="placeholder">
          <div className="ph-icon">📊</div>
          <p>Adjust your loan details and hit <strong>Calculate</strong> to see your full mortgage breakdown</p>
        </div>
      ) : (
        <div className="results-area">
          <div className="hero-result fade-in" id="heroCard">
            <div className="hero-label">Estimated Monthly Payment</div>
            <div className="hero-amount">{fmtFull(results.totalMonthly)}</div>
            <div className="hero-sub">Payoff: {fullMonthNames[results.endMonth]} {results.endYear} · {results.loanTerm}-year fixed at {results.interestRate}%</div>
          </div>

          <div className="stats-grid fade-in fade-in-d1">
            <StatCard label="Home Price" value={fmt(results.homePrice)} />
            <StatCard label="Loan Amount" value={fmt(results.loanAmount)} />
            <StatCard label="Down Payment" value={fmt(results.downPayment)} />
            <StatCard label="Total Interest" value={fmt(results.totalInterest)} />
            <StatCard label="Total Payments" value={fmt(results.totalMortgage)} />
            <StatCard label="Total Out-of-Pocket" value={fmt(results.totalOOP)} />
          </div>

          <div className="charts-row fade-in fade-in-d2">
            <div className="card breakdown-card" style={{ marginBottom: 0 }}>
              <div className="card-title" style={{ marginBottom: 14 }}>Monthly Breakdown</div>
              <div className="breakdown-row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 2 }}>
                <span className="breakdown-name"><span className="breakdown-col-header" style={{ marginLeft: 18 }}>Category</span></span>
                <div className="breakdown-values">
                  <span className="breakdown-col-header">Monthly</span>
                  <span className="breakdown-col-header">Total</span>
                </div>
              </div>
              {results.breakdownItems.map((item, i) => (
                <div key={i} className="breakdown-row">
                  <span className="breakdown-name">
                    <span className="breakdown-dot" style={{ background: item.color }} />
                    <span className="breakdown-name-text">{item.name}</span>
                  </span>
                  <div className="breakdown-values">
                    <span>{fmtFull(item.monthly)}</span>
                    <span>{fmt(item.total)}</span>
                  </div>
                </div>
              ))}
              <div className="breakdown-row total">
                <span className="breakdown-name"><span className="breakdown-dot" style={{ background: 'transparent' }} />Total</span>
                <div className="breakdown-values">
                  <span>{fmtFull(results.totalMonthly)}</span>
                  <span>{fmt(results.totalMortgage + results.totalExtras)}</span>
                </div>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title" style={{ marginBottom: 4 }}>Payment Split</div>
              <div className="doughnut-wrap">
                <DoughnutChart key={`d-${chartKey}`} items={results.breakdownItems} />
              </div>
            </div>
          </div>

          <div className="bottom-row fade-in fade-in-d3">
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title" style={{ marginBottom: 4 }}>Balance Over Time</div>
              <div className="area-chart-wrap">
                <BarLineChart key={`b-${chartKey}`} data={results.yearlyData} />
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">Amortization Schedule</div>
              <div className="amort-controls">
                <button className={`amort-btn${amortView === 'yearly' ? ' active' : ''}`} onClick={() => setAmortView('yearly')}>Yearly</button>
                <button className={`amort-btn${amortView === 'monthly' ? ' active' : ''}`} onClick={() => setAmortView('monthly')}>Monthly</button>
              </div>
              <AmortTable data={results.amortData} view={amortView} loanTerm={results.loanTerm} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ========== SUB-COMPONENTS ========== */

function DoughnutChart({ items }) {
  const cc = getChartColors();
  const data = {
    labels: items.map(i => i.name),
    datasets: [{
      data: items.map(i => i.monthly),
      backgroundColor: items.map(i => i.color),
      borderWidth: 0, hoverOffset: 8,
    }],
  };
  const options = {
    cutout: '68%', responsive: true, maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: cc.legend, font: { family: 'DM Sans', size: 11 }, padding: 14, usePointStyle: true, pointStyleWidth: 10 } },
      tooltip: {
        backgroundColor: cc.tooltipBg, titleColor: cc.textColor, bodyColor: cc.textColor,
        titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' },
        borderColor: cc.tooltipBorder, borderWidth: 1,
        callbacks: { label: ctx => ` ${ctx.label}: ${fmtFull(ctx.parsed)}` },
      },
    },
  };
  return <Doughnut data={data} options={options} />;
}

function BarLineChart({ data: yearlyData }) {
  const cc = getChartColors();
  const data = {
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
  };
  const options = {
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
      x: { ticks: { color: cc.tick, font: { family: 'DM Sans', size: 10 }, maxTicksLimit: 12 }, grid: { color: cc.gridFaint } },
      y: { position: 'left', ticks: { color: cc.tick, font: { family: 'DM Sans', size: 10 }, callback: v => fmt(v) }, grid: { color: cc.grid } },
      y1: { position: 'right', ticks: { color: cc.tick, font: { family: 'DM Sans', size: 10 }, callback: v => fmt(v) }, grid: { display: false } },
    },
  };
  return <Bar data={data} options={options} />;
}

function AmortTable({ data, view, loanTerm }) {
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
  for (let yr = 0; yr < loanTerm; yr++) {
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
