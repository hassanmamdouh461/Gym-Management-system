// ============================================
// GymPro — App Entry Point
// Bootstrap, router init, layout rendering
// ============================================


import { router } from './router.js';
import { isSeeded, isAuthenticated, getSession } from './store.js';
import { seedData } from './seed.js';
import { renderSidebar, updateSidebarActive } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js';
import { initToast } from './components/toast.js';

// Import pages
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderMembers } from './pages/members.js';
import { renderTrainers } from './pages/trainers.js';
import { renderPlans } from './pages/plans.js';
import { renderPayments } from './pages/payments.js';
import { renderAttendance } from './pages/attendance.js';
import { renderWorkouts } from './pages/workouts.js';
import { renderNutrition } from './pages/nutrition.js';
import { renderReports } from './pages/reports.js';
import { renderSettings } from './pages/settings.js';

// ============================================
// Initialize App
// ============================================
function init() {
  // Seed demo data on first visit
  if (!isSeeded()) {
    seedData();
  }

  // Initialize toast system
  initToast();

  // Register routes
  router.register({
    '/login': { render: renderLogin },
    '/dashboard': { render: renderDashboard },
    '/members': { render: renderMembers },
    '/trainers': { render: renderTrainers },
    '/plans': { render: renderPlans },
    '/payments': { render: renderPayments },
    '/attendance': { render: renderAttendance },
    '/workouts': { render: renderWorkouts },
    '/nutrition': { render: renderNutrition },
    '/reports': { render: renderReports },
    '/settings': { render: renderSettings },
  });

  // On route change, update layout
  router.onRouteChange = (path) => {
    const isLoginPage = path === '/login';
    renderAppShell(isLoginPage);
    updateSidebarActive(path);
  };

  // Start router
  router.init();

  // Set default route if no hash
  if (!window.location.hash) {
    router.navigate(isAuthenticated() ? '/dashboard' : '/login');
  }
}

// ============================================
// Render App Shell (Sidebar + Topbar + Content Area)
// ============================================
function renderAppShell(isLoginPage) {
  const app = document.getElementById('app');

  if (isLoginPage) {
    // Login page: no sidebar/topbar
    app.innerHTML = '<div id="page-content"></div>';
    app.className = '';
  } else if (!document.querySelector('.app-shell')) {
    // Build shell only once
    const session = getSession();
    app.className = '';
    app.innerHTML = `
      <div class="app-shell" id="app-shell">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <nav class="sidebar" id="sidebar" aria-label="Main Navigation"></nav>
        <div class="main-wrapper">
          <header class="topbar" id="topbar"></header>
          <main class="main-content" id="page-content" role="main"></main>
        </div>
      </div>
    `;

    // Render sidebar and topbar
    renderSidebar(document.getElementById('sidebar'));
    renderTopbar(document.getElementById('topbar'), session);

    // Sidebar overlay (mobile)
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('mobile-open');
      document.getElementById('sidebar-overlay').classList.remove('visible');
    });
  }
}

// ============================================
// Global keyboard shortcuts
// ============================================
document.addEventListener('keydown', (e) => {
  // Ctrl+K: Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('.topbar-search-input');
    if (searchInput) searchInput.focus();
  }

  // Escape: Close drawers/modals
  if (e.key === 'Escape') {
    // Close any open drawer
    const drawer = document.querySelector('.drawer.open');
    if (drawer) {
      drawer.classList.remove('open');
      document.querySelector('.drawer-overlay')?.classList.remove('open');
    }

    // Close any open modal
    const modal = document.querySelector('.modal-overlay.open');
    if (modal) {
      modal.classList.remove('open');
    }
  }
});

// ============================================
// Boot
// ============================================
document.addEventListener('DOMContentLoaded', init);
