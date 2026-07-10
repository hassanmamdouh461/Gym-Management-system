// ============================================
// GymPro — Chart.js Wrapper
// Line, Bar, Doughnut with dark theme
// ============================================

// We'll dynamically import Chart.js
let Chart = null;

async function loadChart() {
  if (!Chart) {
    const module = await import('chart.js');
    Chart = module.Chart;
    // Register all components
    const { CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler } = module;
    Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);
    
    // Set global defaults for dark theme
    Chart.defaults.color = '#94A3B8';
    Chart.defaults.borderColor = '#334155';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = '#1E293B';
    Chart.defaults.plugins.tooltip.borderColor = '#334155';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.titleFont = { weight: '600' };
  }
  return Chart;
}

export async function createChart(canvas, config) {
  const ChartJS = await loadChart();
  
  // Set canvas size
  const container = canvas.parentElement;
  if (container) {
    canvas.style.width = '100%';
    canvas.style.height = config.height || '300px';
  }

  return new ChartJS(canvas, {
    ...config,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: config.type !== 'doughnut' ? {
        x: {
          grid: {
            color: 'rgba(51, 65, 85, 0.5)',
            drawBorder: false,
          },
          ticks: {
            maxRotation: 0,
          },
          ...config.options?.scales?.x,
        },
        y: {
          grid: {
            color: 'rgba(51, 65, 85, 0.5)',
            drawBorder: false,
          },
          beginAtZero: true,
          ...config.options?.scales?.y,
        },
      } : undefined,
      plugins: {
        legend: {
          display: config.options?.plugins?.legend?.display ?? (config.type === 'doughnut'),
          position: 'bottom',
          ...config.options?.plugins?.legend,
        },
        ...config.options?.plugins,
      },
      ...config.options,
    },
  });
}

// Convenience: Create a line chart
export async function createLineChart(canvas, { labels, datasets, height = '300px' }) {
  return createChart(canvas, {
    type: 'line',
    height,
    data: {
      labels,
      datasets: datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.color || '#2563EB',
        backgroundColor: ds.bgColor || 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        fill: ds.fill !== false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: ds.color || '#2563EB',
        ...ds,
      })),
    },
  });
}

// Convenience: Create a bar chart
export async function createBarChart(canvas, { labels, datasets, height = '300px' }) {
  return createChart(canvas, {
    type: 'bar',
    height,
    data: {
      labels,
      datasets: datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.color || '#2563EB',
        borderColor: 'transparent',
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 40,
        ...ds,
      })),
    },
  });
}

// Convenience: Create a doughnut chart
export async function createDoughnutChart(canvas, { labels, data, colors, height = '260px' }) {
  return createChart(canvas, {
    type: 'doughnut',
    height,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors || ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4'],
        borderColor: '#1E293B',
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: true },
      },
    },
  });
}
