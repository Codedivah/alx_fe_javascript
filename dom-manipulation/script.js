"use strict"
        // Application State
        let quotes = [];
        let serverQuotes = [];
        let syncInterval = null;
        let autoSyncEnabled = true;
        let syncIntervalTime = 10000;
        let conflicts = [];

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            loadLocalQuotes();
            updateUI();
            startAutoSync();
            showNotification('Application initialized', 'Ready to sync quotes!', 'success');
        });

        // Local Storage Management
        function saveLocalQuotes() {
            localStorage.setItem('quotes', JSON.stringify(quotes));
            localStorage.setItem('quotesTimestamp', Date.now().toString());
        }

        function loadLocalQuotes() {
            const stored = localStorage.getItem('quotes');
            if (stored) {
                quotes = JSON.parse(stored);
            }
        }

        function clearLocalData() {
            if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                localStorage.removeItem('quotes');
                localStorage.removeItem('quotesTimestamp');
                quotes = [];
                updateUI();
                showNotification('Data Cleared', 'All local quotes have been removed.', 'warning');
            }
        }

        // Quote Management
        function addQuote(event) {
            event.preventDefault();
            
            const title = document.getElementById('quoteTitle').value.trim();
            const content = document.getElementById('quoteContent').value.trim();
            const author = document.getElementById('quoteAuthor').value.trim();

            if (!title || !content) {
                showNotification('Validation Error', 'Title and content are required.', 'error');
                return;
            }

            const newQuote = {
                id: Date.now(),
                title: title,
                body: content,
                author: author || 'Unknown',
                userId: 1,
                timestamp: Date.now(),
                source: 'local',
                lastModified: Date.now()
            };

            quotes.push(newQuote);
            saveLocalQuotes();
            updateUI();

            // Clear form
            document.getElementById('quoteTitle').value = '';
            document.getElementById('quoteContent').value = '';
            document.getElementById('quoteAuthor').value = '';

            showNotification('Quote Added', `"${title}" has been added to your collection.`, 'success');
            
            // Sync immediately after adding
            setTimeout(manualSync, 1000);
        }

        function deleteQuote(id) {
            if (confirm('Are you sure you want to delete this quote?')) {
                quotes = quotes.filter(quote => quote.id !== id);
                saveLocalQuotes();
                updateUI();
                showNotification('Quote Deleted', 'Quote has been removed from your collection.', 'warning');
            }
        }

        // Server Simulation using JSONPlaceholder
        async function fetchServerQuotes() {
            try {
                updateSyncStatus('syncing', 'Syncing...');
                
                const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const posts = await response.json();
                
                // Transform posts to quote format
                serverQuotes = posts.map(post => ({
                    id: post.id,
                    title: post.title,
                    body: post.body,
                    author: `User ${post.userId}`,
                    userId: post.userId,
                    timestamp: Date.now() - (Math.random() * 86400000), // Random timestamp within last day
                    source: 'server',
                    lastModified: Date.now() - (Math.random() * 3600000) // Random modification time
                }));

                updateSyncStatus('connected', 'Connected');
                document.getElementById('lastSync').textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
                
                return serverQuotes;
            } catch (error) {
                console.error('Sync error:', error);
                updateSyncStatus('error', 'Sync Error');
                showNotification('Sync Error', `Failed to sync with server: ${error.message}`, 'error');
                return [];
            }
        }

        async function postQuoteToServer(quote) {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    body: JSON.stringify({
                        title: quote.title,
                        body: quote.body,
                        userId: quote.userId
                    }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                return { ...quote, id: result.id, source: 'server' };
            } catch (error) {
                console.error('Post error:', error);
                showNotification('Upload Error', `Failed to upload quote: ${error.message}`, 'error');
                return null;
            }
        }

        // Data Synchronization
        async function syncData() {
            const fetchedQuotes = await fetchServerQuotes();
            if (fetchedQuotes.length === 0) return;

            const conflicts = detectConflicts(quotes, fetchedQuotes);
            
            if (conflicts.length > 0) {
                handleConflicts(conflicts);
            } else {
                // Simple merge: server data takes precedence
                const mergedQuotes = mergeQuotes(quotes, fetchedQuotes);
                quotes = mergedQuotes;
                saveLocalQuotes();
                updateUI();
                
                const newQuotes = fetchedQuotes.filter(sq => 
                    !quotes.some(lq => lq.id === sq.id && lq.source === 'local')
                );
                
                if (newQuotes.length > 0) {
                    showNotification('Data Synced', `${newQuotes.length} new quotes received from server.`, 'success');
                }
            }
        }

        function detectConflicts(localQuotes, serverQuotes) {
            const conflicts = [];
            
            localQuotes.forEach(localQuote => {
                const serverQuote = serverQuotes.find(sq => sq.id === localQuote.id);
                if (serverQuote) {
                    // Check if content differs
                    if (localQuote.title !== serverQuote.title || 
                        localQuote.body !== serverQuote.body) {
                        conflicts.push({
                            id: localQuote.id,
                            local: localQuote,
                            server: serverQuote,
                            type: 'content_mismatch'
                        });
                    }
                }
            });

            return conflicts;
        }

        function mergeQuotes(localQuotes, serverQuotes) {
            const merged = [...serverQuotes];
            
            // Add local quotes that don't exist on server
            localQuotes.forEach(localQuote => {
                if (!serverQuotes.some(sq => sq.id === localQuote.id)) {
                    merged.push(localQuote);
                }
            });

            return merged.sort((a, b) => b.timestamp - a.timestamp);
        }

        function handleConflicts(detectedConflicts) {
            conflicts = detectedConflicts;
            showConflictResolution();
            showNotification('Conflicts Detected', `${conflicts.length} conflicts need resolution.`, 'conflict');
        }

        function showConflictResolution() {
            const conflictResolution = document.getElementById('conflictResolution');
            const conflictList = document.getElementById('conflictList');
            
            conflictList.innerHTML = '';
            
            conflicts.forEach((conflict, index) => {
                const conflictDiv = document.createElement('div');
                conflictDiv.className = 'conflict-item';
                conflictDiv.innerHTML = `
                    <h4>Conflict ${index + 1}: "${conflict.local.title}"</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0;">
                        <div>
                            <strong>Local Version:</strong>
                            <p><strong>Title:</strong> ${conflict.local.title}</p>
                            <p><strong>Content:</strong> ${conflict.local.body}</p>
                            <p><strong>Modified:</strong> ${new Date(conflict.local.lastModified).toLocaleString()}</p>
                        </div>
                        <div>
                            <strong>Server Version:</strong>
                            <p><strong>Title:</strong> ${conflict.server.title}</p>
                            <p><strong>Content:</strong> ${conflict.server.body}</p>
                            <p><strong>Modified:</strong> ${new Date(conflict.server.lastModified).toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="conflict-options">
                        <button onclick="resolveConflict(${index}, 'local')">Keep Local</button>
                        <button onclick="resolveConflict(${index}, 'server')">Keep Server</button>
                        <button onclick="resolveConflict(${index}, 'merge')">Merge Both</button>
                    </div>
                `;
                conflictList.appendChild(conflictDiv);
            });
            
            conflictResolution.classList.add('active');
            updateStats();
        }

        function resolveConflict(conflictIndex, resolution) {
            const conflict = conflicts[conflictIndex];
            
            switch (resolution) {
                case 'local':
                    // Keep local version
                    break;
                case 'server':
                    // Replace with server version
                    const quoteIndex = quotes.findIndex(q => q.id === conflict.id);
                    if (quoteIndex !== -1) {
                        quotes[quoteIndex] = conflict.server;
                    }
                    break;
                case 'merge':
                    // Create merged version
                    const mergedQuote = {
                        ...conflict.local,
                        title: `${conflict.local.title} | ${conflict.server.title}`,
                        body: `Local: ${conflict.local.body}\n\nServer: ${conflict.server.body}`,
                        lastModified: Date.now()
                    };
                    const mergeIndex = quotes.findIndex(q => q.id === conflict.id);
                    if (mergeIndex !== -1) {
                        quotes[mergeIndex] = mergedQuote;
                    }
                    break;
            }
            
            // Remove resolved conflict
            conflicts.splice(conflictIndex, 1);
            
            if (conflicts.length === 0) {
                document.getElementById('conflictResolution').classList.remove('active');
                showNotification('Conflicts Resolved', 'All conflicts have been resolved.', 'success');
            }
            
            saveLocalQuotes();
            updateUI();
            showConflictResolution();
        }

        // Auto Sync Management
        function startAutoSync() {
            if (syncInterval) {
                clearInterval(syncInterval);
            }
            
            if (autoSyncEnabled) {
                syncInterval = setInterval(syncData, syncIntervalTime);
                document.getElementById('autoSyncBtn').textContent = '⏸️ Pause Auto Sync';
            }
        }

        function toggleAutoSync() {
            autoSyncEnabled = !autoSyncEnabled;
            
            if (autoSyncEnabled) {
                startAutoSync();
                showNotification('Auto Sync Enabled', 'Automatic synchronization resumed.', 'success');
            } else {
                if (syncInterval) {
                    clearInterval(syncInterval);
                    syncInterval = null;
                }
                document.getElementById('autoSyncBtn').textContent = '▶️ Resume Auto Sync';
                showNotification('Auto Sync Paused', 'Automatic synchronization paused.', 'warning');
            }
        }

        function updateSyncInterval() {
            syncIntervalTime = parseInt(document.getElementById('syncInterval').value);
            if (autoSyncEnabled) {
                startAutoSync();
            }
            showNotification('Sync Interval Updated', `Sync interval set to ${syncIntervalTime/1000} seconds.`, 'success');
        }

        async function manualSync() {
            const syncBtn = document.getElementById('syncBtn');
            syncBtn.disabled = true;
            syncBtn.textContent = '🔄 Syncing...';
            
            await syncData();
            
            syncBtn.disabled = false;
            syncBtn.textContent = '🔄 Sync Now';
        }

        // UI Management
        function updateUI() {
            updateQuotesList();
            updateStats();
        }

        function updateQuotesList() {
            const quotesList = document.getElementById('quotesList');
            
            if (quotes.length === 0) {
                quotesList.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #64748b;">
                        No quotes yet. Add your first quote!
                    </div>
                `;
                return;
            }

            quotesList.innerHTML = quotes
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(quote => `
                    <div class="quote-item">
                        <div class="quote-header">
                            <div class="quote-title">${quote.title}</div>
                            <div class="quote-meta">
                                <span>${quote.source === 'local' ? '💻' : '🌐'}</span>
                                <span>${new Date(quote.timestamp).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="quote-content">${quote.body}</div>
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
                            — ${quote.author}
                        </div>
                        <div class="quote-actions">
                            <button onclick="deleteQuote(${quote.id})" class="delete-btn">🗑️ Delete</button>
                        </div>
                    </div>
                `).join('');
        }

        function updateStats() {
            document.getElementById('localCount').textContent = quotes.filter(q => q.source === 'local').length;
            document.getElementById('serverCount').textContent = serverQuotes.length;
            document.getElementById('conflictCount').textContent = conflicts.length;
        }

        function updateSyncStatus(status, message) {
            const indicator = document.getElementById('statusIndicator');
            const statusText = document.getElementById('syncStatus');
            
            indicator.className = `status-indicator ${status}`;
            statusText.textContent = message;
        }

        // Notification System
        function showNotification(title, message, type = 'success') {
            const notifications = document.getElementById('notifications');
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            notification.innerHTML = `
                <div class="notification-header">
                    <strong>${title}</strong>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div>${message}</div>
            `;
            
            notifications.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }

        // Data Export
        function exportData() {
            const data = {
                quotes: quotes,
                exportDate: new Date().toISOString(),
                totalQuotes: quotes.length
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Data Exported', 'Your quotes have been exported successfully.', 'success');
        }

        // Testing Framework
        async function runTests() {
            showNotification('Running Tests', 'Comprehensive testing started...', 'success');
            
            const tests = [
                testLocalStorage,
                testQuoteAddition,
                testServerSync,
                testConflictDetection,
                testDataMerging
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (const test of tests) {
                try {
                    await test();
                    passed++;
                    console.log(`✅ ${test.name} passed`);
                } catch (error) {
                    failed++;
                    console.error(`❌ ${test.name} failed:`, error);
                }
            }
            
            const result = `Tests completed: ${passed} passed, ${failed} failed`;
            showNotification('Test Results', result, failed === 0 ? 'success' : 'warning');
        }

        // Test Functions
        async function testLocalStorage() {
            const testQuote = {
                id: 999999,
                title: 'Test Quote',
                body: 'This is a test quote',
                author: 'Test Author',
                timestamp: Date.now(),
                source: 'local'
            };
            
            const originalQuotes = [...quotes];
            quotes.push(testQuote);
            saveLocalQuotes();
            
            quotes = [];
            loadLocalQuotes();
            
            const found = quotes.find(q => q.id === 999999);
            if (!found) {
                throw new Error('Local storage test failed');
            }
            
            // Cleanup
            quotes = originalQuotes;
            saveLocalQuotes();
        }

        async function testQuoteAddition() {
            const initialCount = quotes.length;
            
            // Simulate adding a quote
            const testQuote = {
                id: Date.now(),
                title: 'Test Addition',
                body: 'Testing quote addition',
                author: 'Test',
                timestamp: Date.now(),
                source: 'local'
            };
            
            quotes.push(testQuote);
            
            if (quotes.length !== initialCount + 1) {
                throw new Error('Quote addition test failed');
            }
            
            // Cleanup
            quotes.pop();
        }

        async function testServerSync() {
            const serverData = await fetchServerQuotes();
            if (!Array.isArray(serverData)) {
                throw new Error('Server sync test failed - invalid response');
            }
        }

        async function testConflictDetection() {
            const localQuotes = [
                { id: 1, title: 'Local Title', body: 'Local Body', lastModified: Date.now() }
            ];
            const serverQuotes = [
                { id: 1, title: 'Server Title', body: 'Server Body', lastModified: Date.now() }
            ];
            
            const conflicts = detectConflicts(localQuotes, serverQuotes);
            if (conflicts.length !== 1) {
                throw new Error('Conflict detection test failed');
            }
        }

        async function testDataMerging() {
            const localQuotes = [
                { id: 1, title: 'Local Only', source: 'local' },
                { id: 2, title: 'Common', source: 'local' }
            ];
            const serverQuotes = [
                { id: 2, title: 'Common', source: 'server' },
                { id: 3, title: 'Server Only', source: 'server' }
            ];
            
            const merged = mergeQuotes(localQuotes, serverQuotes);
            if (merged.length !== 3) {
                throw new Error('Data merging test failed');
            }
        }

        // Initialize sync on page load
        setTimeout(() => {
            manualSync();
        }, 2000);
  
