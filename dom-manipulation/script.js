// Enhanced Quote Generator Application with Server Synchronization
class QuoteGenerator {
    constructor() {
        // Default quotes collection with diverse categories
        this.defaultQuotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation" },
            { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon", category: "Life" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Dreams" },
            { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "Success" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Success" },
            { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "Motivation" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Persistence" },
            { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", category: "Mindset" },
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Action" },
            { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Innovation" },
            { text: "Your limitation—it's only your imagination.", author: "Unknown", category: "Dreams" },
            { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", category: "Life" },
            { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "Action" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Confidence" },
            { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Persistence" },
            { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "Courage" },
            { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "Resilience" },
            { text: "The mind is everything. What you think you become.", author: "Buddha", category: "Mindset" },
            { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", category: "Opportunity" },
            { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein", category: "Purpose" }
        ];
        
        this.quotes = [];
        this.currentCategory = 'All';
        this.userQuotesCount = 0;
        this.sessionQuotesViewed = 0;
        this.lastDisplayedQuote = null;
        this.categoryPreferences = {};
        this.filterHistory = [];
        
        // Server sync properties
        this.serverQuotes = [];
        this.syncQueue = [];
        this.conflictQueue = [];
        this.lastSyncTime = null;
        this.syncInterval = null;
        this.isOnline = navigator.onLine;
        this.conflictResolutionMode = 'server-wins'; // 'server-wins', 'local-wins', 'manual'
        this.syncStatus = 'connecting'; // 'connecting', 'synced', 'syncing', 'error', 'offline'
        
        // Mock API configuration
        this.apiConfig = {
            baseUrl: 'https://jsonplaceholder.typicode.com',
            endpoints: {
                posts: '/posts',
                users: '/users'
            },
            maxQuotes: 50 // Limit server quotes for better performance
        };
        
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
            syncQueueCount: document.getElementById('sync-queue-count'),
            exportAllBtn: document.getElementById('export-all-btn'),
            exportUserBtn: document.getElementById('export-user-btn'),
            fileDropZone: document.getElementById('file-drop-zone'),
            fileInput: document.getElementById('file-input'),
            clearUserDataBtn: document.getElementById('clear-user-data-btn'),
            resetAllBtn: document.getElementById('reset-all-btn'),
            syncStatusBtn: document.getElementById('sync-status-btn'),
            forceSyncBtn: document.getElementById('force-sync-btn'),
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
        this.elements.syncStatusBtn.addEventListener('click', () => {
            this.showSyncDetails();
        });

        this.elements.forceSyncBtn.addEventListener('click', () => {
            this.forceSyncWithServer();
        });

        this.elements.conflictResolution.addEventListener('change', (e) => {
            this.conflictResolutionMode = e.target.value;
            this.saveUserPreferences();
        });

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
            this.syncWithServer();
            this.showNotification('Connection restored - syncing data...', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus();
            this.showNotification('Working offline - changes will sync when connection is restored', 'info');
        });

        // Session and preference management
        window.addEventListener('beforeunload', () => {
            this.saveSessionData();
            this.saveUserPreferences();
            this.saveSyncData();
        });

        // Enhanced keyboard shortcuts
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

    // ===== SERVER SYNCHRONIZATION METHODS =====

    async initializeServerSync() {
        try {
            this.loadSyncData();
            
            // Initial server fetch
            await this.fetchQuotesFromServer();
            
            // Start periodic sync
            this.startPeriodicSync();
            
            // Process any pending sync queue
            if (this.isOnline && this.syncQueue.length > 0) {
                await this.processSyncQueue();
            }
            
            this.updateSyncStatus();
            
        } catch (error) {
            console.error('Error initializing server sync:', error);
            this.syncStatus = 'error';
            this.updateSyncStatus();
        }
    }

    async fetchQuotesFromServer() {
        if (!this.isOnline) {
            this.syncStatus = 'offline';
            return;
        }

        try {
            this.syncStatus = 'syncing';
            this.updateSyncStatus();

            // Fetch posts and users from JSONPlaceholder
            const [postsResponse, usersResponse] = await Promise.all([
                fetch(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.posts}`),
                fetch(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.users}`)
            ]);

            if (!postsResponse.ok || !usersResponse.ok) {
                throw new Error('Failed to fetch data from server');
            }

            const posts = await postsResponse.json();
            const users = await usersResponse.json();

            // Transform posts into meaningful quotes
            const serverQuotes = this.transformPostsToQuotes(posts.slice(0, this.apiConfig.maxQuotes), users);
            
            // Check for new quotes from server
            const newServerQuotes = this.identifyNewServerQuotes(serverQuotes);
            
            if (newServerQuotes.length > 0) {
                // Add new server quotes to collection
                this.serverQuotes = serverQuotes;
                this.quotes = [...this.quotes, ...newServerQuotes];
                
                // Update UI
                this.populateCategories();
                this.updateStats();
                
                // Save updated data
                this.saveToLocalStorage();
                this.saveSyncData();
                
                this.showNotification(`Received ${newServerQuotes.length} new quotes from server`, 'success');
            }

            this.lastSyncTime = new Date().toISOString();
            this.syncStatus = 'synced';
            
        } catch (error) {
            console.error('Error fetching quotes from server:', error);
            this.syncStatus = 'error';
            this.showNotification('Failed to sync with server', 'error');
        } finally {
            this.updateSyncStatus();
        }
    }

    transformPostsToQuotes(posts, users) {
        const categories = ['Inspiration', 'Wisdom', 'Success', 'Life', 'Motivation', 'Philosophy', 'Growth', 'Leadership'];
        const quoteTemplates = [
            'The key to success is understanding that {title}',
            'Remember that {title}',
            'Life teaches us that {title}',
            'True wisdom comes from knowing that {title}',
            'The path forward requires us to understand that {title}',
            'Experience shows us that {title}',
            'Growth happens when we realize that {title}',
            'Leadership means understanding that {title}'
        ];

        return posts.map((post, index) => {
            const user = users[index % users.length];
            const template = quoteTemplates[index % quoteTemplates.length];
            const category = categories[index % categories.length];
            
            // Create meaningful quote text from post title
            let quoteText = template.replace('{title}', post.title.toLowerCase());
            quoteText = quoteText.charAt(0).toUpperCase() + quoteText.slice(1);
            
            // Ensure proper punctuation
            if (!quoteText.endsWith('.') && !quoteText.endsWith('!') && !quoteText.endsWith('?')) {
                quoteText += '.';
            }

            return {
                id: `server_${post.id}`,
                text: quoteText,
                author: user.name,
                category: category,
                isServerQuote: true,
                serverTimestamp: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
        });
    }

    identifyNewServerQuotes(serverQuotes) {
        const existingServerIds = new Set(
            this.quotes
                .filter(quote => quote.isServerQuote)
                .map(quote => quote.id)
        );

        return serverQuotes.filter(quote => !existingServerIds.has(quote.id));
    }

    async syncWithServer() {
        if (!this.isOnline) {
            this.syncStatus = 'offline';
            this.updateSyncStatus();
            return;
        }

        try {
            // Fetch latest from server
            await this.fetchQuotesFromServer();
            
            // Process sync queue (upload local changes)
            if (this.syncQueue.length > 0) {
                await this.processSyncQueue();
            }
            
            // Handle any conflicts
            if (this.conflictQueue.length > 0) {
                await this.handleConflicts();
            }
            
        } catch (error) {
            console.error('Error during sync:', error);
            this.syncStatus = 'error';
            this.updateSyncStatus();
        }
    }

    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;

        const processedItems = [];
        
        for (const item of this.syncQueue) {
            try {
                await this.uploadQuoteToServer(item);
                processedItems.push(item);
            } catch (error) {
                console.error('Error uploading quote:', error);
                // Keep failed items in queue for retry
            }
        }
        
        // Remove successfully processed items
        this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item));
        
        if (processedItems.length > 0) {
            this.saveSyncData();
            this.updateStats();
            this.showNotification(`Synced ${processedItems.length} quotes to server`, 'success');
        }
    }

    async uploadQuoteToServer(quote) {
        // Simulate server upload using JSONPlaceholder POST
        const response = await fetch(`${this.apiConfig.baseUrl}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: quote.text.substring(0, 50) + '...',
                body: `${quote.text} - ${quote.author}`,
                userId: 1
            })
        });

        if (!response.ok) {
            throw new Error('Failed to upload quote to server');
        }

        const result = await response.json();
        
        // Mark quote as synced
        quote.serverSynced = true;
        quote.serverId = result.id;
        quote.lastSynced = new Date().toISOString();
        
        return result;
    }

    async handleConflicts() {
        if (this.conflictQueue.length === 0) return;

        for (const conflict of this.conflictQueue) {
            switch (this.conflictResolutionMode) {
                case 'server-wins':
                    this.resolveConflictServerWins(conflict);
                    break;
                case 'local-wins':
                    this.resolveConflictLocalWins(conflict);
                    break;
                case 'manual':
                    await this.showConflictDialog(conflict);
                    break;
            }
        }
        
        this.conflictQueue = [];
        this.saveSyncData();
    }

    resolveConflictServerWins(conflict) {
        const localIndex = this.quotes.findIndex(q => q.id === conflict.localQuote.id);
        if (localIndex !== -1) {
            this.quotes[localIndex] = { ...conflict.serverQuote };
            this.showNotification(`Conflict resolved: Server version kept for "${conflict.serverQuote.text.substring(0, 30)}..."`, 'info');
        }
    }

    resolveConflictLocalWins(conflict) {
        // Add local quote to sync queue to overwrite server
        this.syncQueue.push(conflict.localQuote);
        this.showNotification(`Conflict resolved: Local version kept for "${conflict.localQuote.text.substring(0, 30)}..."`, 'info');
    }

    async showConflictDialog(conflict) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
            dialog.innerHTML = `
                <div class="conflict-dialog max-w-2xl w-full rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <i data-lucide="alert-triangle" class="mr-3 text-orange-500"></i>
                        Conflict Resolution Required
                    </h3>
                    
                    <p class="text-gray-600 mb-6">
                        The same quote has been modified both locally and on the server. Please choose which version to keep:
                    </p>
                    
                    <div class="grid md:grid-cols-2 gap-6 mb-8">
                        <div class="conflict-option p-6 rounded-xl bg-blue-50 cursor-pointer" data-choice="local">
                            <h4 class="font-semibold text-blue-800 mb-3 flex items-center">
                                <i data-lucide="smartphone" class="mr-2"></i>
                                Local Version
                            </h4>
                            <blockquote class="text-gray-700 mb-2">"${conflict.localQuote.text}"</blockquote>
                            <cite class="text-gray-600">— ${conflict.localQuote.author}</cite>
                            <div class="text-sm text-gray-500 mt-2">Category: ${conflict.localQuote.category}</div>
                        </div>
                        
                        <div class="conflict-option p-6 rounded-xl bg-green-50 cursor-pointer" data-choice="server">
                            <h4 class="font-semibold text-green-800 mb-3 flex items-center">
                                <i data-lucide="server" class="mr-2"></i>
                                Server Version
                            </h4>
                            <blockquote class="text-gray-700 mb-2">"${conflict.serverQuote.text}"</blockquote>
                            <cite class="text-gray-600">— ${conflict.serverQuote.author}</cite>
                            <div class="text-sm text-gray-500 mt-2">Category: ${conflict.serverQuote.category}</div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-4">
                        <button class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors" data-action="cancel">
                            Cancel
                        </button>
                        <button class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors" data-action="confirm" disabled>
                            Apply Choice
                        </button>
                    </div>
                </div>
            `;

            let selectedChoice = null;
            
            dialog.querySelectorAll('.conflict-option').forEach(option => {
                option.addEventListener('click', () => {
                    dialog.querySelectorAll('.conflict-option').forEach(opt => opt.classList.remove('ring-2', 'ring-blue-500'));
                    option.classList.add('ring-2', 'ring-blue-500');
                    selectedChoice = option.dataset.choice;
                    dialog.querySelector('[data-action="confirm"]').disabled = false;
                });
            });

            dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve();
            });

            dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                if (selectedChoice === 'local') {
                    this.resolveConflictLocalWins(conflict);
                } else if (selectedChoice === 'server') {
                    this.resolveConflictServerWins(conflict);
                }
                document.body.removeChild(dialog);
                resolve();
            });

            document.body.appendChild(dialog);
            lucide.createIcons();
        });
    }

    startPeriodicSync() {
        // Clear existing interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Start new sync interval (every 30 seconds)
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.syncWithServer();
            }
        }, 30000);
    }

    async forceSyncWithServer() {
        if (!this.isOnline) {
            this.showNotification('Cannot sync while offline', 'error');
            return;
        }

        this.showNotification('Force syncing with server...', 'info');
        await this.syncWithServer();
    }

    updateSyncStatus() {
        if (!this.elements.syncStatusBtn) return;

        const statusElement = this.elements.syncStatusBtn.querySelector('div');
        const textElement = this.elements.syncStatusBtn.childNodes[1];
        
        let statusColor, statusText;
        
        switch (this.syncStatus) {
            case 'synced':
                statusColor = 'bg-green-500';
                statusText = 'Synced';
                break;
            case 'syncing':
                statusColor = 'bg-blue-500 animate-pulse';
                statusText = 'Syncing...';
                break;
            case 'error':
                statusColor = 'bg-red-500';
                statusText = 'Sync Error';
                break;
            case 'offline':
                statusColor = 'bg-gray-500';
                statusText = 'Offline';
                break;
            default:
                statusColor = 'bg-yellow-500';
                statusText = 'Connecting...';
        }
        
        statusElement.className = `w-3 h-3 rounded-full mr-2 ${statusColor}`;
        textElement.textContent = statusText;
    }

    showSyncDetails() {
        const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime).toLocaleString() : 'Never';
        const serverQuotesCount = this.quotes.filter(q => q.isServerQuote).length;
        const pendingSync = this.syncQueue.length;
        const conflicts = this.conflictQueue.length;
        
        let details = `Last Sync: ${lastSync}\n`;
        details += `Server Quotes: ${serverQuotesCount}\n`;
        details += `Pending Sync: ${pendingSync}\n`;
        details += `Conflicts: ${conflicts}\n`;
        details += `Status: ${this.syncStatus}\n`;
        details += `Online: ${this.isOnline ? 'Yes' : 'No'}`;
        
        alert(details);
    }

    // ===== ENHANCED QUOTE MANAGEMENT WITH SYNC =====

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
            serverSynced: false
        };

        this.quotes.push(newQuote);
        this.userQuotesCount++;
        
        // Add to sync queue for server upload
        this.syncQueue.push(newQuote);
        
        // Check if this is a new category
        const wasNewCategory = !this.categoryPreferences[category];
        
        // Update categories and preferences
        this.populateCategories();
        
        // If new category was added, show notification
        if (wasNewCategory) {
            this.showNotification(`New category "${category}" created!`, 'success');
        }
        
        // Save to localStorage and sync data
        this.saveToLocalStorage();
        this.saveSyncData();
        
        // Update UI
        this.updateStats();
        
        // Switch to the new quote's category and show it
        this.filterQuotes(category);
        this.displayQuote(newQuote);
        
        // Reset form and close
        this.elements.quoteForm.reset();
        this.toggleAddQuoteForm();
        
        // Attempt immediate sync if online
        if (this.isOnline) {
            this.syncWithServer();
            this.showNotification('Quote added and queued for sync!', 'success');
        } else {
            this.showNotification('Quote added! Will sync when online.', 'success');
        }
    }

    // ===== ENHANCED STORAGE WITH SYNC DATA =====

    loadSyncData() {
        try {
            const syncData = localStorage.getItem('quoteGenerator_syncData');
            if (syncData) {
                const parsed = JSON.parse(syncData);
                this.syncQueue = parsed.syncQueue || [];
                this.conflictQueue = parsed.conflictQueue || [];
                this.lastSyncTime = parsed.lastSyncTime;
                this.conflictResolutionMode = parsed.conflictResolutionMode || 'server-wins';
                this.serverQuotes = parsed.serverQuotes || [];
            }
        } catch (error) {
            console.error('Error loading sync data:', error);
        }
    }

    saveSyncData() {
        try {
            const syncData = {
                syncQueue: this.syncQueue,
                conflictQueue: this.conflictQueue,
                lastSyncTime: this.lastSyncTime,
                conflictResolutionMode: this.conflictResolutionMode,
                serverQuotes: this.serverQuotes,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('quoteGenerator_syncData', JSON.stringify(syncData));
        } catch (error) {
            console.error('Error saving sync data:', error);
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
            
            // Load conflict resolution preference
            const conflictMode = localStorage.getItem('quoteGenerator_conflictMode');
            if (conflictMode) {
                this.conflictResolutionMode = conflictMode;
                if (this.elements.conflictResolution) {
                    this.elements.conflictResolution.value = conflictMode;
                }
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

    // ===== ENHANCED EXPORT/IMPORT WITH SYNC DATA =====

    exportQuotes(type = 'all') {
        try {
            let quotesToExport;
            let filename;
            
            if (type === 'user') {
                quotesToExport = this.quotes.filter(quote => quote.isUserAdded);
                filename = 'my-quotes-with-sync.json';
                
                if (quotesToExport.length === 0) {
                    this.showNotification('No user quotes to export', 'error');
                    return;
                }
            } else {
                quotesToExport = this.quotes;
                filename = 'all-quotes-with-sync.json';
            }
            
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '3.0',
                totalQuotes: quotesToExport.length,
                categories: this.extractUniqueCategories().filter(cat => cat !== 'All'),
                categoryPreferences: type === 'all' ? this.categoryPreferences : {},
                filterHistory: type === 'all' ? this.filterHistory : [],
                syncData: {
                    lastSyncTime: this.lastSyncTime,
                    conflictResolutionMode: this.conflictResolutionMode,
                    syncQueueCount: this.syncQueue.length,
                    serverQuotesCount: this.quotes.filter(q => q.isServerQuote).length
                },
                quotes: quotesToExport.map(quote => ({
                    id: quote.id,
                    text: quote.text,
                    author: quote.author,
                    category: quote.category,
                    isUserAdded: quote.isUserAdded || false,
                    isServerQuote: quote.isServerQuote || false,
                    dateAdded: quote.dateAdded || new Date().toISOString(),
                    lastModified: quote.lastModified || new Date().toISOString(),
                    serverSynced: quote.serverSynced || false,
                    serverId: quote.serverId
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
            
            this.showNotification(`Successfully exported ${quotesToExport.length} quotes with sync metadata`, 'success');
            
        } catch (error) {
            console.error('Error exporting quotes:', error);
            this.showNotification('Error exporting quotes', 'error');
        }
    }

    // ===== EXISTING METHODS (Updated for sync compatibility) =====

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
            const serverQuotesCount = this.getQuotesByCategory(category).filter(q => q.isServerQuote).length;
            
            let categoryDisplay = category;
            if (quotesCount > 0 && category !== 'All') {
                categoryDisplay += ` (${quotesCount})`;
            }
            if (serverQuotesCount > 0 && category !== 'All') {
                categoryDisplay += ` 🌐`;
            }
            
            return `
                <button 
                    class="category-pill px-6 py-2 rounded-full bg-white/20 text-white font-medium ${isActive} ${isUserCreated ? 'user-created' : ''}"
                    data-category="${category}"
                    title="${category === 'All' ? 'All categories' : `${quotesCount} quotes in ${category}${serverQuotesCount > 0 ? ` (${serverQuotesCount} from server)` : ''}`}"
                >
                    ${categoryDisplay}
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
        const serverQuotesCount = this.getQuotesByCategory(category).filter(q => q.isServerQuote).length;
        
        if (category === 'All') {
            this.showNotification(`Showing all ${quotesCount} quotes${serverQuotesCount > 0 ? ` (${serverQuotesCount} from server)` : ''}`, 'info');
        } else {
            this.showNotification(`Filtered to ${category}: ${quotesCount} quotes${serverQuotesCount > 0 ? ` (${serverQuotesCount} from server)` : ''}`, 'info');
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
            
            // Add visual indicators for different quote types
            let indicators = '';
            if (quote.isUserAdded) {
                indicators += ' <span title="Your quote" class="text-yellow-300">✨</span>';
            }
            if (quote.isServerQuote) {
                indicators += ' <span title="From server" class="text-blue-300">🌐</span>';
            }
            if (quote.serverSynced) {
                indicators += ' <span title="Synced to server" class="text-green-300">✓</span>';
            } else if (quote.isUserAdded && !quote.serverSynced) {
                indicators += ' <span title="Pending sync" class="text-orange-300">⏳</span>';
            }
            
            if (indicators) {
                this.elements.quoteCategory.innerHTML += indicators;
            }
            
            this.elements.quoteContainer.classList.remove('hidden');
        }, 150);
    }

    populateExistingCategories() {
        const categories = this.extractUniqueCategories()
            .filter(cat => cat !== 'All')
            .sort();
        
        // Group categories by type
        const defaultCategories = categories.filter(cat => !this.isUserCreatedCategory(cat));
        const userCategories = categories.filter(cat => this.isUserCreatedCategory(cat));
        
        let optionsHTML = '<option value="">Select existing category</option>';
        
        if (defaultCategories.length > 0) {
            optionsHTML += '<optgroup label="Default Categories">';
            defaultCategories.forEach(category => {
                const count = this.getQuotesByCategory(category).length;
                const serverCount = this.getQuotesByCategory(category).filter(q => q.isServerQuote).length;
                optionsHTML += `<option value="${category}">${category} (${count}${serverCount > 0 ? `, ${serverCount} from server` : ''})</option>`;
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
            
            // Load user preferences and sync data
            this.loadUserPreferences();
            this.loadSyncData();
            
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
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Error saving data locally', 'error');
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
                    this.conflictResolutionMode = importData.syncData.conflictResolutionMode || this.conflictResolutionMode;
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
                        lastModified: new Date().toISOString(),
                        serverSynced: false
                    };
                    
                    this.quotes.push(newQuote);
                    this.userQuotesCount++;
                    
                    // Add to sync queue
                    this.syncQueue.push(newQuote);
                    
                    newQuotes++;
                } else {
                    duplicates++;
                }
            });
            
            // Save and update UI
            this.saveToLocalStorage();
            this.saveUserPreferences();
            this.saveSyncData();
            this.populateCategories();
            this.updateStats();
            
            // Attempt sync if online
            if (this.isOnline && newQuotes > 0) {
                this.syncWithServer();
            }
            
            // Show results
            let message = `Successfully imported ${newQuotes} new quotes`;
            if (newCategories.length > 0) {
                message += ` and ${newCategories.length} new categories`;
            }
            if (duplicates > 0) {
                message += ` (${duplicates} duplicates skipped)`;
            }
            if (newQuotes > 0) {
                message += `. ${this.isOnline ? 'Syncing to server...' : 'Will sync when online.'}`;
            }
            
            this.showNotification(message, 'success');
            this.elements.fileInput.value = '';
            
            // If new categories were added, show them
            if (newCategories.length > 0) {
                setTimeout(() => {
                    this.showNotification(`New categories: ${newCategories.join(', ')}`, 'info');
                }, 2000);
            }
            
        } catch (error) {
            console.error('Error importing quotes:', error);
            this.showNotification('Error importing quotes. Please check file format.', 'error');
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

    // Enhanced Data Management
    clearUserData() {
        if (confirm('Are you sure you want to clear all your added quotes, sync queue, and preferences? This action cannot be undone.')) {
            try {
                this.quotes = this.quotes.filter(quote => !quote.isUserAdded);
                this.userQuotesCount = 0;
                this.categoryPreferences = {};
                this.filterHistory = [];
                this.syncQueue = [];
                this.conflictQueue = [];
                this.currentCategory = 'All';
                
                localStorage.removeItem('quoteGenerator_quotes');
                localStorage.removeItem('quoteGenerator_userCount');
                localStorage.removeItem('quoteGenerator_categoryPreferences');
                localStorage.removeItem('quoteGenerator_lastCategory');
                localStorage.removeItem('quoteGenerator_filterHistory');
                localStorage.removeItem('quoteGenerator_syncData');
                localStorage.removeItem('quoteGenerator_conflictMode');
                
                this.populateCategories();
                this.updateStats();
                this.showRandomQuote();
                
                this.showNotification('User data, sync queue, and preferences cleared successfully', 'success');
            } catch (error) {
                console.error('Error clearing user data:', error);
                this.showNotification('Error clearing user data', 'error');
            }
        }
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset everything to defaults? This will clear all data including server quotes, session history, and sync data.')) {
            try {
                // Clear all storage
                localStorage.clear();
                sessionStorage.clear();
                
                // Stop sync interval
                if (this.syncInterval) {
                    clearInterval(this.syncInterval);
                }
                
                // Reset to defaults
                this.quotes = [...this.defaultQuotes];
                this.userQuotesCount = 0;
                this.sessionQuotesViewed = 0;
                this.lastDisplayedQuote = null;
                this.currentCategory = 'All';
                this.categoryPreferences = {};
                this.filterHistory = [];
                this.syncQueue = [];
                this.conflictQueue = [];
                this.serverQuotes = [];
                this.lastSyncTime = null;
                this.conflictResolutionMode = 'server-wins';
                
                // Update UI
                this.populateCategories();
                this.updateStats();
                this.showRandomQuote();
                this.updateSyncStatus();
                
                // Restart sync
                this.initializeServerSync();
                
                this.showNotification('All data reset to defaults - reinitializing server sync...', 'success');
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
            this.elements.addQuoteBtn.innerHTML = '<i data-lucide="plus" class="mr-2"></i>Add Quote';
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
            this.elements.manageDataBtn.innerHTML = '<i data-lucide="database" class="mr-2"></i>Manage Data & Sync';
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
        this.elements.syncQueueCount.textContent = this.syncQueue.length;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-xl text-white font-medium z-50 transition-all duration-300 transform translate-x-full max-w-sm`;
        
        if (type === 'success') {
            notification.className += ' bg-green-500';
        } else if (type === 'error') {
            notification.className += ' bg-red-500';
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
