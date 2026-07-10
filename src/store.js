// ============================================
// GymPro — localStorage Data Store
// CRUD operations for all collections
// ============================================

const STORE_PREFIX = 'gympro_';

// Generate UUID
function generateId() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// Get current timestamp
function now() {
  return new Date().toISOString();
}

class Store {
  constructor(collection) {
    this.collection = collection;
    this.key = STORE_PREFIX + collection;
  }

  // Get all records
  getAll() {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  // Get record by ID
  getById(id) {
    const items = this.getAll();
    return items.find(item => item.id === id) || null;
  }

  // Query records by filter function
  query(filterFn) {
    return this.getAll().filter(filterFn);
  }

  // Create a new record
  create(data) {
    const items = this.getAll();
    const newItem = {
      id: generateId(),
      ...data,
      createdAt: now(),
      updatedAt: now(),
    };
    items.push(newItem);
    this._save(items);
    return newItem;
  }

  // Update a record by ID
  update(id, data) {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...data,
      id, // Ensure ID can't be changed
      updatedAt: now(),
    };
    this._save(items);
    return items[index];
  }

  // Delete a record by ID
  delete(id) {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    this._save(filtered);
    return true;
  }

  // Delete multiple records by IDs
  deleteMany(ids) {
    const items = this.getAll();
    const filtered = items.filter(item => !ids.includes(item.id));
    this._save(filtered);
    return items.length - filtered.length;
  }

  // Count records
  count(filterFn) {
    if (filterFn) return this.query(filterFn).length;
    return this.getAll().length;
  }

  // Replace all data (used by seed)
  setAll(items) {
    this._save(items);
  }

  // Clear collection
  clear() {
    localStorage.removeItem(this.key);
  }

  // Private: save to localStorage
  _save(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}

// ============================================
// Collection instances
// ============================================
export const usersStore = new Store('users');
export const membersStore = new Store('members');
export const trainersStore = new Store('trainers');
export const plansStore = new Store('plans');
export const subscriptionsStore = new Store('subscriptions');
export const paymentsStore = new Store('payments');
export const attendanceStore = new Store('attendance');
export const workoutsStore = new Store('workouts');
export const exercisesStore = new Store('exercises');
export const nutritionStore = new Store('nutrition');
export const notificationsStore = new Store('notifications');

// ============================================
// Auth helpers
// ============================================
const AUTH_KEY = STORE_PREFIX + 'auth';

export function login(email, password) {
  const users = usersStore.getAll();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const session = { ...user, loggedInAt: now() };
    delete session.password;
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  }
  return null;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getSession() {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function isAuthenticated() {
  return getSession() !== null;
}

// ============================================
// Utility: check if data is seeded
// ============================================
export function isSeeded() {
  return localStorage.getItem(STORE_PREFIX + 'seeded') === 'true';
}

export function markSeeded() {
  localStorage.setItem(STORE_PREFIX + 'seeded', 'true');
}

// ============================================
// Utility: format helpers
// ============================================
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2 - d1);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export function isToday(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export { Store, generateId };
