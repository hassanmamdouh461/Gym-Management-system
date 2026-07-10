// ============================================
// GymPro — Data Table Component
// Sortable, filterable, paginated, with bulk actions
// ============================================

export function createTable(container, {
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  onRowClick = null,
  actions = null,
  emptyTitle = 'No data found',
  emptyDesc = 'Try adjusting your search or filters.',
  selectable = false,
  bulkActions = null,
}) {
  let currentPage = 1;
  let sortKey = null;
  let sortDir = 'asc';
  let searchTerm = '';
  let filteredData = [...data];
  let selectedIds = new Set();

  function applyFilters() {
    filteredData = data.filter(row => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return columns.some(col => {
        const val = row[col.key];
        return val && String(val).toLowerCase().includes(term);
      });
    });

    if (sortKey) {
      filteredData.sort((a, b) => {
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const strA = String(aVal).toLowerCase();
        const strB = String(bVal).toLowerCase();
        return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    currentPage = 1;
    selectedIds.clear();
  }

  function getPageData() {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }

  function getTotalPages() {
    return Math.max(1, Math.ceil(filteredData.length / pageSize));
  }

  function render() {
    const pageData = getPageData();
    const totalPages = getTotalPages();
    const totalItems = filteredData.length;
    const startIndex = (currentPage - 1) * pageSize;

    let html = '<div class="data-table-wrapper">';

    // Toolbar
    if (searchable || actions) {
      html += `<div class="data-table-toolbar">`;
      if (searchable) {
        html += `
          <div class="data-table-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="${searchPlaceholder}" value="${searchTerm}" id="table-search-input" />
          </div>
        `;
      }
      if (actions) {
        html += `<div class="data-table-filters">${actions}</div>`;
      }
      html += `</div>`;
    }

    // Bulk Actions Bar
    if (selectable && selectedIds.size > 0) {
      html += `
        <div class="data-table-bulk">
          <span>${selectedIds.size} item(s) selected</span>
          ${bulkActions || ''}
          <button class="btn btn-ghost btn-sm" id="table-deselect-all">Clear selection</button>
        </div>
      `;
    }

    // Table
    if (pageData.length === 0) {
      html += `
        <div class="table-empty">
          <svg class="table-empty-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
          <h4 class="table-empty-title">${emptyTitle}</h4>
          <p class="table-empty-desc">${emptyDesc}</p>
        </div>
      `;
    } else {
      html += `<table class="data-table"><thead><tr>`;
      
      if (selectable) {
        const allSelected = pageData.every(r => selectedIds.has(r.id));
        html += `<th style="width:40px"><input type="checkbox" ${allSelected ? 'checked' : ''} id="table-select-all" /></th>`;
      }

      for (const col of columns) {
        const isSorted = sortKey === col.key;
        html += `<th class="${isSorted ? 'sorted' : ''}" data-sort-key="${col.key}" style="${col.width ? `width:${col.width}` : ''}">
          ${col.label}
          ${col.sortable !== false ? `<span class="sort-icon">${isSorted && sortDir === 'desc' ? '↓' : '↑'}</span>` : ''}
        </th>`;
      }
      html += `</tr></thead><tbody>`;

      for (const row of pageData) {
        const isSelected = selectedIds.has(row.id);
        html += `<tr data-id="${row.id}" class="${isSelected ? 'selected' : ''}">`;
        
        if (selectable) {
          html += `<td><input type="checkbox" class="row-checkbox" data-id="${row.id}" ${isSelected ? 'checked' : ''} /></td>`;
        }

        for (const col of columns) {
          if (col.render) {
            html += `<td>${col.render(row[col.key], row)}</td>`;
          } else {
            html += `<td>${row[col.key] ?? '—'}</td>`;
          }
        }
        html += `</tr>`;
      }

      html += `</tbody></table>`;
    }

    // Pagination
    if (totalPages > 1) {
      html += `
        <div class="pagination">
          <div class="pagination-info">
            Showing ${startIndex + 1}–${Math.min(startIndex + pageSize, totalItems)} of ${totalItems}
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        if (totalPages <= 7 || p <= 2 || p >= totalPages - 1 || Math.abs(p - currentPage) <= 1) {
          html += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
        } else if (p === 3 && currentPage > 4) {
          html += `<span class="pagination-btn" style="cursor:default;">…</span>`;
        } else if (p === totalPages - 2 && currentPage < totalPages - 3) {
          html += `<span class="pagination-btn" style="cursor:default;">…</span>`;
        }
      }

      html += `
            <button class="pagination-btn" ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;

    // --- Event Listeners ---

    // Search
    const searchInput = document.getElementById('table-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        applyFilters();
        render();
      });
      // Keep focus on search input after re-render
      if (document.activeElement === container || searchTerm) {
        searchInput.focus();
        searchInput.setSelectionRange(searchTerm.length, searchTerm.length);
      }
    }

    // Sort
    container.querySelectorAll('th[data-sort-key]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sortKey;
        if (sortKey === key) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortKey = key;
          sortDir = 'asc';
        }
        applyFilters();
        render();
      });
    });

    // Row click
    if (onRowClick) {
      container.querySelectorAll('tbody tr').forEach(tr => {
        tr.addEventListener('click', (e) => {
          if (e.target.type === 'checkbox') return;
          const id = tr.dataset.id;
          const row = data.find(r => r.id === id);
          if (row) onRowClick(row);
        });
      });
    }

    // Pagination
    container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          render();
        }
      });
    });

    // Select all
    document.getElementById('table-select-all')?.addEventListener('change', (e) => {
      if (e.target.checked) {
        pageData.forEach(r => selectedIds.add(r.id));
      } else {
        pageData.forEach(r => selectedIds.delete(r.id));
      }
      render();
    });

    // Row checkbox
    container.querySelectorAll('.row-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = cb.dataset.id;
        if (e.target.checked) {
          selectedIds.add(id);
        } else {
          selectedIds.delete(id);
        }
        render();
      });
    });

    // Deselect all
    document.getElementById('table-deselect-all')?.addEventListener('click', () => {
      selectedIds.clear();
      render();
    });
  }

  applyFilters();
  render();

  return {
    refresh(newData) {
      data = newData;
      applyFilters();
      render();
    },
    getSelected() {
      return [...selectedIds];
    },
  };
}
