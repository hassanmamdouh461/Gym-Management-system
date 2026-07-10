// ============================================
// GymPro — Stepper Component (Multi-Step Wizard)
// Horizontal progress steps for onboarding flows
// ============================================

export function createStepper(container, { steps, onComplete, onCancel }) {
  let currentStep = 0;

  function render() {
    container.innerHTML = `
      <div class="stepper">
        ${steps.map((step, i) => `
          <div class="stepper-step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}">
            <div class="stepper-step-number">
              ${i < currentStep ?
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' :
                (i + 1)}
            </div>
            <div class="stepper-step-info">
              <div class="stepper-step-title">${step.title}</div>
              ${step.subtitle ? `<div class="stepper-step-subtitle">${step.subtitle}</div>` : ''}
            </div>
          </div>
          ${i < steps.length - 1 ? `<div class="stepper-connector ${i < currentStep ? 'completed' : ''}"></div>` : ''}
        `).join('')}
      </div>
      <div class="stepper-content" id="stepper-content"></div>
      <div class="stepper-actions">
        <div>
          ${currentStep > 0 && currentStep < steps.length ?
            `<button class="btn btn-secondary btn-md" id="stepper-back">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
              Back
            </button>` : 
            `<button class="btn btn-ghost btn-md" id="stepper-cancel">Cancel</button>`
          }
        </div>
        <div>
          ${currentStep < steps.length - 1 ?
            `<button class="btn btn-primary btn-md" id="stepper-next">
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>` :
            currentStep === steps.length - 1 ?
            `<button class="btn btn-success btn-md" id="stepper-finish">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Complete
            </button>` : ''
          }
        </div>
      </div>
    `;

    // Render step content
    const contentArea = document.getElementById('stepper-content');
    if (steps[currentStep]?.render) {
      steps[currentStep].render(contentArea);
    }

    // Event listeners
    document.getElementById('stepper-next')?.addEventListener('click', () => {
      const step = steps[currentStep];
      if (step.validate) {
        const result = step.validate();
        if (!result) return;
      }
      if (step.onNext) step.onNext();
      currentStep++;
      render();
    });

    document.getElementById('stepper-back')?.addEventListener('click', () => {
      currentStep--;
      render();
    });

    document.getElementById('stepper-finish')?.addEventListener('click', () => {
      const step = steps[currentStep];
      if (step.validate) {
        const result = step.validate();
        if (!result) return;
      }
      if (onComplete) onComplete();
    });

    document.getElementById('stepper-cancel')?.addEventListener('click', () => {
      if (onCancel) onCancel();
    });
  }

  render();

  return {
    goTo(stepIndex) {
      currentStep = stepIndex;
      render();
    },
    getCurrentStep() {
      return currentStep;
    },
  };
}
