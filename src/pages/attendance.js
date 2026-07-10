// ============================================
// GymPro — Attendance Page
// QR Check-in + Manual + History
// ============================================

import { attendanceStore, membersStore, formatDate, formatTime, getInitials, isToday } from '../store.js';
import { createManualCheckIn } from '../components/qr-scanner.js';
import { showToast } from '../components/toast.js';
import { createTable } from '../components/table.js';

export function renderAttendance(container) {
  const allAttendance = attendanceStore.getAll();
  const todayList = allAttendance.filter(a => isToday(a.checkIn));

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Attendance</h1>
        <p class="page-subtitle">QR check-in and attendance tracking</p>
      </div>
      <div class="page-header-actions">
        <span class="badge badge-info" style="font-size:var(--text-sm);padding:8px 16px;">Today: ${todayList.length} check-ins</span>
      </div>
    </div>

    <div id="checkin-area"></div>

    <div class="tabs" style="margin:var(--space-6) 0;">
      <div class="tab active" data-tab="today">Today <span class="tab-count">${todayList.length}</span></div>
      <div class="tab" data-tab="history">History <span class="tab-count">${allAttendance.length}</span></div>
    </div>
    <div id="attendance-table"></div>
  `;

  // QR Check-in area
  createManualCheckIn(document.getElementById('checkin-area'), {
    onCheckIn: (qrCode) => {
      const member = membersStore.query(m => m.qrCode === qrCode)[0];
      if (!member) {
        showToast('error', 'Not Found', `No member found with QR code: ${qrCode}`);
        return;
      }
      if (member.status === 'expired') {
        showToast('warning', 'Expired Membership', `${member.name}'s membership has expired.`);
        return;
      }
      // Check if already checked in today
      const already = allAttendance.find(a => a.memberId === member.id && isToday(a.checkIn));
      if (already) {
        showToast('warning', 'Already Checked In', `${member.name} already checked in today.`);
        return;
      }
      attendanceStore.create({
        memberId: member.id,
        memberName: member.name,
        checkIn: new Date().toISOString(),
        method: 'manual',
      });
      showToast('success', 'Check-in Successful', `${member.name} has been checked in.`);
      renderAttendance(container);
    },
  });

  let showToday = true;

  function renderTable() {
    const data = showToday
      ? attendanceStore.getAll().filter(a => isToday(a.checkIn))
      : attendanceStore.getAll();

    createTable(document.getElementById('attendance-table'), {
      columns: [
        { key: 'memberName', label: 'Member', render: (v) => `<div style="display:flex;align-items:center;gap:8px;"><div class="avatar avatar-sm">${getInitials(v)}</div><span style="font-weight:500;color:var(--text-primary);">${v}</span></div>` },
        { key: 'checkIn', label: 'Date', render: (v) => formatDate(v) },
        { key: 'checkIn', label: 'Time', render: (v) => new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
        { key: 'method', label: 'Method', render: (v) => `<span class="badge badge-${v === 'qr' ? 'info' : 'default'}">${v === 'qr' ? 'QR Scan' : 'Manual'}</span>` },
      ],
      data: [...data].sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn)),
      searchPlaceholder: 'Search by member name...',
      pageSize: 15,
    });
  }

  renderTable();

  // Tab switching
  container.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      showToday = tab.dataset.tab === 'today';
      renderTable();
    });
  });
}
