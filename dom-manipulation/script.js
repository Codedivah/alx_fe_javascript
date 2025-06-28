// Quote data structure - array of quote objects with text and category
let quotes = [];
let serverQuotes = [];
let syncConflicts = 0;

// Default quotes to initialize the app if no data exists in localStorage
const defaultQuotes = [
  {
    id: 'local-1',
    text: "The only way to do great work is to love what you do.",
    category: "motivation",
    source: "local",
    timestamp: Date.now()
  },
  {
    id: 'local-2',
    text: "Life is what happens to you while you're busy making other plans.",
    category: "life",
    source: "local",
    timestamp: Date.now()
  },
  {
    id: 'local-3',
    text: "The future belongs to those who believe in the beauty of their dreams.",
    category: "dreams",
    source: "local",
    timestamp: Date.now()
  },
  {
    id: 'local-4',
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    category: "success",
    source: "local",
    timestamp: Date.now()
  },
  {
    id: 'local-5',
    text: "The only impossible journey is the one you never begin.",
    category: "motivation",
    source: "local",
    timestamp: Date.now()
  }
];

// DOM elements
const quoteDisplay = document.getElementById('quote-display');
const quoteCategory = document.getElementById('quote-category');
const quoteSource = document.getElementById('quote-source');
const categoryFilter = document.getElementById('categoryFilter');
const generateBtn = document.getElementById('generate-btn');
const totalQuotesElement = document.getElementById('total-quotes');
const totalCategoriesElement = document.getElementById('total-categories');
const serverQuotesElement = document.getElementById('server-quotes');
const syncConflictsElement = document.getElementById('sync-conflicts');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');
const importBtn = document.getElementById('import-btn');

// Sync elements
const syncBanner = document.getElementById('sync-banner');
const syncMessage = document.getElementById('sync-message');
const syncDismiss = document.getElementById('sync-dismiss');
const syncAction = document.getElementById('sync-action');
const syncIndicator = document.getElementById('sync-indicator');
const syncStatusText = document.getElementById('sync-status-text');
const lastSyncElement = document.getElementById('last-sync');
const lastSyncDetail = document.getElementById('last-sync-detail');
const syncStatusDetail = document.getElementById('sync-status-detail');
const localCountElement = document.getElementById('local-count');
const serverCountElement = document.getElementById('server-count');
const manualSyncBtn = document.getElementById('manual-sync');
const forceSyncBtn = document.getElementById('force-sync');
const autoSyncCheckbox = document.getElementById('auto-sync');
const conflictAutoResolveCheckbox = document.getElementById('conflict-auto-resolve');
const syncImmediatelyCheckbox = document.getElementById('sync-immediately');

// Storage keys
const STORAGE_KEY = 'quoteGeneratorData';
const CATEGORY_PREFERENCE_KEY = 'selectedCategory';
const SYNC_SETTINGS_KEY = 'syncSettings';
const LAST_SYNC_KEY = 'lastSyncTimestamp';
const SYNC_CONFLICTS_KEY = 'syncConflicts';

// Session Storage keys
const SESSION_LAST_QUOTE_KEY = 'lastDisplayedQuote';
const SESSION_PREFERENCES_KEY = 'userPreferences';
const SESSION_FILTER_HISTORY_KEY = 'filterHistory';

// Sync configuration
const SYNC_INTERVAL = 30000; // 30 seconds
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Current state
let currentFilter = 'all';
let filterHistory = [];
let syncInterval = null;
let lastSyncTimestamp = null;
let isOnline = navigator.onLine;

// Initialize the application
function initializeApp() {
  loadQuotesFromStorage();
  loadUserPreferences();
  loadSessionData();
  loadSyncSettings();
  populateCategories();
  updateStatistics();
  showRandomQuote();
  createAddQuoteForm();
  setupImportExport();
  setupCategoryCards();
  setupSyncControls();
  initializeSync();
  
  // Event listeners
  generateBtn.addEventListener('click', showRandomQuote);
  
  // Online/offline detection
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);
}

