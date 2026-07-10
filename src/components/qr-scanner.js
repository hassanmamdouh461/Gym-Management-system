// ============================================
// GymPro — QR Code Component
// Generate QR codes for member check-in
// ============================================

// Simple QR code generation using canvas (no external library needed)
// This generates a basic QR-like visual. For production, use a proper QR library.

export function generateQRCode(container, data, size = 200) {
  // Create a visual QR-like code using canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Generate a deterministic pattern from the data string
  const hash = hashString(data);
  const moduleCount = 21; // Standard QR module count
  const moduleSize = size / moduleCount;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Generate modules
  ctx.fillStyle = '#000000';

  // Fixed patterns (finder patterns)
  drawFinderPattern(ctx, 0, 0, moduleSize);
  drawFinderPattern(ctx, (moduleCount - 7) * moduleSize, 0, moduleSize);
  drawFinderPattern(ctx, 0, (moduleCount - 7) * moduleSize, moduleSize);

  // Data modules (pseudo-random based on hash)
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Skip finder pattern areas
      if (isInFinderArea(row, col, moduleCount)) continue;

      // Use hash to determine if module is filled
      const idx = row * moduleCount + col;
      const bit = (hash[idx % hash.length] ^ (idx * 7 + row * 3)) % 3;

      if (bit === 0) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      }
    }
  }

  container.innerHTML = '';
  container.appendChild(canvas);

  return canvas;
}

function drawFinderPattern(ctx, x, y, moduleSize) {
  // Outer border
  ctx.fillStyle = '#000000';
  ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);

  // Inner white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);

  // Center black
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
}

function isInFinderArea(row, col, moduleCount) {
  // Top-left
  if (row < 8 && col < 8) return true;
  // Top-right
  if (row < 8 && col >= moduleCount - 8) return true;
  // Bottom-left
  if (row >= moduleCount - 8 && col < 8) return true;
  return false;
}

function hashString(str) {
  const result = [];
  for (let i = 0; i < 256; i++) {
    let h = 0;
    for (let j = 0; j < str.length; j++) {
      h = ((h << 5) - h + str.charCodeAt(j) + i) | 0;
    }
    result.push(Math.abs(h) % 256);
  }
  return result;
}

// Manual check-in helper
export function createManualCheckIn(container, { onCheckIn }) {
  container.innerHTML = `
    <div class="attendance-scanner">
      <div class="attendance-scanner-inner">
        <div class="attendance-scanner-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
            <path d="M7 12h10"/>
          </svg>
        </div>
        <h3 class="attendance-scanner-title">QR Check-in</h3>
        <p class="attendance-scanner-desc">Scan a member's QR code or enter their ID manually</p>
        <div class="attendance-manual">
          <input type="text" class="form-input" placeholder="Enter Member ID (e.g., QR-1001)" id="manual-checkin-input" />
          <button class="btn btn-primary btn-md" id="manual-checkin-btn">Check In</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('manual-checkin-btn')?.addEventListener('click', () => {
    const input = document.getElementById('manual-checkin-input');
    const value = input.value.trim();
    if (value && onCheckIn) {
      onCheckIn(value);
      input.value = '';
    }
  });

  document.getElementById('manual-checkin-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('manual-checkin-btn').click();
    }
  });
}
