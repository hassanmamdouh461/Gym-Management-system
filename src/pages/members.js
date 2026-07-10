// ============================================
// GymPro — Members Page
// Table + Side Drawer (5 tabs) + Add Wizard (4 steps)
// ============================================

import { membersStore, plansStore, attendanceStore, paymentsStore, formatCurrency, formatDate, getInitials, daysUntil } from '../store.js';
import { createTable } from '../components/table.js';
import { openDrawer } from '../components/drawer.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { createStepper } from '../components/stepper.js';
import { showToast } from '../components/toast.js';
import { generateQRCode } from '../components/qr-scanner.js';

let currentFilter = 'all';

export function renderMembers(container) {
  const members = membersStore.getAll();
  const plans = plansStore.getAll();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Members</h1>
        <p class="page-subtitle">Manage gym members, subscriptions, and profiles</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary btn-md" id="add-member-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Add Member
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs" id="member-tabs" style="margin-bottom:var(--space-6);">
      <div class="tab ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
        All Members <span class="tab-count">${members.length}</span>
      </div>
      <div class="tab ${currentFilter === 'active' ? 'active' : ''}" data-filter="active">
        Active <span class="tab-count">${members.filter(m => m.status === 'active').length}</span>
      </div>
      <div class="tab ${currentFilter === 'expired' ? 'active' : ''}" data-filter="expired">
        Expired <span class="tab-count">${members.filter(m => m.status === 'expired').length}</span>
      </div>
    </div>

    <!-- Table -->
    <div id="members-table"></div>
  `;

  function getFilteredMembers() {
    const all = membersStore.getAll();
    if (currentFilter === 'active') return all.filter(m => m.status === 'active');
    if (currentFilter === 'expired') return all.filter(m => m.status === 'expired');
    return all;
  }

  function renderTable() {
    const filtered = getFilteredMembers();
    createTable(document.getElementById('members-table'), {
      columns: [
        {
          key: 'name', label: 'Member', width: '25%',
          render: (val, row) => `
            <div class="member-info">
              <div class="avatar avatar-sm">${getInitials(val)}</div>
              <div class="member-info-text">
                <span class="member-name">${val}</span>
                <span class="member-id">${row.qrCode}</span>
              </div>
            </div>`,
        },
        { key: 'phone', label: 'Phone' },
        { key: 'planName', label: 'Plan' },
        {
          key: 'status', label: 'Status',
          render: (val) => `<span class="badge badge-${val === 'active' ? 'active' : 'expired'} badge-dot">${val}</span>`,
        },
        {
          key: 'subscriptionEnd', label: 'Expires',
          render: (val) => {
            const days = daysUntil(val);
            if (days < 0) return `<span style="color:var(--color-danger)">${formatDate(val)}</span>`;
            if (days <= 7) return `<span style="color:var(--color-warning)">${days}d left</span>`;
            return formatDate(val);
          },
        },
        {
          key: 'id', label: '', width: '100px', sortable: false,
          render: (val, row) => `
            <div class="row-actions">
              <button class="row-action-btn" data-view="${val}" title="View">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="row-action-btn danger" data-delete="${val}" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>`,
        },
      ],
      data: filtered,
      searchPlaceholder: 'Search members by name, phone, or plan...',
      pageSize: 10,
      selectable: true,
      onRowClick: (row) => openMemberDrawer(row.id),
    });

    // View buttons
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openMemberDrawer(btn.dataset.view);
      });
    });

    // Delete buttons
    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const member = membersStore.getById(btn.dataset.delete);
        if (member) {
          confirmDialog(
            'Delete Member',
            `Are you sure you want to delete <strong>${member.name}</strong>? This action cannot be undone.`,
            () => {
              membersStore.delete(member.id);
              showToast('success', 'Member Deleted', `${member.name} has been removed.`);
              renderMembers(container);
            }
          );
        }
      });
    });
  }

  renderTable();

  // Tab switching
  document.querySelectorAll('#member-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter = tab.dataset.filter;
      document.querySelectorAll('#member-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTable();
    });
  });

  // Add Member button
  document.getElementById('add-member-btn').addEventListener('click', () => {
    openAddMemberWizard(container);
  });
}

// ============================================
// Member Drawer (Side Panel with 5 Tabs)
// ============================================
function openMemberDrawer(memberId) {
  const member = membersStore.getById(memberId);
  if (!member) return;

  const memberAttendance = attendanceStore.query(a => a.memberId === memberId);
  const memberPayments = paymentsStore.query(p => p.memberId === memberId);

  openDrawer({
    title: member.name,
    size: 'lg',
    tabs: [
      {
        id: 'overview', label: 'Overview',
        render: (body) => {
          body.innerHTML = `
            <div class="member-profile-header">
              <div class="avatar avatar-xl">${getInitials(member.name)}</div>
              <div class="member-profile-info">
                <h3 class="member-profile-name">${member.name}</h3>
                <div class="member-profile-meta">
                  <span class="member-profile-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    ${member.email}
                  </span>
                  <span class="member-profile-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    ${member.phone}
                  </span>
                  <span class="badge badge-${member.status === 'active' ? 'active' : 'expired'} badge-dot">${member.status}</span>
                </div>
              </div>
            </div>
            <div class="detail-grid">
              <div class="detail-item"><div class="detail-label">Member ID</div><div class="detail-value">${member.qrCode}</div></div>
              <div class="detail-item"><div class="detail-label">Gender</div><div class="detail-value" style="text-transform:capitalize;">${member.gender}</div></div>
              <div class="detail-item"><div class="detail-label">Date of Birth</div><div class="detail-value">${formatDate(member.dateOfBirth)}</div></div>
              <div class="detail-item"><div class="detail-label">Goal</div><div class="detail-value">${member.goal}</div></div>
              <div class="detail-item"><div class="detail-label">Plan</div><div class="detail-value">${member.planName}</div></div>
              <div class="detail-item"><div class="detail-label">Trainer</div><div class="detail-value">${member.trainerName || 'None'}</div></div>
              <div class="detail-item"><div class="detail-label">Start Date</div><div class="detail-value">${formatDate(member.subscriptionStart)}</div></div>
              <div class="detail-item"><div class="detail-label">End Date</div><div class="detail-value">${formatDate(member.subscriptionEnd)}</div></div>
              <div class="detail-item"><div class="detail-label">Weight</div><div class="detail-value">${member.weight} kg</div></div>
              <div class="detail-item"><div class="detail-label">Height</div><div class="detail-value">${member.height} cm</div></div>
            </div>
            <div style="margin-top:var(--space-6);">
              <h4 style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-3);">QR Code</h4>
              <div id="member-qr-container" style="display:inline-block;padding:var(--space-4);background:white;border-radius:var(--radius-lg);"></div>
            </div>
          `;
          generateQRCode(document.getElementById('member-qr-container'), member.qrCode, 160);
        },
      },
      {
        id: 'attendance', label: 'Attendance',
        render: (body) => {
          const sorted = [...memberAttendance].sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
          body.innerHTML = `
            <div style="margin-bottom:var(--space-4);display:flex;align-items:center;justify-content:space-between;">
              <h4 style="font-size:var(--text-md);font-weight:600;color:var(--text-primary);">Attendance History</h4>
              <span class="badge badge-info">${sorted.length} check-ins</span>
            </div>
            ${sorted.length === 0 ? '<p style="color:var(--text-tertiary);text-align:center;padding:32px;">No attendance records</p>' :
              `<div style="display:flex;flex-direction:column;gap:var(--space-2);">
                ${sorted.slice(0, 20).map(a => `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-primary);border-radius:var(--radius-md);">
                    <div style="display:flex;align-items:center;gap:var(--space-3);">
                      <div style="width:8px;height:8px;border-radius:50%;background:var(--color-success);"></div>
                      <span style="font-size:var(--text-sm);color:var(--text-primary);">${formatDate(a.checkIn)}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:var(--space-3);">
                      <span class="badge badge-${a.method === 'qr' ? 'info' : 'default'}">${a.method === 'qr' ? 'QR Scan' : 'Manual'}</span>
                      <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${new Date(a.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                `).join('')}
              </div>`
            }
          `;
        },
      },
      {
        id: 'payments', label: 'Payments',
        render: (body) => {
          const sorted = [...memberPayments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const totalPaid = sorted.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
          body.innerHTML = `
            <div style="margin-bottom:var(--space-4);display:flex;align-items:center;justify-content:space-between;">
              <h4 style="font-size:var(--text-md);font-weight:600;color:var(--text-primary);">Payment History</h4>
              <span class="badge badge-success">Total: ${formatCurrency(totalPaid)}</span>
            </div>
            ${sorted.length === 0 ? '<p style="color:var(--text-tertiary);text-align:center;padding:32px;">No payment records</p>' :
              `<div style="display:flex;flex-direction:column;gap:var(--space-2);">
                ${sorted.map(p => `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-primary);border-radius:var(--radius-md);">
                    <div>
                      <div style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary);">${formatCurrency(p.amount)}</div>
                      <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${p.invoiceNumber} · ${p.method}</div>
                    </div>
                    <div style="text-align:right;">
                      <span class="badge badge-${p.status === 'paid' ? 'success' : 'warning'}">${p.status}</span>
                      <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:4px;">${formatDate(p.createdAt)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>`
            }
          `;
        },
      },
      {
        id: 'workout', label: 'Workout',
        render: (body) => {
          body.innerHTML = `
            <div style="text-align:center;padding:var(--space-10);color:var(--text-tertiary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto var(--space-4);opacity:0.4;display:block;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              <p style="font-size:var(--text-sm);">No workout plan assigned yet.</p>
              <button class="btn btn-primary btn-sm" style="margin-top:var(--space-4);">Assign Workout</button>
            </div>
          `;
        },
      },
      {
        id: 'nutrition', label: 'Nutrition',
        render: (body) => {
          body.innerHTML = `
            <div style="text-align:center;padding:var(--space-10);color:var(--text-tertiary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto var(--space-4);opacity:0.4;display:block;"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
              <p style="font-size:var(--text-sm);">No nutrition plan assigned yet.</p>
              <button class="btn btn-primary btn-sm" style="margin-top:var(--space-4);">Assign Diet</button>
            </div>
          `;
        },
      },
    ],
  });
}

// ============================================
// Add Member Wizard (4 Steps)
// ============================================
function openAddMemberWizard(pageContainer) {
  const plans = plansStore.getAll();
  const wizardData = {
    name: '', email: '', phone: '', gender: 'male', dateOfBirth: '',
    address: '', emergencyContact: '', weight: '', height: '', goal: 'General Fitness',
    planId: plans[0]?.id || '', paymentMethod: 'cash', notes: '',
  };

  openModal({
    title: 'Add New Member',
    size: 'lg',
    content: '<div id="add-member-wizard"></div>',
    actions: [],
  });

  const wizardContainer = document.getElementById('add-member-wizard');

  createStepper(wizardContainer, {
    steps: [
      {
        title: 'Personal',
        subtitle: 'Basic info',
        render: (content) => {
          content.innerHTML = `
            <div class="form-row" style="margin-bottom:var(--space-4);">
              <div class="form-group"><label class="form-label">Full Name <span class="required">*</span></label><input type="text" class="form-input" id="wiz-name" value="${wizardData.name}" placeholder="e.g. Mohamed Ahmed" /></div>
              <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" id="wiz-email" value="${wizardData.email}" placeholder="email@example.com" /></div>
            </div>
            <div class="form-row" style="margin-bottom:var(--space-4);">
              <div class="form-group"><label class="form-label">Phone <span class="required">*</span></label><input type="tel" class="form-input" id="wiz-phone" value="${wizardData.phone}" placeholder="+20 100 000 0000" /></div>
              <div class="form-group"><label class="form-label">Gender</label><select class="form-select" id="wiz-gender"><option value="male" ${wizardData.gender === 'male' ? 'selected' : ''}>Male</option><option value="female" ${wizardData.gender === 'female' ? 'selected' : ''}>Female</option></select></div>
            </div>
            <div class="form-row" style="margin-bottom:var(--space-4);">
              <div class="form-group"><label class="form-label">Date of Birth</label><input type="date" class="form-input" id="wiz-dob" value="${wizardData.dateOfBirth}" /></div>
              <div class="form-group"><label class="form-label">Goal</label><select class="form-select" id="wiz-goal"><option value="General Fitness">General Fitness</option><option value="Weight Loss">Weight Loss</option><option value="Muscle Gain">Muscle Gain</option><option value="Flexibility">Flexibility</option></select></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Weight (kg)</label><input type="number" class="form-input" id="wiz-weight" value="${wizardData.weight}" placeholder="75" /></div>
              <div class="form-group"><label class="form-label">Height (cm)</label><input type="number" class="form-input" id="wiz-height" value="${wizardData.height}" placeholder="175" /></div>
            </div>
          `;
        },
        validate: () => {
          wizardData.name = document.getElementById('wiz-name')?.value?.trim();
          wizardData.email = document.getElementById('wiz-email')?.value?.trim();
          wizardData.phone = document.getElementById('wiz-phone')?.value?.trim();
          wizardData.gender = document.getElementById('wiz-gender')?.value;
          wizardData.dateOfBirth = document.getElementById('wiz-dob')?.value;
          wizardData.goal = document.getElementById('wiz-goal')?.value;
          wizardData.weight = document.getElementById('wiz-weight')?.value;
          wizardData.height = document.getElementById('wiz-height')?.value;
          if (!wizardData.name) { showToast('error', 'Required', 'Please enter the member name.'); return false; }
          if (!wizardData.phone) { showToast('error', 'Required', 'Please enter a phone number.'); return false; }
          return true;
        },
      },
      {
        title: 'Membership',
        subtitle: 'Choose plan',
        render: (content) => {
          content.innerHTML = `
            <h4 style="font-size:var(--text-md);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-4);">Select a Plan</h4>
            <div class="plans-grid" style="grid-template-columns:repeat(2,1fr);">
              ${plans.map(p => `
                <div class="plan-card ${wizardData.planId === p.id ? 'selected' : ''}" data-plan-id="${p.id}" style="cursor:pointer;${wizardData.planId === p.id ? 'border-color:var(--color-primary);background:var(--color-primary-subtle);' : ''}">
                  <div class="plan-card-duration">${p.duration} days</div>
                  <div class="plan-card-name">${p.name}</div>
                  <div class="plan-card-price">
                    <span class="plan-card-price-amount">${formatCurrency(p.price)}</span>
                  </div>
                  <div class="plan-card-features">
                    ${p.features.slice(0, 3).map(f => `<div class="plan-card-feature"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${f}</div>`).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
          // Plan selection
          content.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => {
              content.querySelectorAll('.plan-card').forEach(c => {
                c.style.borderColor = '';
                c.style.background = '';
              });
              card.style.borderColor = 'var(--color-primary)';
              card.style.background = 'var(--color-primary-subtle)';
              wizardData.planId = card.dataset.planId;
            });
          });
        },
        validate: () => {
          if (!wizardData.planId) { showToast('error', 'Required', 'Please select a membership plan.'); return false; }
          return true;
        },
      },
      {
        title: 'Payment',
        subtitle: 'Payment details',
        render: (content) => {
          const selectedPlan = plans.find(p => p.id === wizardData.planId);
          content.innerHTML = `
            <div class="card" style="margin-bottom:var(--space-4);background:var(--bg-primary);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-size:var(--text-sm);color:var(--text-tertiary);">Selected Plan</div>
                  <div style="font-size:var(--text-lg);font-weight:600;color:var(--text-primary);">${selectedPlan?.name || 'None'}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:var(--text-sm);color:var(--text-tertiary);">Amount Due</div>
                  <div style="font-size:var(--text-2xl);font-weight:700;color:var(--color-primary-light);">${formatCurrency(selectedPlan?.price || 0)}</div>
                </div>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:var(--space-4);">
              <label class="form-label">Payment Method</label>
              <select class="form-select" id="wiz-payment-method">
                <option value="cash" ${wizardData.paymentMethod === 'cash' ? 'selected' : ''}>Cash</option>
                <option value="card" ${wizardData.paymentMethod === 'card' ? 'selected' : ''}>Card</option>
                <option value="bank_transfer" ${wizardData.paymentMethod === 'bank_transfer' ? 'selected' : ''}>Bank Transfer</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Notes (Optional)</label>
              <textarea class="form-textarea" id="wiz-notes" placeholder="Any additional notes..." rows="3">${wizardData.notes}</textarea>
            </div>
          `;
        },
        validate: () => {
          wizardData.paymentMethod = document.getElementById('wiz-payment-method')?.value;
          wizardData.notes = document.getElementById('wiz-notes')?.value;
          return true;
        },
      },
      {
        title: 'Done',
        subtitle: 'Confirmation',
        render: (content) => {
          const selectedPlan = plans.find(p => p.id === wizardData.planId);
          const qrCode = `QR-${1000 + membersStore.getAll().length + 1}`;
          
          content.innerHTML = `
            <div class="wizard-complete">
              <div class="wizard-complete-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              </div>
              <h3 class="wizard-complete-title">Member Added Successfully!</h3>
              <p class="wizard-complete-desc">${wizardData.name} has been registered with the ${selectedPlan?.name} plan.</p>
              <div class="wizard-complete-qr" id="wizard-qr"></div>
              <p style="font-size:var(--text-sm);color:var(--text-tertiary);margin-top:var(--space-2);">Member QR Code: ${qrCode}</p>
            </div>
          `;

          // Save member
          const now = new Date().toISOString();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + (selectedPlan?.duration || 30));

          const newMember = membersStore.create({
            name: wizardData.name,
            email: wizardData.email || `${wizardData.name.toLowerCase().replace(/ /g, '.')}@email.com`,
            phone: wizardData.phone,
            gender: wizardData.gender,
            dateOfBirth: wizardData.dateOfBirth,
            address: wizardData.address || 'Cairo, Egypt',
            emergencyContact: '',
            status: 'active',
            planId: wizardData.planId,
            planName: selectedPlan?.name || '',
            subscriptionStart: now,
            subscriptionEnd: endDate.toISOString(),
            trainerId: '',
            trainerName: '',
            qrCode,
            notes: wizardData.notes,
            weight: parseInt(wizardData.weight) || 0,
            height: parseInt(wizardData.height) || 0,
            goal: wizardData.goal,
          });

          // Create payment
          paymentsStore.create({
            memberId: newMember.id,
            memberName: newMember.name,
            amount: selectedPlan?.price || 0,
            method: wizardData.paymentMethod,
            status: 'paid',
            invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
            notes: wizardData.notes,
          });

          // Generate QR
          setTimeout(() => {
            generateQRCode(document.getElementById('wizard-qr'), qrCode, 160);
          }, 100);
        },
      },
    ],
    onComplete: () => {
      const modalRoot = document.getElementById('modal-root');
      if (modalRoot) modalRoot.innerHTML = '';
      showToast('success', 'Member Added', `${wizardData.name} has been successfully registered.`);
      renderMembers(pageContainer);
    },
    onCancel: () => {
      const modalRoot = document.getElementById('modal-root');
      if (modalRoot) modalRoot.innerHTML = '';
    },
  });
}
