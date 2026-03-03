import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-grid fade-in">
      <Link to="/mortgage" className="calc-card">
        <div className="calc-card-icon" style={{ background: 'rgba(108,92,231,0.15)' }}>🏡</div>
        <h3>Mortgage Calculator</h3>
        <p>Estimate monthly payments, see amortization schedules, and break down total costs for your home loan.</p>
        <span className="arrow">→</span>
      </Link>

      <Link to="/auto-loan" className="calc-card">
        <div className="calc-card-icon" style={{ background: 'rgba(0,206,201,0.15)' }}>🚗</div>
        <h3>Auto Loan Calculator</h3>
        <p>Calculate monthly car payments, compare loan terms, and see total interest paid over the life of your loan.</p>
        <span className="arrow">→</span>
      </Link>

      <div className="calc-card coming-soon">
        <div className="calc-card-icon" style={{ background: 'rgba(253,121,168,0.15)' }}>💳</div>
        <h3>Debt Payoff Calculator</h3>
        <p>Create a payoff plan for credit cards and other debts using avalanche or snowball methods.</p>
      </div>

      <div className="calc-card coming-soon">
        <div className="calc-card-icon" style={{ background: 'rgba(253,203,110,0.15)' }}>📈</div>
        <h3>Investment Calculator</h3>
        <p>Project compound growth, compare investment scenarios, and plan your retirement savings.</p>
      </div>
    </div>
  );
}