// Main sync function - provides a clean interface for syncing operations
async function syncQuotes() {
  console.log('Starting quote synchronization...');
  
  if (!isOnline) {
    console.log('Cannot sync quotes - device is offline');
    showSyncNotification('Cannot sync while offline', 'error');
    return false;
  }
  
  try {
    updateSyncStatus('syncing');
    showSyncNotification('Synchronizing quotes with server...', 'info');
    
    // Fetch latest quotes from server
    console.log('Fetching quotes from server...');
    const serverData = await fetchQuotesFromServer();
    console.log(`Received ${serverData.length} quotes from server`);
    
    // Merge server data with local quotes and handle conflicts
    const mergeResult = mergeQuotesWithConflictResolution(quotes, serverData);
    
    // Handle any conflicts that were detected
    if (mergeResult.hasConflicts) {
      console.log(`Detected ${mergeResult.conflicts.length} conflicts during sync`);
      handleSyncConflicts(mergeResult);
    }
    
    // Update local data if new quotes were received
    if (mergeResult.hasNewQuotes) {
      console.log('New quotes received from server, updating local storage');
      quotes = mergeResult.mergedQuotes;
      saveQuotesToStorage();
      updateDOMAfterSync();
      showSyncNotification(`Received ${serverData.length} new quotes from server!`, 'success');
    } else {
      console.log('No new quotes received from server');
      showSyncNotification('Sync completed - no new quotes', 'info');
    }
    
    // Push any local changes to server
    console.log('Syncing local changes to server...');
    await syncLocalChangesToServer();
    
    // Update sync timestamp and status
    lastSyncTimestamp = Date.now();
    localStorage.setItem(LAST_SYNC_KEY, lastSyncTimestamp.toString());
    updateSyncStatus('online');
    updateLastSyncDisplay();
    
    console.log('Quote synchronization completed successfully');
    return true;
    
  } catch (error) {
    console.error('Quote synchronization failed:', error);
    updateSyncStatus('error');
    showSyncNotification('Sync failed. Will retry automatically.', 'error');
    return false;
  }
}

// Sync Management Functions
function initializeSync() {
  updateSyncStatus();
  
  if (autoSyncCheckbox.checked && isOnline) {
    startAutoSync();
  }
  
  // Initial sync
  if (isOnline) {
    performSync();
  }
}

function startAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  syncInterval = setInterval(() => {
    if (isOnline && autoSyncCheckbox.checked) {
      console.log('Auto-sync triggered - checking for new quotes from server');
      performSync();
    }
  }, SYNC_INTERVAL);
  
  console.log(`Auto-sync started - will check server every ${SYNC_INTERVAL / 1000} seconds`);
}

function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  console.log('Auto-sync stopped');
}

async function performSync() {
  try {
    updateSyncStatus('syncing');
    
    // Fetch server data using the mock API
    const serverData = await fetchQuotesFromServer();
    
    // Merge and resolve conflicts
    const mergeResult = mergeQuotesWithConflictResolution(quotes, serverData);
    
    if (mergeResult.hasConflicts) {
      handleSyncConflicts(mergeResult);
    }
    
    if (mergeResult.hasNewQuotes) {
      quotes = mergeResult.mergedQuotes;
      saveQuotesToStorage();
      updateDOMAfterSync();
      showSyncNotification('New quotes received from server!', 'success');
    }
    
    // Update server with local changes if needed
    await syncLocalChangesToServer();
    
    lastSyncTimestamp = Date.now();
    localStorage.setItem(LAST_SYNC_KEY, lastSyncTimestamp.toString());
    
    updateSyncStatus('online');
    updateLastSyncDisplay();
    
    console.log('Sync completed successfully');
    
  } catch (error) {
    console.error('Sync failed:', error);
    updateSyncStatus('error');
    showSyncNotification('Sync failed. Will retry automatically.', 'error');
  }
}

