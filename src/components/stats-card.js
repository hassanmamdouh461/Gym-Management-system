// ============================================
// GymPro — Stats Card Component
// Animated count-up KPI cards
// ============================================

export function renderStatsCard({ icon, label, value, trend, trendValue, variant = 'primary' }) {
  const trendDirection = trend === 'up' ? 'up' : trend === 'down' ? 'down' : '';
  const trendIcon = trend === 'up' ?
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>' :
    trend === 'down' ?
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>' : '';

  return `
    <div class="stat-card ${variant}">
      <div class="stat-card-header">
        <div class="stat-card-icon">${icon}</div>
        ${trendValue ? `
          <div class="stat-card-trend ${trendDirection}">
            ${trendIcon}
            <span>${trendValue}</span>
          </div>
        ` : ''}
      </div>
      <div class="stat-card-value" data-count-target="${typeof value === 'number' ? value : ''}">${value}</div>
      <div class="stat-card-label">${label}</div>
    </div>
  `;
}

// Animate count-up for stat values
export function animateCountUp() {
  const elements = document.querySelectorAll('.stat-card-value[data-count-target]');
  
  elements.forEach(el => {
    const target = parseInt(el.dataset.countTarget);
    if (isNaN(target)) return;

    const duration = 1200;
    const start = 0;
    const startTime = performance.now();
    el.style.animation = `countUp ${duration / 3}ms ease forwards`;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      
      el.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  });
}
