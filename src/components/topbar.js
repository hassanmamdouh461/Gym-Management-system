// ============================================
// GymPro — Topbar Component
// Search, notifications, user menu
// ============================================

import { notificationsStore, getSession, logout, formatDateTime } from '../store.js';
import { router } from '../router.js';

export function renderTopbar(container, session) {
  if (!session) session = getSession();
  const initials = session ? session.name.split(' ').map(w => w[0]).join('').toUpperCase() : 'U';
  const notifications = notificationsStore.getAll();
  const unreadCount = notifications.filter(n => !n.read).length;

  container.innerHTML = `
    <button class="topbar-action-btn" id="topbar-menu-toggle" aria-label="Toggle menu" style="display:none;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
    </button>

    <div class="topbar-search">
      <svg class="topbar-search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" class="topbar-search-input" placeholder="Search members, trainers, payments..." aria-label="Global search" id="global-search" />
      <span class="topbar-search-shortcut">Ctrl+K</span>
    </div>

    <div class="topbar-actions">
      <div class="dropdown" id="notification-dropdown">
        <button class="topbar-action-btn" id="notification-btn" aria-label="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          ${unreadCount > 0 ? '<span class="topbar-badge"></span>' : ''}
        </button>
        <div class="notification-panel" id="notification-panel">
          <div class="notification-header">
            <span class="notification-header-title">Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}</span>
            <button class="btn btn-ghost btn-sm" id="mark-all-read">Mark all read</button>
          </div>
          <div class="notification-list">
            ${notifications.length === 0 ? '<div style="padding:24px;text-align:center;color:var(--text-tertiary);font-size:13px;">No notifications</div>' :
              notifications.slice(0, 8).map(n => `
                <div class="notification-item ${n.read ? '' : 'unread'}" data-link="${n.link || ''}">
                  <div class="notification-item-icon" style="background:var(--color-${n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'info'}-subtle);">
                    ${n.type === 'warning' ?
                      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>' :
                    n.type === 'success' ?
                      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>' :
                      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
                    }
                  </div>
                  <div class="notification-item-content">
                    <div class="notification-item-text">${n.message}</div>
                    <div class="notification-item-time">${formatDateTime(n.createdAt)}</div>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>

      <div class="dropdown" id="user-dropdown">
        <div class="topbar-user" id="user-menu-btn">
          <div class="topbar-user-avatar">${initials}</div>
          <div class="topbar-user-info">
            <span class="topbar-user-name">${session?.name || 'User'}</span>
            <span class="topbar-user-role">${session?.role === 'admin' ? 'Administrator' : 'Reception'}</span>
          </div>
        </div>
        <div class="dropdown-menu" id="user-menu">
          <div class="dropdown-item" data-action="settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            Settings
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item danger" data-action="logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Logout
          </div>
        </div>
      </div>
    </div>
  `;

  // Mobile menu toggle
  const menuToggle = document.getElementById('topbar-menu-toggle');
  if (window.innerWidth <= 1024) {
    menuToggle.style.display = 'flex';
  }
  menuToggle.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('mobile-open');
    document.getElementById('sidebar-overlay').classList.toggle('visible');
  });

  // Notification dropdown toggle
  document.getElementById('notification-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('open');
    // Close user menu if open
    document.getElementById('user-menu').classList.remove('open');
  });

  // Mark all read
  document.getElementById('mark-all-read')?.addEventListener('click', () => {
    const all = notificationsStore.getAll();
    all.forEach(n => n.read = true);
    notificationsStore.setAll(all);
    document.querySelectorAll('.notification-item.unread').forEach(el => el.classList.remove('unread'));
    const badge = container.querySelector('.topbar-badge');
    if (badge) badge.remove();
    const title = container.querySelector('.notification-header-title');
    if (title) title.textContent = 'Notifications';
  });

  // Notification click
  document.querySelectorAll('.notification-item[data-link]').forEach(item => {
    item.addEventListener('click', () => {
      const link = item.dataset.link;
      if (link) {
        window.location.hash = link.replace('#', '');
        document.getElementById('notification-panel').classList.remove('open');
      }
    });
  });

  // User menu toggle
  document.getElementById('user-menu-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('user-menu');
    menu.classList.toggle('open');
    // Close notification panel if open
    document.getElementById('notification-panel').classList.remove('open');
  });

  // User menu actions
  document.querySelectorAll('#user-menu .dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action === 'settings') router.navigate('/settings');
      if (action === 'logout') {
        logout();
        router.navigate('/login');
      }
      document.getElementById('user-menu').classList.remove('open');
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.getElementById('notification-panel')?.classList.remove('open');
    document.getElementById('user-menu')?.classList.remove('open');
  });
}