// Fetch quotes from server using JSONPlaceholder mock API
async function fetchQuotesFromServer() {
  console.log('Fetching quotes from JSONPlaceholder API...');
  
  // Simulate fetching quotes from JSONPlaceholder posts
  const response = await fetch(`${API_BASE_URL}/posts?_limit=10`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch server data: ${response.status} ${response.statusText}`);
  }
  
  const posts = await response.json();
  console.log(`Successfully fetched ${posts.length} posts from server`);
  
  // Transform posts into quote format
  const serverQuotes = posts.map(post => ({
    id: `server-${post.id}`,
    text: post.title.charAt(0).toUpperCase() + post.title.slice(1) + '.',
    category: getRandomCategory(),
    source: 'server',
    timestamp: Date.now() - Math.random() * 86400000, // Random timestamp within last day
    serverId: post.id
  }));
  
  console.log(`Transformed ${serverQuotes.length} posts into quote format`);
  return serverQuotes;
}

function getRandomCategory() {
  const categories = ['motivation', 'life', 'success', 'wisdom', 'dreams', 'inspiration'];
  return categories[Math.floor(Math.random() * categories.length)];
}

// Post local quotes to server using JSONPlaceholder mock API
async function syncLocalChangesToServer() {
  // Simulate posting local quotes to server
  const localQuotes = quotes.filter(quote => quote.source === 'local' && !quote.synced);
  
  console.log(`Syncing ${localQuotes.length} local quotes to server...`);
  
  for (const quote of localQuotes) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: quote.text,
          body: `Category: ${quote.category}`,
          userId: 1
        })
      });
      
      if (response.ok) {
        quote.synced = true;
        console.log('Successfully synced local quote to server:', quote.text);
      } else {
        console.error('Failed to sync quote to server:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to sync quote to server:', error);
    }
  }
  
  // Update local storage with sync status
  saveQuotesToStorage();
  console.log('Completed syncing local quotes to server');
}

// Merge quotes with conflict resolution - server data takes precedence
function mergeQuotesWithConflictResolution(localQuotes, serverQuotes) {
  const mergedQuotes = [...localQuotes];
  let hasConflicts = false;
  let hasNewQuotes = false;
  const conflicts = [];
  
  console.log(`Merging ${localQuotes.length} local quotes with ${serverQuotes.length} server quotes`);
  
  serverQuotes.forEach(serverQuote => {
    const existingQuote = mergedQuotes.find(q => q.id === serverQuote.id);
    
    if (existingQuote) {
      // Conflict detected - same ID but potentially different content
      if (existingQuote.text !== serverQuote.text || existingQuote.category !== serverQuote.category) {
        hasConflicts = true;
        conflicts.push({
          local: existingQuote,
          server: serverQuote
        });
        
        console.log('Conflict detected for quote ID:', serverQuote.id);
        
        // Auto-resolve: server takes precedence
        if (conflictAutoResolveCheckbox.checked) {
          Object.assign(existingQuote, serverQuote);
          syncConflicts++;
          console.log('Auto-resolved conflict - using server data');
        }
      }
    } else {
      // New quote from server
      mergedQuotes.push(serverQuote);
      hasNewQuotes = true;
      console.log('Added new quote from server:', serverQuote.text);
    }
  });
  
  console.log(`Merge completed: ${conflicts.length} conflicts, ${hasNewQuotes ? 'has' : 'no'} new quotes`);
  
  return {
    mergedQuotes,
    hasConflicts,
    hasNewQuotes,
    conflicts
  };
}

function handleSyncConflicts(mergeResult) {
  console.log(`Handling ${mergeResult.conflicts.length} sync conflicts`);
  
  if (conflictAutoResolveCheckbox.checked) {
    showSyncNotification(
      `${mergeResult.conflicts.length} conflicts auto-resolved (server data used)`,
      'warning'
    );
    syncConflicts += mergeResult.conflicts.length;
    localStorage.setItem(SYNC_CONFLICTS_KEY, syncConflicts.toString());
    console.log('Conflicts auto-resolved using server data');
  } else {
    showConflictResolutionBanner(mergeResult.conflicts);
  }
}

function showConflictResolutionBanner(conflicts) {
  console.log('Showing conflict resolution banner for user input');
  
  syncMessage.textContent = `${conflicts.length} data conflicts detected. Choose resolution method.`;
  syncAction.textContent = 'Use Server Data';
  syncAction.classList.remove('hidden');
  syncBanner.classList.remove('hidden');
  syncBanner.classList.add('conflict');
  
  syncAction.onclick = () => {
    console.log('User chose to resolve conflicts using server data');
    
    // Resolve conflicts by using server data
    conflicts.forEach(conflict => {
      const localQuote = quotes.find(q => q.id === conflict.local.id);
      if (localQuote) {
        Object.assign(localQuote, conflict.server);
      }
    });
    
    saveQuotesToStorage();
    updateDOMAfterSync();
    hideSyncBanner();
    
    syncConflicts += conflicts.length;
    localStorage.setItem(SYNC_CONFLICTS_KEY, syncConflicts.toString());
    updateStatistics();
    
    showSyncNotification('Conflicts resolved using server data', 'success');
  };
}

function showSyncNotification(message, type = 'info') {
  console.log(`Sync notification (${type}):`, message);
  
  syncMessage.textContent = message;
  syncAction.classList.add('hidden');
  syncBanner.classList.remove('hidden', 'conflict');
  syncBanner.classList.add(type);
  
  // Auto-hide after 5 seconds for non-conflict notifications
  if (type !== 'conflict') {
    setTimeout(() => {
      hideSyncBanner();
    }, 5000);
  }
}

function hideSyncBanner() {
  syncBanner.classList.add('hidden');
  syncBanner.classList.remove('conflict', 'success', 'error', 'warning');
}

function updateSyncStatus(status = null) {
  if (status) {
    syncIndicator.className = `sync-indicator ${status}`;
    
    switch (status) {
      case 'online':
        syncStatusText.textContent = 'Online';
        syncStatusDetail.textContent = 'Connected';
        break;
      case 'syncing':
        syncStatusText.textContent = 'Syncing...';
        syncStatusDetail.textContent = 'Synchronizing';
        break;
      case 'error':
        syncStatusText.textContent = 'Error';
        syncStatusDetail.textContent = 'Sync Failed';
        break;
      case 'offline':
        syncStatusText.textContent = 'Offline';
        syncStatusDetail.textContent = 'No Connection';
        break;
    }
  } else {
    updateSyncStatus(isOnline ? 'online' : 'offline');
  }
}

function updateLastSyncDisplay() {
  if (lastSyncTimestamp) {
    const timeAgo = getTimeAgo(lastSyncTimestamp);
    lastSyncElement.textContent = timeAgo;
    lastSyncDetail.textContent = timeAgo;
  }
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function handleOnlineStatus() {
  isOnline = true;
  updateSyncStatus('online');
  
  if (autoSyncCheckbox.checked) {
    startAutoSync();
    performSync();
  }
  
  showSyncNotification('Connection restored. Syncing data...', 'success');
}

function handleOfflineStatus() {
  isOnline = false;
  updateSyncStatus('offline');
  stopAutoSync();
  showSyncNotification('Working offline. Changes will sync when connection is restored.', 'warning');
}

function setupSyncControls() {
  // Manual sync button
  manualSyncBtn.addEventListener('click', () => {
    if (isOnline) {
      syncQuotes(); // Use the new syncQuotes function
    } else {
      showSyncNotification('Cannot sync while offline', 'error');
    }
  });
  
  // Force sync button
  forceSyncBtn.addEventListener('click', () => {
    if (isOnline) {
      syncQuotes(); // Use the new syncQuotes function
    } else {
      showSyncNotification('Cannot sync while offline', 'error');
    }
  });
  
  // Auto-sync toggle
  autoSyncCheckbox.addEventListener('change', () => {
    if (autoSyncCheckbox.checked && isOnline) {
      startAutoSync();
    } else {
      stopAutoSync();
    }
    saveSyncSettings();
  });
  
  // Conflict resolution toggle
  conflictAutoResolveCheckbox.addEventListener('change', () => {
    saveSyncSettings();
  });
  
  // Sync banner controls
  syncDismiss.addEventListener('click', hideSyncBanner);
  
  // Load last sync timestamp
  const savedLastSync = localStorage.getItem(LAST_SYNC_KEY);
  if (savedLastSync) {
    lastSyncTimestamp = parseInt(savedLastSync);
    updateLastSyncDisplay();
  }
  
  // Load sync conflicts count
  const savedConflicts = localStorage.getItem(SYNC_CONFLICTS_KEY);
  if (savedConflicts) {
    syncConflicts = parseInt(savedConflicts);
  }
}

function loadSyncSettings() {
  try {
    const settings = localStorage.getItem(SYNC_SETTINGS_KEY);
    if (settings) {
      const parsed = JSON.parse(settings);
      autoSyncCheckbox.checked = parsed.autoSync !== false;
      conflictAutoResolveCheckbox.checked = parsed.autoResolve !== false;
      syncImmediatelyCheckbox.checked = parsed.syncImmediately !== false;
    }
  } catch (error) {
    console.error('Error loading sync settings:', error);
  }
}

function saveSyncSettings() {
  try {
    const settings = {
      autoSync: autoSyncCheckbox.checked,
      autoResolve: conflictAutoResolveCheckbox.checked,
      syncImmediately: syncImmediatelyCheckbox.checked
    };
    localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving sync settings:', error);
  }
}

function updateDOMAfterSync() {
  populateCategories();
  updateStatistics();
  updateCategoryCardsState();
  
  // Refresh current quote if needed
  if (currentFilter !== 'all') {
    showRandomQuote();
  }
}

// Enhanced quote addition with sync
async function addQuoteWithSync(quoteData) {
  const newQuote = {
    id: `local-${Date.now()}`,
    ...quoteData,
    source: 'local',
    timestamp: Date.now(),
    synced: false
  };
  
  quotes.push(newQuote);
  saveQuotesToStorage();
  updateDOMAfterAddingQuote();
  
  // Immediate sync if enabled and online
  if (syncImmediatelyCheckbox.checked && isOnline) {
    try {
      await syncLocalChangesToServer();
      showSyncNotification('Quote synced to server!', 'success');
    } catch (error) {
      console.error('Failed to sync new quote:', error);
      showSyncNotification('Quote saved locally. Will sync when connection is available.', 'warning');
    }
  }
  
  return newQuote;
}

// Load quotes from localStorage
function loadQuotesFromStorage() {
  try {
    const storedQuotes = localStorage.getItem(STORAGE_KEY);
    if (storedQuotes) {
      quotes = JSON.parse(storedQuotes);
      console.log('Loaded quotes from localStorage:', quotes.length, 'quotes');
    } else {
      // Use default quotes if no data exists
      quotes = [...defaultQuotes];
      saveQuotesToStorage();
      console.log('Initialized with default quotes');
    }
  } catch (error) {
    console.error('Error loading quotes from localStorage:', error);
    quotes = [...defaultQuotes];
    saveQuotesToStorage();
  }
}

// Save quotes to localStorage
function saveQuotesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    console.log('Saved quotes to localStorage:', quotes.length, 'quotes');
  } catch (error) {
    console.error('Error saving quotes to localStorage:', error);
    showErrorMessage('Failed to save quotes to storage');
  }
}

// Load user preferences from localStorage
function loadUserPreferences() {
  try {
    const savedCategory = localStorage.getItem(CATEGORY_PREFERENCE_KEY);
    if (savedCategory) {
      currentFilter = savedCategory;
      console.log('Loaded user preference - category:', currentFilter);
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
}

// Save user preferences to localStorage
function saveUserPreferences() {
  try {
    localStorage.setItem(CATEGORY_PREFERENCE_KEY, currentFilter);
    console.log('Saved user preference - category:', currentFilter);
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

// Load session-specific data
function loadSessionData() {
  try {
    // Load last displayed quote
    const lastQuote = sessionStorage.getItem(SESSION_LAST_QUOTE_KEY);
    if (lastQuote) {
      const quoteData = JSON.parse(lastQuote);
      console.log('Last displayed quote from session:', quoteData.text);
    }
    
    // Load filter history
    const history = sessionStorage.getItem(SESSION_FILTER_HISTORY_KEY);
    if (history) {
      filterHistory = JSON.parse(history);
      console.log('Loaded filter history:', filterHistory);
    }
    
    // Load user preferences
    const preferences = sessionStorage.getItem(SESSION_PREFERENCES_KEY);
    if (preferences) {
      const prefs = JSON.parse(preferences);
      if (prefs.selectedCategory) {
        currentFilter = prefs.selectedCategory;
      }
    }
  } catch (error) {
    console.error('Error loading session data:', error);
  }
}

// Save current quote to session storage
function saveCurrentQuoteToSession(quote) {
  try {
    sessionStorage.setItem(SESSION_LAST_QUOTE_KEY, JSON.stringify(quote));
  } catch (error) {
    console.error('Error saving quote to session storage:', error);
  }
}

// Save user preferences to session storage
function saveUserPreferencesToSession() {
  try {
    const preferences = {
      selectedCategory: currentFilter,
      timestamp: Date.now()
    };
    sessionStorage.setItem(SESSION_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to session storage:', error);
  }
}

// Save filter history to session storage
function saveFilterHistoryToSession() {
  try {
    sessionStorage.setItem(SESSION_FILTER_HISTORY_KEY, JSON.stringify(filterHistory));
  } catch (error) {
    console.error('Error saving filter history to session storage:', error);
  }
}

// Dynamically populate categories in the filter dropdown
function populateCategories() {
  const categories = getUniqueCategories();
  const currentSelection = categoryFilter.value || currentFilter;
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add category options dynamically
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = capitalizeFirstLetter(category);
    categoryFilter.appendChild(option);
  });
  
  // Restore previous selection if it still exists
  if (currentSelection && (currentSelection === 'all' || categories.includes(currentSelection))) {
    categoryFilter.value = currentSelection;
    currentFilter = currentSelection;
  } else {
    // Reset to 'all' if saved category no longer exists
    categoryFilter.value = 'all';
    currentFilter = 'all';
    saveUserPreferences();
  }
  
  console.log('Categories populated:', categories.length, 'categories');
}

// Get unique categories from quotes array
function getUniqueCategories() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  return categories.sort();
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  
  // Add to filter history if different from current
  if (selectedCategory !== currentFilter) {
    filterHistory.push({
      from: currentFilter,
      to: selectedCategory,
      timestamp: Date.now()
    });
    
    // Keep only last 10 filter changes
    if (filterHistory.length > 10) {
      filterHistory = filterHistory.slice(-10);
    }
    
    saveFilterHistoryToSession();
  }
  
  currentFilter = selectedCategory;
  
  // Save preferences
  saveUserPreferences();
  saveUserPreferencesToSession();
  
  // Display filtered quote
  showRandomQuote();
  
  // Update category cards visual state
  updateCategoryCardsState();
  
  console.log('Category changed to:', currentFilter);
}

// Function to display a random quote based on selected category
function showRandomQuote() {
  const selectedCategory = currentFilter;
  let filteredQuotes;
  
  // Filter quotes based on selected category
  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  // Handle case when no quotes are available
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = `No quotes available for the "${selectedCategory}" category.`;
    quoteCategory.textContent = "";
    quoteSource.classList.add('hidden');
    return;
  }
  
  // Select random quote from filtered array
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  // Save current quote to session storage
  saveCurrentQuoteToSession(randomQuote);
  
  // Update DOM with smooth transition
  quoteDisplay.style.opacity = '0';
  quoteCategory.style.opacity = '0';
  quoteSource.style.opacity = '0';
  
  setTimeout(() => {
    quoteDisplay.textContent = `"${randomQuote.text}"`;
    quoteCategory.textContent = `Category: ${capitalizeFirstLetter(randomQuote.category)}`;
    
    // Show source information
    if (randomQuote.source) {
      const sourceText = randomQuote.source === 'server' ? '🌐 From Server' : '💾 Local Quote';
      quoteSource.textContent = sourceText;
      quoteSource.classList.remove('hidden');
    } else {
      quoteSource.classList.add('hidden');
    }
    
    quoteDisplay.style.opacity = '1';
    quoteCategory.style.opacity = '1';
    quoteSource.style.opacity = '1';
  }, 150);
  
  console.log(`Displayed quote from category "${selectedCategory}":`, randomQuote.text);
}

// Function to create and handle the add quote form
function createAddQuoteForm() {
  const addQuoteForm = document.getElementById('add-quote-form');
  
  // Handle form submission
  addQuoteForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Get form input values
    const quoteText = document.getElementById('quote-text').value.trim();
    const categoryName = document.getElementById('quote-category-input').value.trim().toLowerCase();
    
    // Validate inputs
    if (!quoteText || !categoryName) {
      showErrorMessage('Please fill in both quote text and category fields.');
      return;
    }
    
    // Create new quote object with text and category properties
    const quoteData = {
      text: quoteText,
      category: categoryName
    };
    
    // Add quote with sync
    const newQuote = await addQuoteWithSync(quoteData);
    
    // Clear the form
    addQuoteForm.reset();
    
    // Show success feedback
    showSuccessMessage(`Quote added to "${capitalizeFirstLetter(categoryName)}" category!`);
    
    // If the new category is selected or "all" is selected, show the new quote
    if (currentFilter === 'all' || currentFilter === categoryName) {
      setTimeout(() => {
        showRandomQuote();
      }, 1000);
    }
    
    console.log('New quote added:', newQuote);
  });
}

// Setup import/export functionality
function setupImportExport() {
  // Export button event listener
  exportBtn.addEventListener('click', exportQuotesToJSON);
  
  // Import button event listener
  importBtn.addEventListener('click', () => {
    importInput.click();
  });
  
  // File input change event listener
  importInput.addEventListener('change', handleFileImport);
}

// Export quotes to JSON file
function exportQuotesToJSON() {
  try {
    // Create export data with metadata
    const exportData = {
      quotes: quotes,
      exportDate: new Date().toISOString(),
      totalQuotes: quotes.length,
      categories: getUniqueCategories(),
      categoryStats: getCategoryStatistics(),
      syncInfo: {
        lastSync: lastSyncTimestamp,
        syncConflicts: syncConflicts,
        serverQuotes: quotes.filter(q => q.source === 'server').length,
        localQuotes: quotes.filter(q => q.source === 'local').length
      },
      userPreferences: {
        lastSelectedCategory: currentFilter,
        filterHistory: filterHistory
      }
    };
    
    // Convert to JSON string with formatting
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create Blob with JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download URL
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `quotes-export-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up URL
    URL.revokeObjectURL(url);
    
    showSuccessMessage('Quotes exported successfully with sync data!');
    console.log('Exported', quotes.length, 'quotes with sync information');
    
  } catch (error) {
    console.error('Error exporting quotes:', error);
    showErrorMessage('Failed to export quotes');
  }
}

