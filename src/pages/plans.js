// ============================================
// GymPro — Membership Plans Page
// ============================================

import { plansStore, formatCurrency } from '../store.js';
import { openDrawer, closeDrawer } from '../components/drawer.js';
import { showToast } from '../components/toast.js';

export function renderPlans(container) {
  const plans = plansStore.getAll();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Membership Plans</h1>
        <p class="page-subtitle">Manage pricing and plan features</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary btn-md" id="add-plan-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Create Plan
        </button>
      </div>
    </div>
    <div class="plans-grid stagger-children">
      ${plans.map(p => `
        <div class="plan-card ${p.popular ? 'popular' : ''}" data-id="${p.id}">
          <div class="plan-card-duration">${p.duration} days</div>
          <h3 class="plan-card-name">${p.name}</h3>
          <div class="plan-card-price">
            <span class="plan-card-price-amount">${formatCurrency(p.price)}</span>
            <span class="plan-card-price-period">/ ${p.duration} days</span>
          </div>
          <div class="plan-card-features">
            ${p.features.map(f => `<div class="plan-card-feature"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${f}</div>`).join('')}
          </div>
          <button class="btn btn-secondary btn-md" style="width:100%;">Edit Plan</button>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('add-plan-btn')?.addEventListener('click', () => {
    openDrawer({
      title: 'Create New Plan',
      size: 'md',
      content: `
        <div class="form-group" style="margin-bottom:var(--space-4);"><label class="form-label">Plan Name</label><input type="text" class="form-input" id="p-name" placeholder="e.g. Premium" /></div>
        <div class="form-row" style="margin-bottom:var(--space-4);">
          <div class="form-group"><label class="form-label">Duration (days)</label><input type="number" class="form-input" id="p-duration" placeholder="30" /></div>
          <div class="form-group"><label class="form-label">Price (EGP)</label><input type="number" class="form-input" id="p-price" placeholder="500" /></div>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);"><label class="form-label">Features (one per line)</label><textarea class="form-textarea" id="p-features" placeholder="Full gym access&#10;Locker room&#10;Free WiFi" rows="5"></textarea></div>
      `,
      footer: '<button class="btn btn-secondary btn-md" onclick="document.getElementById(\'drawer-root\').innerHTML=\'\'">Cancel</button><button class="btn btn-primary btn-md" id="p-save">Create Plan</button>',
    });
    document.getElementById('p-save')?.addEventListener('click', () => {
      const name = document.getElementById('p-name')?.value?.trim();
      if (!name) { showToast('error', 'Required', 'Please enter a plan name.'); return; }
      plansStore.create({
        name,
        duration: parseInt(document.getElementById('p-duration')?.value) || 30,
        price: parseInt(document.getElementById('p-price')?.value) || 0,
        features: (document.getElementById('p-features')?.value || '').split('\n').filter(Boolean),
        status: 'active',
        popular: false,
      });
      showToast('success', 'Plan Created', `${name} plan has been created.`);
      closeDrawer();
      renderPlans(container);
    });
  });
}
