export const fmt = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const fmtFull = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const fullMonthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function isLight() {
  return document.documentElement.getAttribute('data-theme') === 'light';
}

export function getChartColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    legend: s.getPropertyValue('--chart-legend').trim(),
    tooltipBg: s.getPropertyValue('--chart-tooltip-bg').trim(),
    tooltipBorder: s.getPropertyValue('--chart-tooltip-border').trim(),
    grid: s.getPropertyValue('--chart-grid').trim(),
    gridFaint: s.getPropertyValue('--chart-grid-faint').trim(),
    tick: s.getPropertyValue('--chart-tick').trim(),
    textColor: isLight() ? '#1A1D2E' : '#E8ECF4',
  };
}
