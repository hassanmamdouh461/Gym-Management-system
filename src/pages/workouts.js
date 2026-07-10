// ============================================
// GymPro — Workouts Page
// ============================================

import { workoutsStore } from '../store.js';
import { openDrawer, closeDrawer } from '../components/drawer.js';
import { showToast } from '../components/toast.js';

export function renderWorkouts(container) {
  const workouts = workoutsStore.getAll();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Workout Plans</h1>
        <p class="page-subtitle">Create and manage workout templates</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary btn-md" id="add-workout-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Create Plan
        </button>
      </div>
    </div>
    <div class="program-grid stagger-children">
      ${workouts.map(w => `
        <div class="program-card" data-id="${w.id}">
          <div class="program-card-header">
            <h3 class="program-card-title">${w.name}</h3>
            <span class="badge badge-${w.level === 'beginner' ? 'success' : w.level === 'intermediate' ? 'warning' : 'danger'}">${w.level}</span>
          </div>
          <p class="program-card-body">${w.description}</p>
          <div class="program-card-footer">
            <div class="program-card-meta">
              <span class="program-card-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                ${w.duration}
              </span>
              <span class="program-card-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                ${w.daysPerWeek}x/week
              </span>
            </div>
            <span class="badge badge-info">${w.exercises?.length || 0} exercises</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Click workout → drawer
  container.querySelectorAll('.program-card').forEach(card => {
    card.addEventListener('click', () => {
      const workout = workoutsStore.getById(card.dataset.id);
      if (workout) {
        openDrawer({
          title: workout.name,
          size: 'md',
          content: `
            <div style="margin-bottom:var(--space-4);">
              <span class="badge badge-${workout.level === 'beginner' ? 'success' : workout.level === 'intermediate' ? 'warning' : 'danger'}">${workout.level}</span>
              <span class="badge badge-default" style="margin-left:8px;">${workout.duration} · ${workout.daysPerWeek}x/week</span>
            </div>
            <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-6);">${workout.description}</p>
            <h4 style="font-size:var(--text-md);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-4);">Exercises</h4>
            <div style="display:flex;flex-direction:column;gap:var(--space-2);">
              ${(workout.exercises || []).map((e, i) => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-primary);border-radius:var(--radius-md);">
                  <div style="display:flex;align-items:center;gap:var(--space-3);">
                    <span style="width:28px;height:28px;border-radius:var(--radius-full);background:var(--color-primary-subtle);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:600;color:var(--color-primary-light);">${i + 1}</span>
                    <span style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary);">${e.name}</span>
                  </div>
                  <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${e.sets} × ${e.reps} · Rest ${e.rest}</span>
                </div>
              `).join('')}
            </div>
            ${workout.assignedTo?.length ? `<p style="margin-top:var(--space-6);font-size:var(--text-xs);color:var(--text-tertiary);">Assigned to ${workout.assignedTo.length} member(s)</p>` : ''}
          `,
        });
      }
    });
  });
}
