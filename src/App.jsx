import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MortgageCalc from './pages/MortgageCalc';
import AutoLoanCalc from './pages/AutoLoanCalc';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mortgage" element={<MortgageCalc />} />
        <Route path="/auto-loan" element={<AutoLoanCalc />} />
      </Routes>
    </Layout>
  );
}
