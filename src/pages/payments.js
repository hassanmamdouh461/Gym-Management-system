// ============================================
// GymPro — Payments Page
// ============================================

import { paymentsStore, membersStore, plansStore, formatCurrency, formatDate, getInitials } from '../store.js';
import { createTable } from '../components/table.js';
import { openDrawer, closeDrawer } from '../components/drawer.js';
import { showToast } from '../components/toast.js';
import { renderStatsCard, animateCountUp } from '../components/stats-card.js';

export function renderPayments(container) {
  const payments = paymentsStore.getAll();
  const paid = payments.filter(p => p.status === 'paid');
  const pending = payments.filter(p => p.status === 'pending');
  const totalRevenue = paid.reduce((s, p) => s + p.amount, 0);

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Payments</h1>
        <p class="page-subtitle">Track payments, invoices, and revenue</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary btn-md" id="new-payment-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          New Payment
        </button>
      </div>
    </div>

    <div class="stats-grid stagger-children" style="grid-template-columns:repeat(3,1fr);margin-bottom:var(--space-6);">
      ${renderStatsCard({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', label: 'Total Revenue', value: formatCurrency(totalRevenue), variant: 'success' })}
      ${renderStatsCard({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>', label: 'Total Payments', value: payments.length, variant: 'primary' })}
      ${renderStatsCard({ icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>', label: 'Pending', value: pending.length, trend: pending.length > 0 ? 'up' : 'down', trendValue: pending.length > 0 ? 'Action needed' : 'All clear', variant: 'warning' })}
    </div>

    <div id="payments-table"></div>
  `;

  animateCountUp();

  createTable(document.getElementById('payments-table'), {
    columns: [
      { key: 'memberName', label: 'Member', render: (v) => `<div style="display:flex;align-items:center;gap:8px;"><div class="avatar avatar-sm">${getInitials(v)}</div><span style="font-weight:500;color:var(--text-primary);">${v}</span></div>` },
      { key: 'amount', label: 'Amount', render: (v) => `<span style="font-weight:600;color:var(--text-primary);">${formatCurrency(v)}</span>` },
      { key: 'method', label: 'Method', render: (v) => `<span style="text-transform:capitalize;">${v?.replace('_', ' ')}</span>` },
      { key: 'invoiceNumber', label: 'Invoice' },
      { key: 'status', label: 'Status', render: (v) => `<span class="badge badge-${v === 'paid' ? 'success' : 'warning'} badge-dot">${v}</span>` },
      { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
    ],
    data: [...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    searchPlaceholder: 'Search payments...',
    pageSize: 10,
    onRowClick: (row) => {
      openDrawer({
        title: `Payment — ${row.invoiceNumber}`,
        size: 'sm',
        content: `
          <div class="detail-grid">
            <div class="detail-item"><div class="detail-label">Member</div><div class="detail-value">${row.memberName}</div></div>
            <div class="detail-item"><div class="detail-label">Amount</div><div class="detail-value">${formatCurrency(row.amount)}</div></div>
            <div class="detail-item"><div class="detail-label">Method</div><div class="detail-value" style="text-transform:capitalize;">${row.method?.replace('_',' ')}</div></div>
            <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value"><span class="badge badge-${row.status === 'paid' ? 'success' : 'warning'}">${row.status}</span></div></div>
            <div class="detail-item"><div class="detail-label">Invoice</div><div class="detail-value">${row.invoiceNumber}</div></div>
            <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${formatDate(row.createdAt)}</div></div>
          </div>
        `,
      });
    },
  });

  // New Payment
  document.getElementById('new-payment-btn')?.addEventListener('click', () => {
    const members = membersStore.getAll();
    openDrawer({
      title: 'New Payment',
      size: 'md',
      content: `
        <div class="form-group" style="margin-bottom:var(--space-4);">
          <label class="form-label">Select Member</label>
          <select class="form-select" id="pay-member">${members.map(m => `<option value="${m.id}">${m.name} (${m.qrCode})</option>`).join('')}</select>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
          <label class="form-label">Amount (EGP)</label>
          <input type="number" class="form-input" id="pay-amount" placeholder="500" />
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
          <label class="form-label">Payment Method</label>
          <select class="form-select" id="pay-method"><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option></select>
        </div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="pay-notes" placeholder="Optional notes..." rows="2"></textarea></div>
      `,
      footer: '<button class="btn btn-secondary btn-md" onclick="document.getElementById(\'drawer-root\').innerHTML=\'\'">Cancel</button><button class="btn btn-primary btn-md" id="pay-save">Save Payment</button>',
    });
    document.getElementById('pay-save')?.addEventListener('click', () => {
      const memberId = document.getElementById('pay-member')?.value;
      const amount = parseInt(document.getElementById('pay-amount')?.value);
      if (!amount) { showToast('error', 'Required', 'Please enter an amount.'); return; }
      const member = membersStore.getById(memberId);
      paymentsStore.create({
        memberId, memberName: member?.name || 'Unknown',
        amount, method: document.getElementById('pay-method')?.value || 'cash',
        status: 'paid', invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
        notes: document.getElementById('pay-notes')?.value || '',
      });
      showToast('success', 'Payment Saved', `${formatCurrency(amount)} from ${member?.name || 'Unknown'}.`);
      closeDrawer();
      renderPayments(container);
    });
  });
}
