// Server Simulation URL (Using JSONPlaceholder as a mock)
const apiUrl = 'https://jsonplaceholder.typicode.com/posts';

// Local Storage Key
const LOCAL_QUOTES_KEY = 'localQuotes';

// DOM Elements
const quoteDisplay = document.getElementById('quote-display');
const categoryFilter = document.getElementById('categoryFilter');
const generateBtn = document.getElementById('generate-btn');
const syncIndicator = document.getElementById('sync-indicator');
const syncStatusText = document.getElementById('sync-status-text');
const lastSync = document.getElementById('last-sync');
const lastSyncDetail = document.getElementById('last-sync-detail');
const manualSyncBtn = document.getElementById('manual-sync');
const forceSyncBtn = document.getElementById('force-sync');
const syncBanner = document.getElementById('sync-banner');
const syncMessage = document.getElementById('sync-message');
const syncDismiss = document.getElementById('sync-dismiss');
const syncAction = document.getElementById('sync-action');
const autoSyncCheckbox = document.getElementById('auto-sync');
const conflictAutoResolveCheckbox = document.getElementById('conflict-auto-resolve');
const localCount = document.getElementById('local-count');
const serverCount = document.getElementById('server-count');
const syncStatusDetail = document.getElementById('sync-status-detail');
const syncConflicts = document.getElementById('sync-conflicts');
const totalQuotes = document.getElementById('total-quotes');

// State
let syncInterval;
let conflictsResolved = 0;

// Utils
const getLocalQuotes = () => JSON.parse(localStorage.getItem(LOCAL_QUOTES_KEY)) || [];
const saveLocalQuotes = (quotes) => localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(quotes));

const updateStats = () => {
  const localQuotes = getLocalQuotes();
  localCount.textContent = localQuotes.length;
  totalQuotes.textContent = localQuotes.length;
  syncConflicts.textContent = conflictsResolved;
};

// Mock Fetch Quotes from Server
const fetchServerQuotes = async () => {
  const res = await fetch(apiUrl);
  const data = await res.json();
  return data.slice(0, 10).map(item => ({
    id: item.id,
    text: item.title,
    category: 'wisdom' // Default category for simulation
  }));
};

// Display a Random Quote
const displayRandomQuote = () => {
  const quotes = getLocalQuotes();
  const filter = categoryFilter.value;
  const filtered = filter === 'all' ? quotes : quotes.filter(q => q.category === filter);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = randomQuote.text;
};

// Sync Process
const syncData = async () => {
  try {
    const serverQuotes = await fetchServerQuotes();
    serverCount.textContent = serverQuotes.length;
    const localQuotes = getLocalQuotes();
    let mergedQuotes = [...localQuotes];

    // Detect conflicts (Quotes with same ID but different text)
    const conflicts = serverQuotes.filter(sq => {
      const localMatch = localQuotes.find(lq => lq.id === sq.id);
      return localMatch && localMatch.text !== sq.text;
    });

    if (conflicts.length > 0) {
      if (conflictAutoResolveCheckbox.checked) {
        // Auto-resolve: Server data takes precedence
        mergedQuotes = localQuotes.map(lq => {
          const serverConflict = conflicts.find(sc => sc.id === lq.id);
          return serverConflict ? serverConflict : lq;
        });
        conflictsResolved += conflicts.length;
        showSyncBanner(`${conflicts.length} conflicts auto-resolved.`, false);
      } else {
        showSyncBanner(`${conflicts.length} conflicts detected.`, true);
        return;
      }
    }

    // Add new server quotes not in local
    serverQuotes.forEach(sq => {
      if (!mergedQuotes.some(lq => lq.id === sq.id)) {
        mergedQuotes.push(sq);
      }
    });

    saveLocalQuotes(mergedQuotes);
    updateStats();
    markOnline();
    updateLastSync();
  } catch (err) {
    console.error('Sync failed:', err);
    markOffline();
  }
};

const markOnline = () => {
  syncIndicator.classList.remove('offline');
  syncIndicator.classList.add('online');
  syncStatusText.textContent = 'Online';
  syncStatusDetail.textContent = 'Online';
};

const markOffline = () => {
  syncIndicator.classList.remove('online');
  syncIndicator.classList.add('offline');
  syncStatusText.textContent = 'Offline';
  syncStatusDetail.textContent = 'Offline';
};

const updateLastSync = () => {
  const timestamp = new Date().toLocaleTimeString();
  lastSync.textContent = timestamp;
  lastSyncDetail.textContent = timestamp;
};

const showSyncBanner = (message, showResolve) => {
  syncMessage.textContent = message;
  syncAction.classList.toggle('hidden', !showResolve);
  syncBanner.classList.remove('hidden');
};

// Event Listeners
generateBtn.addEventListener('click', displayRandomQuote);
manualSyncBtn.addEventListener('click', syncData);
forceSyncBtn.addEventListener('click', syncData);
syncDismiss.addEventListener('click', () => syncBanner.classList.add('hidden'));
syncAction.addEventListener('click', () => {
  conflictAutoResolveCheckbox.checked = true;
  syncData();
  syncBanner.classList.add('hidden');
});

autoSyncCheckbox.addEventListener('change', () => {
  if (autoSyncCheckbox.checked) {
    startAutoSync();
  } else {
    stopAutoSync();
  }
});

// Auto-Sync
const startAutoSync = () => {
  stopAutoSync();
  syncInterval = setInterval(syncData, 30000); // 30 seconds
};
const stopAutoSync = () => clearInterval(syncInterval);

// Init
updateStats();
startAutoSync();
