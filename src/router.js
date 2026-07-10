// ============================================
// GymPro — Hash-based SPA Router
// Route guards, dynamic page loading
// ============================================

import { isAuthenticated } from './store.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
    this.currentRoute = null;
    this.onRouteChange = null;
  }

  // Register routes
  register(routes) {
    this.routes = routes;
  }

  // Initialize router
  init() {
    window.addEventListener('hashchange', () => this._handleRoute());
    // Handle initial route
    this._handleRoute();
  }

  // Navigate to a route
  navigate(path) {
    window.location.hash = path;
  }

  // Get current route path
  getPath() {
    return window.location.hash.slice(1) || '/login';
  }

  // Get route params (e.g., #/members/123 → { id: '123' })
  getParams() {
    const path = this.getPath();
    const parts = path.split('/').filter(Boolean);
    // Simple param extraction for paths like /members/:id
    if (parts.length >= 2) {
      return { section: parts[0], id: parts[1] };
    }
    return { section: parts[0] };
  }

  // Private: handle route change
  async _handleRoute() {
    const path = this.getPath();
    const basePath = '/' + path.split('/').filter(Boolean)[0]; // Get base route

    // Auth guard
    const publicRoutes = ['/login'];
    if (!publicRoutes.includes(basePath) && !isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    // If authenticated and trying to access login, redirect to dashboard
    if (basePath === '/login' && isAuthenticated()) {
      this.navigate('/dashboard');
      return;
    }

    // Find route
    const route = this.routes[basePath];
    if (!route) {
      this.navigate('/dashboard');
      return;
    }

    // Load page
    try {
      this.currentRoute = basePath;

      if (this.onRouteChange) {
        this.onRouteChange(basePath);
      }

      const container = document.getElementById('page-content');
      if (container) {
        // Clear previous content
        container.innerHTML = '';
        // Render new page
        await route.render(container);
      }
    } catch (err) {
      console.error('Router error:', err);
    }
  }
}

// Singleton
export const router = new Router();
