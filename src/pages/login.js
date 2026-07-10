// ============================================
// GymPro — Login Page
// Split-screen: branding + login form
// ============================================

import { login } from '../store.js';
import { router } from '../router.js';
import { showToast } from '../components/toast.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-page">
      <div class="login-brand">
        <div class="login-brand-content">
          <div class="login-brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 6.5h11M6.5 17.5h11M4 10v4M8 8v8M16 8v8M20 10v4"/>
            </svg>
          </div>
          <h1 class="login-brand-title">GymPro</h1>
          <p class="login-brand-desc">Professional Gym Management System. Streamline your operations, track members, manage payments, and grow your business.</p>
          <div class="login-features">
            <div class="login-feature">
              <div class="login-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span>Member Management & QR Check-in</span>
            </div>
            <div class="login-feature">
              <div class="login-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
              <span>Payment Tracking & Invoicing</span>
            </div>
            <div class="login-feature">
              <div class="login-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/></svg>
              </div>
              <span>Analytics & Revenue Reports</span>
            </div>
            <div class="login-feature">
              <div class="login-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </div>
              <span>Workout & Nutrition Plans</span>
            </div>
          </div>
        </div>
      </div>

      <div class="login-form-wrapper">
        <form class="login-form" id="login-form">
          <div class="login-form-header">
            <h2 class="login-form-title">Welcome back</h2>
            <p class="login-form-subtitle">Sign in to your account to continue</p>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-email">Email address</label>
            <div class="form-input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input type="email" class="form-input" id="login-email" placeholder="admin@gympro.com" value="admin@gympro.com" autocomplete="email" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <div class="form-input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" class="form-input" id="login-password" placeholder="Enter your password" value="admin123" autocomplete="current-password" required />
            </div>
          </div>

          <div class="login-form-options">
            <label class="checkbox">
              <input type="checkbox" class="checkbox-input" checked />
              <span class="checkbox-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span class="checkbox-label">Remember me</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" id="login-btn" style="width:100%;">
            Sign In
          </button>

          <div class="login-demo-hint">
            <div class="login-demo-hint-title">Demo Credentials</div>
            <div class="login-demo-hint-text">
              Admin: admin@gympro.com / admin123<br/>
              Reception: reception@gympro.com / reception123
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  // Handle login
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const btn = document.getElementById('login-btn');
    btn.classList.add('btn-loading');

    // Simulate brief loading
    setTimeout(() => {
      const session = login(email, password);
      
      if (session) {
        showToast('success', 'Welcome back!', `Logged in as ${session.name}`);
        router.navigate('/dashboard');
      } else {
        btn.classList.remove('btn-loading');
        showToast('error', 'Login Failed', 'Invalid email or password. Please try again.');
        
        // Shake animation on error
        const form = document.getElementById('login-form');
        form.style.animation = 'none';
        form.offsetHeight; // Trigger reflow
        form.style.animation = 'shake 0.5s ease';
      }
    }, 800);
  });
}
