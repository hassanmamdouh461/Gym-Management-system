// ============================================
// GymPro — Reports Page
// Revenue, Attendance, Membership reports + CSV export
// ============================================

import { membersStore, paymentsStore, attendanceStore, formatCurrency, formatDate } from '../store.js';
import { createLineChart, createBarChart, createDoughnutChart } from '../components/chart.js';
import { renderStatsCard, animateCountUp } from '../components/stats-card.js';
import { showToast } from '../components/toast.js';

export async function renderReports(container) {
  const members = membersStore.getAll();
  const payments = paymentsStore.getAll();
  const attendance = attendanceStore.getAll();

  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalRevenue = paidPayments.reduce((s, p) => s + p.amount, 0);
  const activeMembers = members.filter(m => m.status === 'active').length;
  const expiredMembers = members.filter(m => m.status === 'expired').length;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Reports</h1>
        <p class="page-subtitle">Analytics, trends, and data exports</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md" id="export-csv-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="reports-summary stagger-children">
      ${renderStatsCard({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', label: 'Total Revenue', value: formatCurrency(totalRevenue), variant: 'success' })}
      ${renderStatsCard({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', label: 'Total Members', value: members.length, variant: 'primary' })}
      ${renderStatsCard({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M7 12h10"/></svg>', label: 'Total Check-ins', value: attendance.length, variant: 'info' })}
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-card-header"><h3 class="chart-card-title">Revenue (6 Months)</h3></div>
        <div class="chart-container" style="height:300px;"><canvas id="report-revenue-chart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header"><h3 class="chart-card-title">Membership Distribution</h3></div>
        <div class="chart-container" style="height:300px;"><canvas id="report-membership-chart"></canvas></div>
      </div>
    </div>
    <div class="charts-grid" style="margin-top:var(--space-6);">
      <div class="chart-card">
        <div class="chart-card-header"><h3 class="chart-card-title">Daily Attendance (30 Days)</h3></div>
        <div class="chart-container" style="height:300px;"><canvas id="report-attendance-chart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header"><h3 class="chart-card-title">Members by Goal</h3></div>
        <div class="chart-container" style="height:300px;"><canvas id="report-goals-chart"></canvas></div>
      </div>
    </div>
  `;

  animateCountUp();

  try {
    // Revenue chart
    const revLabels = []; const revData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      revLabels.push(d.toLocaleDateString('en-US', { month: 'short' }));
      const mp = paidPayments.filter(p => { const pd = new Date(p.createdAt); return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear(); });
      revData.push(mp.reduce((s, p) => s + p.amount, 0));
    }
    await createLineChart(document.getElementById('report-revenue-chart'), { labels: revLabels, datasets: [{ label: 'Revenue (EGP)', data: revData }] });

    // Membership distribution
    await createDoughnutChart(document.getElementById('report-membership-chart'), { labels: ['Active', 'Expired'], data: [activeMembers, expiredMembers], colors: ['#22C55E', '#EF4444'] });

    // Attendance (30 days)
    const attLabels = []; const attData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      attLabels.push(d.getDate().toString());
      attData.push(attendance.filter(a => new Date(a.checkIn).toDateString() === d.toDateString()).length);
    }
    await createBarChart(document.getElementById('report-attendance-chart'), { labels: attLabels, datasets: [{ label: 'Check-ins', data: attData, color: '#06B6D4' }] });

    // Goals chart
    const goals = {};
    members.forEach(m => { goals[m.goal] = (goals[m.goal] || 0) + 1; });
    await createDoughnutChart(document.getElementById('report-goals-chart'), { labels: Object.keys(goals), data: Object.values(goals), colors: ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#7C3AED'] });
  } catch (err) { console.warn('Charts error:', err); }

  // CSV Export
  document.getElementById('export-csv-btn')?.addEventListener('click', () => {
    const csvRows = ['Name,Email,Phone,Plan,Status,Start,End'];
    members.forEach(m => { csvRows.push(`"${m.name}","${m.email}","${m.phone}","${m.planName}","${m.status}","${formatDate(m.subscriptionStart)}","${formatDate(m.subscriptionEnd)}"`); });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `GymPro_Members_Report_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Export Complete', 'CSV file has been downloaded.');
  });
}