// Handle file import
function handleFileImport(event) {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  // Validate file type
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    showErrorMessage('Please select a valid JSON file');
    return;
  }
  
  // Create FileReader
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const fileContent = e.target.result;
      const importedData = JSON.parse(fileContent);
      
      // Validate imported data structure
      let quotesToImport = [];
      
      if (Array.isArray(importedData)) {
        // Direct array of quotes
        quotesToImport = importedData;
      } else if (importedData.quotes && Array.isArray(importedData.quotes)) {
        // Export format with metadata
        quotesToImport = importedData.quotes;
      } else {
        throw new Error('Invalid file format');
      }
      
      // Validate and enhance quote objects
      const validQuotes = quotesToImport.filter(quote => {
        return quote && 
               typeof quote.text === 'string' && 
               typeof quote.category === 'string' &&
               quote.text.trim() !== '' &&
               quote.category.trim() !== '';
      }).map(quote => ({
        ...quote,
        id: quote.id || `imported-${Date.now()}-${Math.random()}`,
        source: quote.source || 'imported',
        timestamp: quote.timestamp || Date.now()
      }));
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in file');
      }
      
      // Get categories before import
      const categoriesBefore = getUniqueCategories();
      
      // Ask user for confirmation
      const confirmMessage = `Import ${validQuotes.length} quotes? This will add them to your existing collection.`;
      if (confirm(confirmMessage)) {
        // Add imported quotes to existing array
        quotes.push(...validQuotes);
        
        // Save to localStorage
        saveQuotesToStorage();
        
        // Update DOM
        updateDOMAfterAddingQuote();
        
        // Get categories after import
        const categoriesAfter = getUniqueCategories();
        const newCategories = categoriesAfter.filter(cat => !categoriesBefore.includes(cat));
        
        let successMessage = `Successfully imported ${validQuotes.length} quotes!`;
        if (newCategories.length > 0) {
          successMessage += ` Added ${newCategories.length} new categories: ${newCategories.map(capitalizeFirstLetter).join(', ')}`;
        }
        
        showSuccessMessage(successMessage);
        console.log('Imported', validQuotes.length, 'quotes from JSON file');
        console.log('New categories added:', newCategories);
        
        // Sync imported quotes if enabled
        if (syncImmediatelyCheckbox.checked && isOnline) {
          setTimeout(() => {
            performSync();
          }, 1000);
        }
        
        // Show a random quote from the updated collection
        setTimeout(() => {
          showRandomQuote();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error importing quotes:', error);
      showErrorMessage('Failed to import quotes. Please check the file format.');
    }
  };
  
  reader.onerror = function() {
    console.error('Error reading file');
    showErrorMessage('Failed to read the selected file');
  };
  
  // Read file as text
  reader.readAsText(file);
  
  // Clear input for next import
  event.target.value = '';
}

