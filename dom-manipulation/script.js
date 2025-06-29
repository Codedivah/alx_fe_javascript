"use strict"
// Enhanced Quote Generator Application with Server Synchronization
class QuoteGenerator {
    constructor() {
        // Default quotes collection with diverse categories
        this.defaultQuotes = [
            { id: 'default_1', text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_2', text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon", category: "Life", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_3', text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Dreams", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_4', text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "Success", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_5', text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Success", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_6', text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "Motivation", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_7', text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Persistence", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_8', text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", category: "Mindset", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_9', text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Action", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_10', text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Innovation", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_11', text: "Your limitation—it's only your imagination.", author: "Unknown", category: "Dreams", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_12', text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", category: "Life", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_13', text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "Action", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_14', text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Confidence", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_15', text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Persistence", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_16', text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "Courage", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_17', text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "Resilience", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_18', text: "The mind is everything. What you think you become.", author: "Buddha", category: "Mindset", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_19', text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", category: "Opportunity", serverSync: true, lastModified: new Date('2024-01-01').toISOString() },
            { id: 'default_20', text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein", category: "Purpose", serverSync: true, lastModified: new Date('2024-01-01').toISOString() }
        ];
        
        this.quotes = [];
        this.currentCategory = 'All';
        this.userQuotesCount = 0;
        this.sessionQuotesViewed = 0;
        this.lastDisplayedQuote = null;
        this.categoryPreferences = {};
        this.filterHistory = [];
        
        // Server sync properties
        this.serverUrl = 'https://jsonplaceholder.typicode.com/posts';
        this.syncInterval = 30000; // 30 seconds
        this.syncTimer = null;
        this.lastSyncTime = null;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.conflictResolutionMode = 'server-wins'; // 'server-wins', 'local-wins', 'manual'
        this.pendingConflicts = [];
        
        this.initializeApp();
        this.loadStoredData();
        this.initializeServerSync();
    }

    initializeApp() {
        // Initialize Lucide icons
        lucide.createIcons();
        
        // Get DOM elements
        this.elements = {
            quoteText: document.getElementById('quote-text'),
            quoteAuthor: document.getElementById('quote-author'),
            quoteCategory: document.getElementById('quote-category'),
            quoteContainer: document.getElementById('quote-container'),
            categoryFilters: document.getElementById('category-filters'),
            newQuoteBtn: document.getElementById('new-quote-btn'),
            addQuoteBtn: document.getElementById('add-quote-btn'),
            manageDataBtn: document.getElementById('manage-data-btn'),
            addQuoteSection: document.getElementById('add-quote-section'),
            dataManagementSection: document.getElementById('data-management-section'),
            closeFormBtn: document.getElementById('close-form-btn'),
            closeDataBtn: document.getElementById('close-data-btn'),
            quoteForm: document.getElementById('quote-form'),
            quoteInput: document.getElementById('quote-input'),
            authorInput: document.getElementById('author-input'),
            categoryInput: document.getElementById('category-input'),
            existingCategories: document.getElementById('existing-categories'),
            totalQuotes: document.getElementById('total-quotes'),
            totalCategories: document.getElementById('total-categories'),
            userQuotes: document.getElementById('user-quotes'),
            sessionQuotes: document.getElementById('session-quotes'),
            exportAllBtn: document.getElementById('export-all-btn'),
            exportUserBtn: document.getElementById('export-user-btn'),
            fileDropZone: document.getElementById('file-drop-zone'),
            fileInput: document.getElementById('file-input'),
            clearUserDataBtn: document.getElementById('clear-user-data-btn'),
            resetAllBtn: document.getElementById('reset-all-btn'),
            syncStatusBtn: document.getElementById('sync-status-btn'),
            forceSync: document.getElementById('force-sync-btn'),
            conflictResolution: document.getElementById('conflict-resolution')
        };

        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize display
        this.populateCategories();
        this.renderCategoryFilters();
        this.showRandomQuote();
        this.updateStats();
        this.populateExistingCategories();
        this.loadSessionData();
        this.loadUserPreferences();
        this.updateSyncStatus();
    }

    setupEventListeners() {
        // Quote generation and navigation
        this.elements.newQuoteBtn.addEventListener('click', () => {
            this.showRandomQuote();
        });

        // Form toggles
        this.elements.addQuoteBtn.addEventListener('click', () => {
            this.toggleAddQuoteForm();
        });

        this.elements.manageDataBtn.addEventListener('click', () => {
            this.toggleDataManagement();
        });

        this.elements.closeFormBtn.addEventListener('click', () => {
            this.toggleAddQuoteForm();
        });

        this.elements.closeDataBtn.addEventListener('click', () => {
            this.toggleDataManagement();
        });

        // Form submission
        this.elements.quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewQuote();
        });

        // Category selection helper
        this.elements.existingCategories.addEventListener('change', (e) => {
            if (e.target.value) {
                this.elements.categoryInput.value = e.target.value;
            }
        });

        // Data management
        this.elements.exportAllBtn.addEventListener('click', () => {
            this.exportQuotes('all');
        });

        this.elements.exportUserBtn.addEventListener('click', () => {
            this.exportQuotes('user');
        });

        this.elements.clearUserDataBtn.addEventListener('click', () => {
            this.clearUserData();
        });

        this.elements.resetAllBtn.addEventListener('click', () => {
            this.resetAllData();
        });

        // Server sync controls
        if (this.elements.syncStatusBtn) {
            this.elements.syncStatusBtn.addEventListener('click', () => {
                this.toggleSyncStatus();
            });
        }

        if (this.elements.forceSync) {
            this.elements.forceSync.addEventListener('click', () => {
                this.forceSyncWithServer();
            });
        }

        if (this.elements.conflictResolution) {
            this.elements.conflictResolution.addEventListener('change', (e) => {
                this.conflictResolutionMode = e.target.value;
                this.saveUserPreferences();
            });
        }

        // File handling
        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        this.elements.fileDropZone.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.fileDropZone.classList.add('dragover');
        });

        this.elements.fileDropZone.addEventListener('dragleave', () => {
            this.elements.fileDropZone.classList.remove('dragover');
        });

        this.elements.fileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.fileDropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/json') {
                this.handleFileSelect(file);
            } else {
                this.showNotification('Please select a valid JSON file', 'error');
            }
        });

        // Network status monitoring
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateSyncStatus();
            this.showNotification('Connection restored - syncing data...', 'success');
            this.syncWithServer();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus();
            this.showNotification('Working offline - changes will sync when connection is restored', 'warning');
        });

        // Session and preference management
        window.addEventListener('beforeunload', () => {
            this.saveSessionData();
            this.saveUserPreferences();
            this.stopSync();
        });

        // Keyboard shortcuts for better UX
        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' && e.ctrlKey) {
                e.preventDefault();
                this.showRandomQuote();
            } else if (e.key === 'a' && e.ctrlKey) {
                e.preventDefault();
                this.toggleAddQuoteForm();
            } else if (e.key === 's' && e.ctrlKey) {
                e.preventDefault();
                this.forceSyncWithServer();
            } else if (e.key === 'Escape') {
                this.closeAllForms();
            }
        });
    }

    // Server Synchronization Methods
    initializeServerSync() {
        // Load sync preferences
        const syncEnabled = localStorage.getItem('quoteGenerator_syncEnabled');
        const lastSync = localStorage.getItem('quoteGenerator_lastSync');
        const conflictMode = localStorage.getItem('quoteGenerator_conflictMode');
        
        if (syncEnabled !== 'false') {
            this.startSync();
        }
        
        if (lastSync) {
            this.lastSyncTime = new Date(lastSync);
        }
        
        if (conflictMode) {
            this.conflictResolutionMode = conflictMode;
            if (this.elements.conflictResolution) {
                this.elements.conflictResolution.value = conflictMode;
            }
        }
        
        // Initial sync if online
        if (this.isOnline) {
            setTimeout(() => this.syncWithServer(), 2000);
        }
    }

    startSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        
        this.syncTimer = setInterval(() => {
            if (this.isOnline) {
                this.syncWithServer();
            }
        }, this.syncInterval);
        
        localStorage.setItem('quoteGenerator_syncEnabled', 'true');
        this.updateSyncStatus();
    }

    stopSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
        
        localStorage.setItem('quoteGenerator_syncEnabled', 'false');
        this.updateSyncStatus();
    }

    async syncWithServer() {
        if (!this.isOnline) {
            return;
        }

        try {
            this.updateSyncStatus('syncing');
            
            // Simulate fetching server data
            const serverData = await this.fetchServerQuotes();
            
            // Process server data and handle conflicts
            const syncResult = await this.processServerData(serverData);
            
            // Upload pending local changes
            await this.uploadPendingChanges();
            
            // Update last sync time
            this.lastSyncTime = new Date();
            localStorage.setItem('quoteGenerator_lastSync', this.lastSyncTime.toISOString());
            
            this.updateSyncStatus('synced');
            
            if (syncResult.newQuotes > 0 || syncResult.conflicts > 0) {
                this.showSyncNotification(syncResult);
            }
            
        } catch (error) {
            console.error('Sync error:', error);
            this.updateSyncStatus('error');
            this.showNotification('Sync failed - will retry automatically', 'error');
        }
    }

    async fetchServerQuotes() {
        // Simulate server API call using JSONPlaceholder
        const response = await fetch(`${this.serverUrl}?_limit=10`);
        const posts = await response.json();
        
        // Transform posts into quote format
        const serverQuotes = posts.map(post => ({
            id: `server_${post.id}`,
            text: this.generateQuoteFromPost(post),
            author: `User ${post.userId}`,
            category: this.categorizePost(post),
            serverSync: true,
            lastModified: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time within last day
            serverId: post.id
        }));
        
        return serverQuotes;
    }

    generateQuoteFromPost(post) {
        // Transform post content into quote-like text
        const sentences = post.body.split('.').filter(s => s.trim().length > 10);
        if (sentences.length > 0) {
            let quote = sentences[0].trim();
            if (quote.length > 100) {
                quote = quote.substring(0, 97) + '...';
            }
            return quote.charAt(0).toUpperCase() + quote.slice(1);
        }
        return "Every moment is a fresh beginning.";
    }

    categorizePost(post) {
        const categories = ['Inspiration', 'Wisdom', 'Life', 'Success', 'Motivation', 'Growth'];
        return categories[post.id % categories.length];
    }

    async processServerData(serverQuotes) {
        let newQuotes = 0;
        let conflicts = 0;
        let updated = 0;
        
        for (const serverQuote of serverQuotes) {
            const existingQuote = this.quotes.find(q => q.id === serverQuote.id);
            
            if (!existingQuote) {
                // New quote from server
                this.quotes.push(serverQuote);
                newQuotes++;
            } else {
                // Check for conflicts
                const serverModified = new Date(serverQuote.lastModified);
                const localModified = new Date(existingQuote.lastModified);
                
                if (serverModified > localModified) {
                    if (this.hasConflict(existingQuote, serverQuote)) {
                        conflicts++;
                        await this.handleConflict(existingQuote, serverQuote);
                    } else {
                        // Update without conflict
                        Object.assign(existingQuote, serverQuote);
                        updated++;
                    }
                }
            }
        }
        
        if (newQuotes > 0 || updated > 0) {
            this.saveToLocalStorage();
            this.populateCategories();
            this.updateStats();
        }
        
        return { newQuotes, conflicts, updated };
    }

    hasConflict(localQuote, serverQuote) {
        return (
            localQuote.text !== serverQuote.text ||
            localQuote.author !== serverQuote.author ||
            localQuote.category !== serverQuote.category
        ) && localQuote.isUserAdded;
    }

    async handleConflict(localQuote, serverQuote) {
        const conflict = {
            id: Date.now(),
            local: localQuote,
            server: serverQuote,
            timestamp: new Date().toISOString()
        };
        
        switch (this.conflictResolutionMode) {
            case 'server-wins':
                Object.assign(localQuote, serverQuote);
                this.showNotification(`Conflict resolved: Server version accepted for "${localQuote.text.substring(0, 30)}..."`, 'info');
                break;
                
            case 'local-wins':
                // Keep local version, but mark as needs server update
                localQuote.needsServerUpdate = true;
                this.syncQueue.push(localQuote);
                this.showNotification(`Conflict resolved: Local version kept for "${localQuote.text.substring(0, 30)}..."`, 'info');
                break;
                
            case 'manual':
                this.pendingConflicts.push(conflict);
                this.showConflictDialog(conflict);
                break;
        }
    }

    showConflictDialog(conflict) {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        dialog.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h3 class="text-xl font-bold mb-4 text-gray-800">Data Conflict Detected</h3>
                <p class="text-gray-600 mb-6">The same quote has been modified both locally and on the server. Choose which version to keep:</p>
                
                <div class="grid md:grid-cols-2 gap-4 mb-6">
                    <div class="border rounded-lg p-4">
                        <h4 class="font-semibold text-blue-600 mb-2">Local Version</h4>
                        <blockquote class="text-sm mb-2">"${conflict.local.text}"</blockquote>
                        <p class="text-xs text-gray-500">— ${conflict.local.author} (${conflict.local.category})</p>
                        <p class="text-xs text-gray-400 mt-2">Modified: ${new Date(conflict.local.lastModified).toLocaleString()}</p>
                    </div>
                    
                    <div class="border rounded-lg p-4">
                        <h4 class="font-semibold text-green-600 mb-2">Server Version</h4>
                        <blockquote class="text-sm mb-2">"${conflict.server.text}"</blockquote>
                        <p class="text-xs text-gray-500">— ${conflict.server.author} (${conflict.server.category})</p>
                        <p class="text-xs text-gray-400 mt-2">Modified: ${new Date(conflict.server.lastModified).toLocaleString()}</p>
                    </div>
                </div>
                
                <div class="flex gap-3 justify-end">
                    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onclick="this.closest('.fixed').remove(); window.quoteApp.resolveConflict('${conflict.id}', 'local')">
                        Keep Local
                    </button>
                    <button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600" onclick="this.closest('.fixed').remove(); window.quoteApp.resolveConflict('${conflict.id}', 'server')">
                        Keep Server
                    </button>
                    <button class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600" onclick="this.closest('.fixed').remove(); window.quoteApp.resolveConflict('${conflict.id}', 'merge')">
                        Merge Both
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        window.quoteApp = this; // Temporary global reference for dialog buttons
    }

    resolveConflict(conflictId, resolution) {
        const conflict = this.pendingConflicts.find(c => c.id == conflictId);
        if (!conflict) return;
        
        const localQuote = this.quotes.find(q => q.id === conflict.local.id);
        if (!localQuote) return;
        
        switch (resolution) {
            case 'local':
                localQuote.needsServerUpdate = true;
                this.syncQueue.push(localQuote);
                this.showNotification('Local version kept - will sync to server', 'success');
                break;
                
            case 'server':
                Object.assign(localQuote, conflict.server);
                this.showNotification('Server version accepted', 'success');
                break;
                
            case 'merge':
                // Create a merged version
                const mergedQuote = {
                    ...conflict.server,
                    text: `${conflict.local.text} ${conflict.server.text}`,
                    lastModified: new Date().toISOString(),
                    needsServerUpdate: true
                };
                Object.assign(localQuote, mergedQuote);
                this.syncQueue.push(localQuote);
                this.showNotification('Versions merged - will sync to server', 'success');
                break;
        }
        
        this.pendingConflicts = this.pendingConflicts.filter(c => c.id !== conflictId);
        this.saveToLocalStorage();
        this.populateCategories();
        this.updateStats();
    }

    async uploadPendingChanges() {
        if (this.syncQueue.length === 0) return;
        
        for (const quote of this.syncQueue) {
            try {
                // Simulate uploading to server
                await this.uploadQuoteToServer(quote);
                quote.needsServerUpdate = false;
            } catch (error) {
                console.error('Failed to upload quote:', error);
                // Keep in queue for retry
            }
        }
        
        // Remove successfully uploaded quotes
        this.syncQueue = this.syncQueue.filter(q => q.needsServerUpdate);
    }

    async uploadQuoteToServer(quote) {
        // Simulate server upload
        const response = await fetch(this.serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: quote.text.substring(0, 50),
                body: `${quote.text} - ${quote.author}`,
                userId: 1
            })
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        return response.json();
    }

    forceSyncWithServer() {
        if (!this.isOnline) {
            this.showNotification('Cannot sync while offline', 'error');
            return;
        }
        
        this.showNotification('Forcing sync with server...', 'info');
        this.syncWithServer();
    }

    toggleSyncStatus() {
        if (this.syncTimer) {
            this.stopSync();
            this.showNotification('Auto-sync disabled', 'info');
        } else {
            this.startSync();
            this.showNotification('Auto-sync enabled', 'success');
        }
    }

    updateSyncStatus(status = null) {
        if (!this.elements.syncStatusBtn) return;
        
        let statusText = '';
        let statusClass = '';
        
        if (!this.isOnline) {
            statusText = 'Offline';
            statusClass = 'bg-red-500';
        } else if (status === 'syncing') {
            statusText = 'Syncing...';
            statusClass = 'bg-yellow-500 pulse-animation';
        } else if (status === 'synced') {
            statusText = 'Synced';
            statusClass = 'bg-green-500';
        } else if (status === 'error') {
            statusText = 'Sync Error';
            statusClass = 'bg-red-500';
        } else if (this.syncTimer) {
            statusText = 'Auto-sync On';
            statusClass = 'bg-blue-500';
        } else {
            statusText = 'Auto-sync Off';
            statusClass = 'bg-gray-500';
        }
        
        this.elements.syncStatusBtn.innerHTML = `
            <div class="w-3 h-3 rounded-full ${statusClass} mr-2"></div>
            ${statusText}
        `;
        
        // Update last sync time display
        if (this.lastSyncTime) {
            const timeAgo = this.getTimeAgo(this.lastSyncTime);
            this.elements.syncStatusBtn.title = `Last sync: ${timeAgo}`;
        }
    }

    showSyncNotification(syncResult) {
        let message = '';
        
        if (syncResult.newQuotes > 0) {
            message += `${syncResult.newQuotes} new quotes received`;
        }
        
        if (syncResult.conflicts > 0) {
            if (message) message += ', ';
            message += `${syncResult.conflicts} conflicts resolved`;
        }
        
        if (syncResult.updated > 0) {
            if (message) message += ', ';
            message += `${syncResult.updated} quotes updated`;
        }
        
        if (message) {
            this.showNotification(`Sync complete: ${message}`, 'success');
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    // Enhanced Category Management
    populateCategories() {
        const categories = this.extractUniqueCategories();
        this.updateCategoryPreferences(categories);
        this.renderCategoryFilters();
        this.populateExistingCategories();
    }

    extractUniqueCategories() {
        const categorySet = new Set();
        
        // Add all categories from quotes
        this.quotes.forEach(quote => {
            if (quote.category && quote.category.trim()) {
                categorySet.add(quote.category.trim());
            }
        });
        
        // Sort categories alphabetically
        const sortedCategories = Array.from(categorySet).sort();
        
        // Return with 'All' at the beginning
        return ['All', ...sortedCategories];
    }

    updateCategoryPreferences(categories) {
        // Track category usage and preferences
        categories.forEach(category => {
            if (!this.categoryPreferences[category]) {
                this.categoryPreferences[category] = {
                    timesSelected: 0,
                    lastSelected: null,
                    quotesViewed: 0,
                    isUserCreated: this.isUserCreatedCategory(category)
                };
            }
        });
    }

    isUserCreatedCategory(category) {
        if (category === 'All') return false;
        
        // Check if category exists in default quotes
        const existsInDefaults = this.defaultQuotes.some(quote => 
            quote.category === category
        );
        
        return !existsInDefaults;
    }

    renderCategoryFilters() {
        const categories = this.extractUniqueCategories();
        
        this.elements.categoryFilters.innerHTML = categories.map(category => {
            const isActive = category === this.currentCategory ? 'active' : '';
            const preference = this.categoryPreferences[category] || {};
            const isUserCreated = preference.isUserCreated;
            const quotesCount = this.getQuotesByCategory(category).length;
            
            return `
                <button 
                    class="category-pill px-6 py-2 rounded-full bg-white/20 text-white font-medium ${isActive} ${isUserCreated ? 'user-created' : ''}"
                    data-category="${category}"
                    title="${category === 'All' ? 'All categories' : `${quotesCount} quotes in ${category}`}"
                >
                    ${category}
                    ${quotesCount > 0 && category !== 'All' ? `<span class="ml-2 text-xs opacity-75">(${quotesCount})</span>` : ''}
                    ${isUserCreated ? '<span class="ml-1 text-xs">✨</span>' : ''}
                </button>
            `;
        }).join('');

        // Add event listeners to category buttons
        this.elements.categoryFilters.querySelectorAll('.category-pill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterQuotes(category);
            });
        });
    }

    filterQuotes(category) {
        // Update filter history
        this.filterHistory.push({
            category: this.currentCategory,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 filter actions
        if (this.filterHistory.length > 10) {
            this.filterHistory = this.filterHistory.slice(-10);
        }
        
        // Update current category
        this.currentCategory = category;
        
        // Update category preferences
        if (this.categoryPreferences[category]) {
            this.categoryPreferences[category].timesSelected++;
            this.categoryPreferences[category].lastSelected = new Date().toISOString();
        }
        
        // Re-render filters to show active state
        this.renderCategoryFilters();
        
        // Show a quote from the selected category
        this.showRandomQuote();
        
        // Save preferences
        this.saveUserPreferences();
        
        // Show filter feedback
        const quotesCount = this.getQuotesByCategory(category).length;
        if (category === 'All') {
            this.showNotification(`Showing all ${quotesCount} quotes`, 'info');
        } else {
            this.showNotification(`Filtered to ${category}: ${quotesCount} quotes`, 'info');
        }
    }

    getQuotesByCategory(category) {
        if (category === 'All') {
            return this.quotes;
        }
        return this.quotes.filter(quote => quote.category === category);
    }

    getFilteredQuotes() {
        return this.getQuotesByCategory(this.currentCategory);
    }

    // Enhanced Quote Display
    showRandomQuote() {
        const filteredQuotes = this.getFilteredQuotes();
        
        if (filteredQuotes.length === 0) {
            this.displayQuote({
                text: "No quotes found in this category. Try adding some or select a different category!",
                author: "Quote Generator",
                category: this.currentCategory
            });
            return;
        }

        // Avoid showing the same quote twice in a row if possible
        let availableQuotes = filteredQuotes;
        if (this.lastDisplayedQuote && filteredQuotes.length > 1) {
            availableQuotes = filteredQuotes.filter(quote => 
                quote.text !== this.lastDisplayedQuote.text || 
                quote.author !== this.lastDisplayedQuote.author
            );
            
            // If filtering removed all quotes, use the full set
            if (availableQuotes.length === 0) {
                availableQuotes = filteredQuotes;
            }
        }

        const randomIndex = Math.floor(Math.random() * availableQuotes.length);
        const selectedQuote = availableQuotes[randomIndex];
        
        this.displayQuote(selectedQuote);
        
        // Update session and preference data
        this.sessionQuotesViewed++;
        this.lastDisplayedQuote = selectedQuote;
        
        if (this.categoryPreferences[selectedQuote.category]) {
            this.categoryPreferences[selectedQuote.category].quotesViewed++;
        }
        
        this.updateStats();
    }

    displayQuote(quote) {
        this.elements.quoteContainer.classList.add('hidden');
        
        setTimeout(() => {
            this.elements.quoteText.textContent = `"${quote.text}"`;
            this.elements.quoteAuthor.textContent = `— ${quote.author}`;
            this.elements.quoteCategory.textContent = quote.category;
            
            // Add visual indicators
            let indicators = '';
            if (quote.isUserAdded) {
                indicators += ' <span title="Your quote">✨</span>';
            }
            if (quote.serverSync) {
                indicators += ' <span title="Synced with server">🔄</span>';
            }
            if (quote.needsServerUpdate) {
                indicators += ' <span title="Pending server sync">⏳</span>';
            }
            
            this.elements.quoteCategory.innerHTML = quote.category + indicators;
            
            this.elements.quoteContainer.classList.remove('hidden');
        }, 150);
    }

    // Enhanced Quote Addition
    addNewQuote() {
        const quoteText = this.elements.quoteInput.value.trim();
        const author = this.elements.authorInput.value.trim();
        const category = this.elements.categoryInput.value.trim();

        if (!quoteText || !author || !category) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Validate quote length
        if (quoteText.length < 10) {
            this.showNotification('Quote text should be at least 10 characters long', 'error');
            return;
        }

        if (quoteText.length > 500) {
            this.showNotification('Quote text should be less than 500 characters', 'error');
            return;
        }

        // Check for duplicates
        const isDuplicate = this.quotes.some(quote => 
            quote.text.toLowerCase() === quoteText.toLowerCase() &&
            quote.author.toLowerCase() === author.toLowerCase()
        );

        if (isDuplicate) {
            this.showNotification('This quote already exists in your collection', 'error');
            return;
        }

        const newQuote = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: quoteText,
            author: author,
            category: category,
            isUserAdded: true,
            dateAdded: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            needsServerUpdate: true
        };

        this.quotes.push(newQuote);
        this.userQuotesCount++;
        
        // Add to sync queue if online
        if (this.isOnline) {
            this.syncQueue.push(newQuote);
        }
        
        // Check if this is a new category
        const wasNewCategory = !this.categoryPreferences[category];
        
        // Update categories and preferences
        this.populateCategories();
        
        // If new category was added, show notification
        if (wasNewCategory) {
            this.showNotification(`New category "${category}" created!`, 'success');
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Update UI
        this.updateStats();
        
        // Switch to the new quote's category and show it
        this.filterQuotes(category);
        this.displayQuote(newQuote);
        
        // Reset form and close
        this.elements.quoteForm.reset();
        this.toggleAddQuoteForm();
        
        this.showNotification('Quote added successfully! Will sync to server when online.', 'success');
    }

    populateExistingCategories() {
        const categories = this.extractUniqueCategories()
            .filter(cat => cat !== 'All')
            .sort();
        
        // Group categories by user-created vs default
        const defaultCategories = categories.filter(cat => !this.isUserCreatedCategory(cat));
        const userCategories = categories.filter(cat => this.isUserCreatedCategory(cat));
        
        let optionsHTML = '<option value="">Select existing category</option>';
        
        if (defaultCategories.length > 0) {
            optionsHTML += '<optgroup label="Default Categories">';
            defaultCategories.forEach(category => {
                const count = this.getQuotesByCategory(category).length;
                optionsHTML += `<option value="${category}">${category} (${count})</option>`;
            });
            optionsHTML += '</optgroup>';
        }
        
        if (userCategories.length > 0) {
            optionsHTML += '<optgroup label="Your Categories">';
            userCategories.forEach(category => {
                const count = this.getQuotesByCategory(category).length;
                optionsHTML += `<option value="${category}">${category} (${count}) ✨</option>`;
            });
            optionsHTML += '</optgroup>';
        }
        
        this.elements.existingCategories.innerHTML = optionsHTML;
    }

    // Enhanced Storage Management
    loadStoredData() {
        try {
            // Load quotes
            const storedQuotes = localStorage.getItem('quoteGenerator_quotes');
            const storedUserCount = localStorage.getItem('quoteGenerator_userCount');
            
            if (storedQuotes) {
                const parsedQuotes = JSON.parse(storedQuotes);
                this.quotes = [...this.defaultQuotes, ...parsedQuotes];
                this.userQuotesCount = storedUserCount ? parseInt(storedUserCount) : parsedQuotes.length;
            } else {
                this.quotes = [...this.defaultQuotes];
            }
            
            // Load sync queue
            const syncQueue = localStorage.getItem('quoteGenerator_syncQueue');
            if (syncQueue) {
                this.syncQueue = JSON.parse(syncQueue);
            }
            
            // Load user preferences
            this.loadUserPreferences();
            
            // Update UI after loading
            this.populateCategories();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading stored data:', error);
            this.quotes = [...this.defaultQuotes];
            this.showNotification('Error loading saved data. Using defaults.', 'error');
        }
    }

    saveToLocalStorage() {
        try {
            const userQuotes = this.quotes.filter(quote => quote.isUserAdded);
            localStorage.setItem('quoteGenerator_quotes', JSON.stringify(userQuotes));
            localStorage.setItem('quoteGenerator_userCount', this.userQuotesCount.toString());
            localStorage.setItem('quoteGenerator_lastSaved', new Date().toISOString());
            localStorage.setItem('quoteGenerator_syncQueue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Error saving data locally', 'error');
        }
    }

    loadUserPreferences() {
        try {
            // Load category preferences
            const storedPreferences = localStorage.getItem('quoteGenerator_categoryPreferences');
            if (storedPreferences) {
                this.categoryPreferences = JSON.parse(storedPreferences);
            }
            
            // Load last selected category
            const lastCategory = localStorage.getItem('quoteGenerator_lastCategory');
            if (lastCategory && this.extractUniqueCategories().includes(lastCategory)) {
                this.currentCategory = lastCategory;
            }
            
            // Load filter history
            const filterHistory = localStorage.getItem('quoteGenerator_filterHistory');
            if (filterHistory) {
                this.filterHistory = JSON.parse(filterHistory);
            }
            
            // Load conflict resolution mode
            const conflictMode = localStorage.getItem('quoteGenerator_conflictMode');
            if (conflictMode) {
                this.conflictResolutionMode = conflictMode;
            }
            
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    }

    saveUserPreferences() {
        try {
            localStorage.setItem('quoteGenerator_categoryPreferences', JSON.stringify(this.categoryPreferences));
            localStorage.setItem('quoteGenerator_lastCategory', this.currentCategory);
            localStorage.setItem('quoteGenerator_filterHistory', JSON.stringify(this.filterHistory));
            localStorage.setItem('quoteGenerator_conflictMode', this.conflictResolutionMode);
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    }

    loadSessionData() {
        try {
            const sessionViews = sessionStorage.getItem('quoteGenerator_sessionViews');
            const lastQuote = sessionStorage.getItem('quoteGenerator_lastQuote');
            
            if (sessionViews) {
                this.sessionQuotesViewed = parseInt(sessionViews);
            }
            
            if (lastQuote) {
                this.lastDisplayedQuote = JSON.parse(lastQuote);
            }
            
            this.updateStats();
        } catch (error) {
            console.error('Error loading session data:', error);
        }
    }

    saveSessionData() {
        try {
            sessionStorage.setItem('quoteGenerator_sessionViews', this.sessionQuotesViewed.toString());
            if (this.lastDisplayedQuote) {
                sessionStorage.setItem('quoteGenerator_lastQuote', JSON.stringify(this.lastDisplayedQuote));
            }
        } catch (error) {
            console.error('Error saving session data:', error);
        }
    }

    // Enhanced Export/Import with Sync Data
    exportQuotes(type = 'all') {
        try {
            let quotesToExport;
            let filename;
            
            if (type === 'user') {
                quotesToExport = this.quotes.filter(quote => quote.isUserAdded);
                filename = 'my-quotes.json';
                
                if (quotesToExport.length === 0) {
                    this.showNotification('No user quotes to export', 'error');
                    return;
                }
            } else {
                quotesToExport = this.quotes;
                filename = 'all-quotes.json';
            }
            
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '3.0',
                totalQuotes: quotesToExport.length,
                categories: this.extractUniqueCategories().filter(cat => cat !== 'All'),
                categoryPreferences: type === 'all' ? this.categoryPreferences : {},
                filterHistory: type === 'all' ? this.filterHistory : [],
                syncData: {
                    lastSyncTime: this.lastSyncTime?.toISOString(),
                    conflictResolutionMode: this.conflictResolutionMode,
                    pendingSyncCount: this.syncQueue.length
                },
                quotes: quotesToExport.map(quote => ({
                    id: quote.id,
                    text: quote.text,
                    author: quote.author,
                    category: quote.category,
                    isUserAdded: quote.isUserAdded || false,
                    dateAdded: quote.dateAdded || new Date().toISOString(),
                    lastModified: quote.lastModified || new Date().toISOString(),
                    serverSync: quote.serverSync || false,
                    needsServerUpdate: quote.needsServerUpdate || false
                }))
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification(`Successfully exported ${quotesToExport.length} quotes with sync data`, 'success');
            
        } catch (error) {
            console.error('Error exporting quotes:', error);
            this.showNotification('Error exporting quotes', 'error');
        }
    }

    handleFileSelect(file) {
        if (!file) return;
        
        if (file.type !== 'application/json') {
            this.showNotification('Please select a valid JSON file', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                this.importQuotes(importData);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                this.showNotification('Invalid JSON file format', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showNotification('Error reading file', 'error');
        };
        
        reader.readAsText(file);
    }

    importQuotes(importData) {
        try {
            let quotesToImport = [];
            
            // Handle different import formats
            if (Array.isArray(importData)) {
                quotesToImport = importData;
            } else if (importData.quotes && Array.isArray(importData.quotes)) {
                quotesToImport = importData.quotes;
                
                // Import category preferences if available
                if (importData.categoryPreferences) {
                    Object.assign(this.categoryPreferences, importData.categoryPreferences);
                }
                
                // Import sync data if available
                if (importData.syncData) {
                    if (importData.syncData.conflictResolutionMode) {
                        this.conflictResolutionMode = importData.syncData.conflictResolutionMode;
                    }
                }
            } else {
                throw new Error('Invalid data structure');
            }
            
            // Validate and process quotes
            const validQuotes = quotesToImport.filter(quote => {
                return quote.text && quote.author && quote.category &&
                       typeof quote.text === 'string' &&
                       typeof quote.author === 'string' &&
                       typeof quote.category === 'string';
            });
            
            if (validQuotes.length === 0) {
                this.showNotification('No valid quotes found in file', 'error');
                return;
            }
            
            // Check for duplicates and add new quotes
            let newQuotes = 0;
            let duplicates = 0;
            let newCategories = [];
            
            validQuotes.forEach(importQuote => {
                const isDuplicate = this.quotes.some(existingQuote => 
                    existingQuote.text.toLowerCase() === importQuote.text.toLowerCase() &&
                    existingQuote.author.toLowerCase() === importQuote.author.toLowerCase()
                );
                
                if (!isDuplicate) {
                    // Check if this creates a new category
                    if (!this.extractUniqueCategories().includes(importQuote.category)) {
                        newCategories.push(importQuote.category);
                    }
                    
                    const newQuote = {
                        id: importQuote.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        text: importQuote.text,
                        author: importQuote.author,
                        category: importQuote.category,
                        isUserAdded: true,
                        dateAdded: importQuote.dateAdded || new Date().toISOString(),
                        lastModified: importQuote.lastModified || new Date().toISOString(),
                        serverSync: importQuote.serverSync || false,
                        needsServerUpdate: !importQuote.serverSync
                    };
                    
                    this.quotes.push(newQuote);
                    this.userQuotesCount++;
                    newQuotes++;
                    
                    // Add to sync queue if needs server update
                    if (newQuote.needsServerUpdate && this.isOnline) {
                        this.syncQueue.push(newQuote);
                    }
                } else {
                    duplicates++;
                }
            });
            
            // Save and update UI
            this.saveToLocalStorage();
            this.saveUserPreferences();
            this.populateCategories();
            this.updateStats();
            
            // Show results
            let message = `Successfully imported ${newQuotes} new quotes`;
            if (newCategories.length > 0) {
                message += ` and ${newCategories.length} new categories`;
            }
            if (duplicates > 0) {
                message += ` (${duplicates} duplicates skipped)`;
            }
            
            this.showNotification(message, 'success');
            this.elements.fileInput.value = '';
            
            // If new categories were added, show them
            if (newCategories.length > 0) {
                setTimeout(() => {
                    this.showNotification(`New categories: ${newCategories.join(', ')}`, 'info');
                }, 2000);
            }
            
            // Trigger sync if online
            if (this.isOnline && this.syncQueue.length > 0) {
                setTimeout(() => this.syncWithServer(), 1000);
            }
            
        } catch (error) {
            console.error('Error importing quotes:', error);
            this.showNotification('Error importing quotes. Please check file format.', 'error');
        }
    }

    // Enhanced Data Management
    clearUserData() {
        if (confirm('Are you sure you want to clear all your added quotes and preferences? This action cannot be undone.')) {
            try {
                this.quotes = this.quotes.filter(quote => !quote.isUserAdded);
                this.userQuotesCount = 0;
                this.categoryPreferences = {};
                this.filterHistory = [];
                this.currentCategory = 'All';
                this.syncQueue = [];
                this.pendingConflicts = [];
                
                localStorage.removeItem('quoteGenerator_quotes');
                localStorage.removeItem('quoteGenerator_userCount');
                localStorage.removeItem('quoteGenerator_categoryPreferences');
                localStorage.removeItem('quoteGenerator_lastCategory');
                localStorage.removeItem('quoteGenerator_filterHistory');
                localStorage.removeItem('quoteGenerator_syncQueue');
                
                this.populateCategories();
                this.updateStats();
                this.showRandomQuote();
                
                this.showNotification('User data and preferences cleared successfully', 'success');
            } catch (error) {
                console.error('Error clearing user data:', error);
                this.showNotification('Error clearing user data', 'error');
            }
        }
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset everything to defaults? This will clear all data including session history, preferences, and sync data.')) {
            try {
                // Clear all storage
                localStorage.clear();
                sessionStorage.clear();
                
                // Reset to defaults
                this.quotes = [...this.defaultQuotes];
                this.userQuotesCount = 0;
                this.sessionQuotesViewed = 0;
                this.lastDisplayedQuote = null;
                this.currentCategory = 'All';
                this.categoryPreferences = {};
                this.filterHistory = [];
                this.syncQueue = [];
                this.pendingConflicts = [];
                this.lastSyncTime = null;
                
                // Restart sync
                this.stopSync();
                this.startSync();
                
                // Update UI
                this.populateCategories();
                this.updateStats();
                this.showRandomQuote();
                this.updateSyncStatus();
                
                this.showNotification('All data reset to defaults', 'success');
            } catch (error) {
                console.error('Error resetting data:', error);
                this.showNotification('Error resetting data', 'error');
            }
        }
    }

    // UI Helper Methods
    toggleAddQuoteForm() {
        const section = this.elements.addQuoteSection;
        const isOpen = section.classList.contains('open');
        
        if (isOpen) {
            section.classList.remove('open');
            this.elements.addQuoteBtn.innerHTML = '<i data-lucide="plus" class="mr-2"></i>Add Quote<span class="shortcut-hint">(Ctrl+A)</span>';
        } else {
            section.classList.add('open');
            this.elements.addQuoteBtn.innerHTML = '<i data-lucide="x" class="mr-2"></i>Cancel';
            this.elements.quoteInput.focus();
            
            // Close data management if open
            if (this.elements.dataManagementSection.classList.contains('open')) {
                this.toggleDataManagement();
            }
        }
        
        setTimeout(() => lucide.createIcons(), 100);
    }

    toggleDataManagement() {
        const section = this.elements.dataManagementSection;
        const isOpen = section.classList.contains('open');
        
        if (isOpen) {
            section.classList.remove('open');
            this.elements.manageDataBtn.innerHTML = '<i data-lucide="database" class="mr-2"></i>Manage Data';
        } else {
            section.classList.add('open');
            this.elements.manageDataBtn.innerHTML = '<i data-lucide="x" class="mr-2"></i>Close';
            
            // Close add quote form if open
            if (this.elements.addQuoteSection.classList.contains('open')) {
                this.toggleAddQuoteForm();
            }
        }
        
        setTimeout(() => lucide.createIcons(), 100);
    }

    closeAllForms() {
        if (this.elements.addQuoteSection.classList.contains('open')) {
            this.toggleAddQuoteForm();
        }
        if (this.elements.dataManagementSection.classList.contains('open')) {
            this.toggleDataManagement();
        }
    }

    updateStats() {
        this.elements.totalQuotes.textContent = this.quotes.length;
        this.elements.totalCategories.textContent = this.extractUniqueCategories().length - 1; // Exclude 'All'
        this.elements.userQuotes.textContent = this.userQuotesCount;
        this.elements.sessionQuotes.textContent = this.sessionQuotesViewed;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-xl text-white font-medium z-50 transition-all duration-300 transform translate-x-full max-w-sm notification`;
        
        if (type === 'success') {
            notification.className += ' bg-green-500';
        } else if (type === 'error') {
            notification.className += ' bg-red-500';
        } else if (type === 'warning') {
            notification.className += ' bg-orange-500';
        } else {
            notification.className += ' bg-blue-500';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuoteGenerator();
});
