// ============================================
// GymPro — Dashboard Page
// Header → Stats → Charts → Quick Actions →
// Recent Activity + Expirations → New Members + Trainer Schedule
// ============================================

import { membersStore, paymentsStore, attendanceStore, subscriptionsStore, trainersStore, formatCurrency, formatDate, formatTime, getInitials, isToday, daysUntil } from '../store.js';
import { renderStatsCard, animateCountUp } from '../components/stats-card.js';
import { createLineChart, createBarChart } from '../components/chart.js';
import { router } from '../router.js';

export async function renderDashboard(container) {
  const members = membersStore.getAll();
  const payments = paymentsStore.getAll();
  const attendance = attendanceStore.getAll();
  const trainers = trainersStore.getAll();

  const activeMembers = members.filter(m => m.status === 'active');
  const expiredMembers = members.filter(m => m.status === 'expired');
  const todayAttendance = attendance.filter(a => isToday(a.checkIn));
  const expiringSoon = members.filter(m => {
    const days = daysUntil(m.subscriptionEnd);
    return days >= 0 && days <= 7 && m.status === 'active';
  });

  // Revenue calculation
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const thisMonthPayments = paidPayments.filter(p => {
    const d = new Date(p.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Recent members (last 5)
  const recentMembers = [...members].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  // Recent payments (last 5)
  const recentPayments = [...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  container.innerHTML = `
    <!-- Header -->
    <div class="dashboard-header">
      <div class="dashboard-welcome">
        <h1>Welcome back, Admin 👋</h1>
        <p>Here's what's happening at your gym today.</p>
      </div>
      <div class="dashboard-date">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        ${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid stagger-children">
      ${renderStatsCard({
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        label: 'Total Members',
        value: members.length,
        trend: 'up',
        trendValue: '+12%',
        variant: 'primary',
      })}
      ${renderStatsCard({
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
        label: 'Active Members',
        value: activeMembers.length,
        trend: 'up',
        trendValue: '+8%',
        variant: 'success',
      })}
      ${renderStatsCard({
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>',
        label: "Today's Check-ins",
        value: todayAttendance.length,
        trend: 'up',
        trendValue: `${todayAttendance.length} today`,
        variant: 'info',
      })}
      ${renderStatsCard({
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
        label: 'Expiring Soon',
        value: expiringSoon.length,
        trend: expiringSoon.length > 3 ? 'up' : 'down',
        trendValue: 'within 7 days',
        variant: 'warning',
      })}
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-card-header">
          <h3 class="chart-card-title">Revenue Trend</h3>
          <span class="badge badge-success badge-dot">This Month: ${formatCurrency(monthlyRevenue)}</span>
        </div>
        <div class="chart-container" style="height:300px;">
          <canvas id="revenue-chart"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header">
          <h3 class="chart-card-title">Weekly Attendance</h3>
          <span class="badge badge-info badge-dot">Today: ${todayAttendance.length}</span>
        </div>
        <div class="chart-container" style="height:300px;">
          <canvas id="attendance-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="dashboard-section">
      <h3 class="dashboard-section-title">Quick Actions</h3>
      <div class="quick-actions stagger-children">
        <button class="quick-action-btn" data-action="add-member">
          <div class="quick-action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          </div>
          <span class="quick-action-label">Add Member</span>
        </button>
        <button class="quick-action-btn" data-action="payment">
          <div class="quick-action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <span class="quick-action-label">New Payment</span>
        </button>
        <button class="quick-action-btn" data-action="checkin">
          <div class="quick-action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>
          </div>
          <span class="quick-action-label">QR Check-in</span>
        </button>
        <button class="quick-action-btn" data-action="workout">
          <div class="quick-action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </div>
          <span class="quick-action-label">Assign Workout</span>
        </button>
        <button class="quick-action-btn" data-action="report">
          <div class="quick-action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
          </div>
          <span class="quick-action-label">Export Report</span>
        </button>
      </div>
    </div>

    <!-- Widgets: Recent Activity + Expiring -->
    <div class="widgets-grid">
      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Activity</h3>
          <button class="btn btn-ghost btn-sm">View All</button>
        </div>
        <div class="timeline">
          ${recentPayments.slice(0, 5).map(p => `
            <div class="timeline-item">
              <div class="timeline-dot ${p.status === 'paid' ? 'success' : 'warning'}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">${p.memberName} — ${formatCurrency(p.amount)}</div>
                <div class="timeline-desc">${p.status === 'paid' ? 'Payment received' : 'Payment pending'} · ${p.method}</div>
                <div class="timeline-time">${formatDate(p.createdAt)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Expiring Soon -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Expiring Soon</h3>
          <span class="badge badge-warning">${expiringSoon.length} members</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${expiringSoon.length === 0 ? '<p style="color:var(--text-tertiary);font-size:var(--text-sm);text-align:center;padding:24px;">No memberships expiring soon 🎉</p>' :
            expiringSoon.slice(0, 6).map(m => {
              const daysLeft = daysUntil(m.subscriptionEnd);
              return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);border-radius:var(--radius-md);background:var(--bg-primary);">
                  <div style="display:flex;align-items:center;gap:var(--space-3);">
                    <div class="avatar avatar-sm">${getInitials(m.name)}</div>
                    <div>
                      <div style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary);">${m.name}</div>
                      <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${m.planName}</div>
                    </div>
                  </div>
                  <span class="badge ${daysLeft <= 2 ? 'badge-danger' : 'badge-warning'}">${daysLeft === 0 ? 'Today' : `${daysLeft}d left`}</span>
                </div>
              `;
            }).join('')
          }
        </div>
      </div>
    </div>

    <!-- New Members + Trainer Schedule -->
    <div class="widgets-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">New Members</h3>
          <button class="btn btn-ghost btn-sm" onclick="location.hash='#/members'">View All</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);">
          ${recentMembers.map(m => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-2) var(--space-3);border-radius:var(--radius-md);transition:background 0.2s;" onmouseover="this.style.background='var(--bg-surface-2)'" onmouseout="this.style.background='transparent'">
              <div style="display:flex;align-items:center;gap:var(--space-3);">
                <div class="avatar avatar-sm">${getInitials(m.name)}</div>
                <div>
                  <div style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary);">${m.name}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${m.planName}</div>
                </div>
              </div>
              <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${formatDate(m.createdAt)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Trainer Schedule</h3>
          <span class="badge badge-info badge-dot">Today</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${trainers.filter(t => t.status === 'active').map(t => {
            const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()];
            const schedule = t.schedule[dayKey];
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);border-radius:var(--radius-md);background:var(--bg-primary);">
                <div style="display:flex;align-items:center;gap:var(--space-3);">
                  <div class="avatar avatar-sm">${getInitials(t.name)}</div>
                  <div>
                    <div style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary);">${t.name}</div>
                    <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${t.specialization}</div>
                  </div>
                </div>
                <span class="badge ${schedule ? 'badge-success' : 'badge-default'}">${schedule || 'Day Off'}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Animate count-up
  animateCountUp();

  // Quick action handlers
  container.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'add-member') router.navigate('/members');
      if (action === 'payment') router.navigate('/payments');
      if (action === 'checkin') router.navigate('/attendance');
      if (action === 'workout') router.navigate('/workouts');
      if (action === 'report') router.navigate('/reports');
    });
  });

  // Render charts
  try {
    // Revenue chart — last 6 months
    const revenueLabels = [];
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      revenueLabels.push(d.toLocaleDateString('en-US', { month: 'short' }));
      const monthPayments = paidPayments.filter(p => {
        const pd = new Date(p.createdAt);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      });
      revenueData.push(monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0));
    }

    await createLineChart(document.getElementById('revenue-chart'), {
      labels: revenueLabels,
      datasets: [{
        label: 'Revenue (EGP)',
        data: revenueData,
        color: '#2563EB',
        bgColor: 'rgba(37, 99, 235, 0.1)',
      }],
    });

    // Attendance chart — last 7 days
    const attendanceLabels = [];
    const attendanceData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      attendanceLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      const dayAttendance = attendance.filter(a => {
        const ad = new Date(a.checkIn);
        return ad.toDateString() === d.toDateString();
      });
      attendanceData.push(dayAttendance.length);
    }

    await createBarChart(document.getElementById('attendance-chart'), {
      labels: attendanceLabels,
      datasets: [{
        label: 'Check-ins',
        data: attendanceData,
        color: '#22C55E',
      }],
    });
  } catch (err) {
    console.warn('Charts could not load:', err);
  }
}