// Update DOM elements after adding a new quote
function updateDOMAfterAddingQuote() {
  // Update category dropdown
  populateCategories();
  
  // Update statistics
  updateStatistics();
  
  // Update category cards
  updateCategoryCardsState();
}

// Setup category cards functionality
function setupCategoryCards() {
  const categoryCards = document.querySelectorAll('.category-card');
  
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      if (category) {
        categoryFilter.value = category;
        filterQuotes();
      }
    });
  });
}

// Update category cards visual state
function updateCategoryCardsState() {
  const categoryCards = document.querySelectorAll('.category-card');
  
  categoryCards.forEach(card => {
    const category = card.dataset.category;
    if (category === currentFilter) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// Get category statistics
function getCategoryStatistics() {
  const categories = getUniqueCategories();
  const stats = {};
  
  categories.forEach(category => {
    stats[category] = quotes.filter(quote => quote.category === category).length;
  });
  
  return stats;
}

// Update statistics display
function updateStatistics() {
  totalQuotesElement.textContent = quotes.length;
  totalCategoriesElement.textContent = getUniqueCategories().length;
  
  // Update sync-specific statistics
  const serverQuotesCount = quotes.filter(q => q.source === 'server').length;
  const localQuotesCount = quotes.filter(q => q.source === 'local').length;
  
  serverQuotesElement.textContent = serverQuotesCount;
  syncConflictsElement.textContent = syncConflicts;
  localCountElement.textContent = localQuotesCount;
  serverCountElement.textContent = serverQuotesCount;
}

// Show success message with animation
function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  
  document.body.appendChild(successDiv);
  
  // Animate in
  setTimeout(() => {
    successDiv.classList.add('show');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    successDiv.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 300);
  }, 3000);
}

// Show error message with animation
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  
  // Animate in
  setTimeout(() => {
    errorDiv.classList.add('show');
  }, 10);
  
  // Remove after 4 seconds
  setTimeout(() => {
    errorDiv.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 300);
  }, 4000);
}

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
