// ============================================
// GymPro — Settings Page
// ============================================

import { showToast } from '../components/toast.js';

export function renderSettings(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">System configuration and preferences</p>
      </div>
    </div>

    <div class="settings-layout">
      <nav class="settings-nav">
        <div class="settings-nav-item active" data-section="general">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          General
        </div>
        <div class="settings-nav-item" data-section="notifications">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          Notifications
        </div>
        <div class="settings-nav-item" data-section="data">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
          Data Management
        </div>
      </nav>

      <div class="settings-content" id="settings-content">
        <div class="settings-section">
          <h3 class="settings-section-title">Gym Information</h3>
          <p class="settings-section-desc">Basic details about your gym</p>
          <div class="form-row" style="margin-bottom:var(--space-4);">
            <div class="form-group"><label class="form-label">Gym Name</label><input type="text" class="form-input" value="GymPro Fitness Center" /></div>
            <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" value="+20 2 1234 5678" /></div>
          </div>
          <div class="form-group" style="margin-bottom:var(--space-4);"><label class="form-label">Address</label><input type="text" class="form-input" value="Cairo, Egypt" /></div>
          <div class="form-group" style="margin-bottom:var(--space-4);"><label class="form-label">Email</label><input type="email" class="form-input" value="info@gympro.com" /></div>
        </div>

        <div class="settings-section">
          <h3 class="settings-section-title">Preferences</h3>
          <p class="settings-section-desc">Customize your system behavior</p>
          <div style="display:flex;flex-direction:column;gap:var(--space-4);">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-primary);border-radius:var(--radius-md);">
              <div><div style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary);">Currency</div><div style="font-size:var(--text-xs);color:var(--text-tertiary);">Display currency for payments</div></div>
              <select class="form-select" style="width:120px;"><option selected>EGP</option><option>USD</option><option>EUR</option></select>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-primary);border-radius:var(--radius-md);">
              <div><div style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary);">Expiry Notifications</div><div style="font-size:var(--text-xs);color:var(--text-tertiary);">Warn about expiring memberships</div></div>
              <label class="toggle"><input type="checkbox" class="toggle-input" checked /><div class="toggle-track"><div class="toggle-thumb"></div></div></label>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-primary);border-radius:var(--radius-md);">
              <div><div style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary);">Duplicate Check-in Warning</div><div style="font-size:var(--text-xs);color:var(--text-tertiary);">Warn if member already checked in today</div></div>
              <label class="toggle"><input type="checkbox" class="toggle-input" checked /><div class="toggle-track"><div class="toggle-thumb"></div></div></label>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3 class="settings-section-title" style="color:var(--color-danger);">Danger Zone</h3>
          <p class="settings-section-desc">Irreversible actions</p>
          <button class="btn btn-danger btn-md" id="reset-data-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
            Reset All Data
          </button>
        </div>

        <button class="btn btn-primary btn-md" id="save-settings-btn" style="margin-top:var(--space-4);">Save Changes</button>
      </div>
    </div>
  `;

  // Save
  document.getElementById('save-settings-btn')?.addEventListener('click', () => {
    showToast('success', 'Settings Saved', 'Your preferences have been updated.');
  });

  // Reset
  document.getElementById('reset-data-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
      Object.keys(localStorage).filter(k => k.startsWith('gympro_')).forEach(k => localStorage.removeItem(k));
      showToast('info', 'Data Reset', 'All data has been cleared. Reloading...');
      setTimeout(() => location.reload(), 1500);
    }
  });

  // Nav
  container.querySelectorAll('.settings-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      container.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}
