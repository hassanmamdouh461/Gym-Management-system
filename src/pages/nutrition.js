// ============================================
// GymPro — Nutrition Page
// ============================================

import { nutritionStore } from '../store.js';
import { openDrawer } from '../components/drawer.js';

export function renderNutrition(container) {
  const plans = nutritionStore.getAll();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Nutrition Plans</h1>
        <p class="page-subtitle">Manage meal plans and diet assignments</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary btn-md" id="add-nutrition-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Create Plan
        </button>
      </div>
    </div>
    <div class="program-grid stagger-children">
      ${plans.map(p => `
        <div class="program-card" data-id="${p.id}">
          <div class="program-card-header">
            <h3 class="program-card-title">${p.name}</h3>
            <span class="badge badge-info">${p.targetCalories} kcal</span>
          </div>
          <p class="program-card-body">${p.description}</p>
          <div class="program-card-footer">
            <div class="program-card-meta">
              <span class="program-card-meta-item">P: ${p.macros?.protein || 0}g</span>
              <span class="program-card-meta-item">C: ${p.macros?.carbs || 0}g</span>
              <span class="program-card-meta-item">F: ${p.macros?.fat || 0}g</span>
            </div>
            <span class="badge badge-default">${p.meals?.length || 0} meals</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Click → drawer
  container.querySelectorAll('.program-card').forEach(card => {
    card.addEventListener('click', () => {
      const plan = nutritionStore.getById(card.dataset.id);
      if (plan) {
        openDrawer({
          title: plan.name,
          size: 'md',
          content: `
            <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);">
              <span class="badge badge-info">${plan.targetCalories} kcal/day</span>
              <span class="badge badge-default">P: ${plan.macros?.protein}g · C: ${plan.macros?.carbs}g · F: ${plan.macros?.fat}g</span>
            </div>
            <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-6);">${plan.description}</p>
            <h4 style="font-size:var(--text-md);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-4);">Daily Meals</h4>
            <div style="display:flex;flex-direction:column;gap:var(--space-3);">
              ${(plan.meals || []).map(m => `
                <div style="padding:var(--space-4);background:var(--bg-primary);border-radius:var(--radius-md);">
                  <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
                    <span style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">${m.name}</span>
                    <span style="font-size:var(--text-xs);color:var(--color-primary-light);">${m.calories} kcal</span>
                  </div>
                  <div style="font-size:var(--text-xs);color:var(--text-secondary);">${m.items.join(' · ')}</div>
                </div>
              `).join('')}
            </div>
            ${plan.assignedTo?.length ? `<p style="margin-top:var(--space-6);font-size:var(--text-xs);color:var(--text-tertiary);">Assigned to ${plan.assignedTo.length} member(s)</p>` : ''}
          `,
        });
      }
    });
  });
}
