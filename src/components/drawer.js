// ============================================
// GymPro — Drawer Component (Side Panel)
// Right-slide panel with tabs for member profiles
// ============================================

export function openDrawer({ title, size = 'md', tabs = null, content = '', onClose = null, footer = '' }) {
  closeDrawer(); // Close any existing drawer

  const root = document.getElementById('drawer-root');
  
  root.innerHTML = `
    <div class="drawer-overlay open" id="drawer-overlay"></div>
    <div class="drawer drawer-${size} open" id="drawer-panel" role="dialog" aria-label="${title}">
      <div class="drawer-header">
        <h3 class="drawer-title">${title}</h3>
        <button class="drawer-close" id="drawer-close-btn" aria-label="Close drawer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      ${tabs ? `
        <div class="drawer-tabs">
          <div class="tabs" id="drawer-tabs">
            ${tabs.map((tab, i) => `
              <div class="tab ${i === 0 ? 'active' : ''}" data-tab="${tab.id}">${tab.label}</div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <div class="drawer-body" id="drawer-body">
        ${content}
      </div>
      ${footer ? `<div class="drawer-footer">${footer}</div>` : ''}
    </div>
  `;

  // Close handlers
  const closeBtn = document.getElementById('drawer-close-btn');
  const overlay = document.getElementById('drawer-overlay');

  const close = () => {
    closeDrawer();
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // Tab switching
  if (tabs) {
    const tabElements = document.querySelectorAll('#drawer-tabs .tab');
    tabElements.forEach(tabEl => {
      tabEl.addEventListener('click', () => {
        tabElements.forEach(t => t.classList.remove('active'));
        tabEl.classList.add('active');
        
        const tabId = tabEl.dataset.tab;
        const tab = tabs.find(t => t.id === tabId);
        if (tab && tab.render) {
          const body = document.getElementById('drawer-body');
          body.innerHTML = '';
          tab.render(body);
        }
      });
    });

    // Render first tab
    if (tabs[0]?.render) {
      const body = document.getElementById('drawer-body');
      body.innerHTML = '';
      tabs[0].render(body);
    }
  }

  // Focus trap
  const panel = document.getElementById('drawer-panel');
  panel.focus();
}

export function closeDrawer() {
  const root = document.getElementById('drawer-root');
  if (root) {
    const overlay = root.querySelector('.drawer-overlay');
    const panel = root.querySelector('.drawer');
    
    if (panel) {
      panel.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      
      setTimeout(() => {
        root.innerHTML = '';
      }, 350);
    }
  }
}

export function updateDrawerBody(content) {
  const body = document.getElementById('drawer-body');
  if (body) body.innerHTML = content;
}
