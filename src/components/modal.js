// ============================================
// GymPro — Modal Component
// Confirmation & alert modals only (per UX rules)
// ============================================

export function openModal({ title, content, size = 'sm', actions = [], onClose = null }) {
  closeModal();

  const root = document.getElementById('modal-root');
  
  root.innerHTML = `
    <div class="modal-overlay open" id="modal-overlay">
      <div class="modal modal-${size}" role="dialog" aria-label="${title}" id="modal-panel">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modal-close-btn" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">${content}</div>
        ${actions.length > 0 ? `
          <div class="modal-footer">
            ${actions.map((action, i) => `
              <button class="btn btn-${action.variant || 'secondary'} btn-md" data-action-index="${i}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Close handlers
  document.getElementById('modal-close-btn').addEventListener('click', () => {
    closeModal();
    if (onClose) onClose();
  });

  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
      closeModal();
      if (onClose) onClose();
    }
  });

  // Action buttons
  root.querySelectorAll('[data-action-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.actionIndex);
      if (actions[index]?.onClick) {
        actions[index].onClick();
      }
      if (actions[index]?.closeOnClick !== false) {
        closeModal();
      }
    });
  });
}

export function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) {
    const overlay = root.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => { root.innerHTML = ''; }, 200);
    }
  }
}

// Convenience: Confirm dialog
export function confirmDialog(title, message, onConfirm, confirmLabel = 'Confirm', variant = 'danger') {
  openModal({
    title,
    content: `<p style="color:var(--text-secondary);font-size:var(--text-base);">${message}</p>`,
    size: 'sm',
    actions: [
      { label: 'Cancel', variant: 'secondary', onClick: () => {} },
      { label: confirmLabel, variant, onClick: onConfirm },
    ],
  });
}
