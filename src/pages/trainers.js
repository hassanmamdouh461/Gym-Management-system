// ============================================
// GymPro — Trainers Page
// Card grid + list view, add/edit via drawer
// ============================================

import { trainersStore, getInitials, formatCurrency } from '../store.js';
import { openDrawer, closeDrawer } from '../components/drawer.js';
import { showToast } from '../components/toast.js';
import { confirmDialog } from '../components/modal.js';

export function renderTrainers(container) {
  const trainers = trainersStore.getAll();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Trainers</h1>
        <p class="page-subtitle">Manage trainers, schedules, and performance</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary btn-md" id="add-trainer-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Add Trainer
        </button>
      </div>
    </div>
    <div class="trainer-grid stagger-children" id="trainer-grid">
      ${trainers.map(t => `
        <div class="trainer-card" data-id="${t.id}">
          <div class="trainer-card-avatar"><div class="avatar avatar-xl">${getInitials(t.name)}</div></div>
          <h3 class="trainer-card-name">${t.name}</h3>
          <p class="trainer-card-speciality">${t.specialization}</p>
          <span class="badge badge-${t.status === 'active' ? 'active' : 'default'} badge-dot" style="margin-bottom:var(--space-4);">${t.status}</span>
          <div class="trainer-card-stats">
            <div class="trainer-card-stat"><div class="trainer-card-stat-value">${t.membersAssigned}</div><div class="trainer-card-stat-label">Members</div></div>
            <div class="trainer-card-stat"><div class="trainer-card-stat-value">${t.experience}y</div><div class="trainer-card-stat-label">Experience</div></div>
            <div class="trainer-card-stat"><div class="trainer-card-stat-value">⭐ ${t.rating}</div><div class="trainer-card-stat-label">Rating</div></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Trainer card click → drawer
  container.querySelectorAll('.trainer-card').forEach(card => {
    card.addEventListener('click', () => {
      const trainer = trainersStore.getById(card.dataset.id);
      if (trainer) {
        openDrawer({
          title: trainer.name,
          size: 'md',
          tabs: [
            { id: 'info', label: 'Info', render: (body) => {
              body.innerHTML = `
                <div style="text-align:center;margin-bottom:var(--space-6);">
                  <div class="avatar avatar-2xl" style="margin:0 auto var(--space-3);">${getInitials(trainer.name)}</div>
                  <h3 style="font-size:var(--text-xl);font-weight:600;color:var(--text-primary);">${trainer.name}</h3>
                  <p style="font-size:var(--text-sm);color:var(--text-tertiary);">${trainer.specialization}</p>
                </div>
                <div class="detail-grid">
                  <div class="detail-item"><div class="detail-label">Email</div><div class="detail-value">${trainer.email}</div></div>
                  <div class="detail-item"><div class="detail-label">Phone</div><div class="detail-value">${trainer.phone}</div></div>
                  <div class="detail-item"><div class="detail-label">Experience</div><div class="detail-value">${trainer.experience} years</div></div>
                  <div class="detail-item"><div class="detail-label">Salary</div><div class="detail-value">${formatCurrency(trainer.salary)}</div></div>
                  <div class="detail-item"><div class="detail-label">Members</div><div class="detail-value">${trainer.membersAssigned}</div></div>
                  <div class="detail-item"><div class="detail-label">Rating</div><div class="detail-value">⭐ ${trainer.rating}/5</div></div>
                  <div class="detail-item" style="grid-column:span 2;"><div class="detail-label">Bio</div><div class="detail-value">${trainer.bio}</div></div>
                </div>
              `;
            }},
            { id: 'schedule', label: 'Schedule', render: (body) => {
              const days = ['sun','mon','tue','wed','thu','fri','sat'];
              const dayLabels = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
              body.innerHTML = `
                <h4 style="font-size:var(--text-md);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-4);">Weekly Schedule</h4>
                <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                  ${days.map((d,i) => `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-primary);border-radius:var(--radius-md);">
                      <span style="font-size:var(--text-sm);color:var(--text-primary);font-weight:500;">${dayLabels[i]}</span>
                      <span class="badge ${trainer.schedule[d] ? 'badge-success' : 'badge-default'}">${trainer.schedule[d] || 'Day Off'}</span>
                    </div>
                  `).join('')}
                </div>
              `;
            }},
          ],
        });
      }
    });
  });

  // Add Trainer
  document.getElementById('add-trainer-btn').addEventListener('click', () => {
    openDrawer({
      title: 'Add New Trainer',
      size: 'md',
      content: `
        <div class="form-group" style="margin-bottom:var(--space-4);"><label class="form-label">Full Name <span class="required">*</span></label><input type="text" class="form-input" id="t-name" placeholder="Trainer name" /></div>
        <div class="form-row" style="margin-bottom:var(--space-4);">
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" id="t-email" placeholder="email@gympro.com" /></div>
          <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" id="t-phone" placeholder="+20 100 000 0000" /></div>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);"><label class="form-label">Specialization</label><input type="text" class="form-input" id="t-spec" placeholder="e.g. Strength & Conditioning" /></div>
        <div class="form-row" style="margin-bottom:var(--space-4);">
          <div class="form-group"><label class="form-label">Experience (years)</label><input type="number" class="form-input" id="t-exp" placeholder="5" /></div>
          <div class="form-group"><label class="form-label">Salary (EGP)</label><input type="number" class="form-input" id="t-salary" placeholder="7000" /></div>
        </div>
        <div class="form-group"><label class="form-label">Bio</label><textarea class="form-textarea" id="t-bio" placeholder="Short bio..."></textarea></div>
      `,
      footer: '<button class="btn btn-secondary btn-md" id="t-cancel">Cancel</button><button class="btn btn-primary btn-md" id="t-save">Save Trainer</button>',
    });
    document.getElementById('t-save')?.addEventListener('click', () => {
      const name = document.getElementById('t-name')?.value?.trim();
      if (!name) { showToast('error', 'Required', 'Please enter trainer name.'); return; }
      trainersStore.create({
        name,
        email: document.getElementById('t-email')?.value?.trim() || '',
        phone: document.getElementById('t-phone')?.value?.trim() || '',
        specialization: document.getElementById('t-spec')?.value?.trim() || 'General',
        experience: parseInt(document.getElementById('t-exp')?.value) || 0,
        salary: parseInt(document.getElementById('t-salary')?.value) || 0,
        status: 'active',
        schedule: {},
        bio: document.getElementById('t-bio')?.value?.trim() || '',
        membersAssigned: 0,
        rating: 5.0,
      });
      showToast('success', 'Trainer Added', `${name} has been added to the team.`);
      closeDrawer();
      renderTrainers(container);
    });
    document.getElementById('t-cancel')?.addEventListener('click', () => {
      closeDrawer();
    });
  });
}
