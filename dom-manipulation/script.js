// Quote data structure - array of quote objects with text and category
let quotes = [];

// Default quotes to initialize the app if no data exists in localStorage
const defaultQuotes = [
  {
    text: "The only way to do great work is to love what you do.",
    category: "motivation"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    category: "life"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    category: "dreams"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    category: "success"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    category: "motivation"
  },
  {
    text: "In the end, we will remember not the words of our enemies, but the silence of our friends.",
    category: "friendship"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    category: "life"
  },
  {
    text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    category: "wisdom"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    category: "innovation"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    category: "wisdom"
  },
  {
    text: "Your limitation—it's only your imagination.",
    category: "motivation"
  },
  {
    text: "Great things never come from comfort zones.",
    category: "success"
  },
  {
    text: "Dream it. Wish it. Do it.",
    category: "dreams"
  },
  {
    text: "Success doesn't just find you. You have to go out and get it.",
    category: "success"
  },
  {
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    category: "motivation"
  },
  {
    text: "Dream bigger. Do bigger.",
    category: "dreams"
  },
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    category: "motivation"
  },
  {
    text: "Wake up with determination. Go to bed with satisfaction.",
    category: "life"
  },
  {
    text: "Do something today that your future self will thank you for.",
    category: "life"
  },
  {
    text: "Little things make big days.",
    category: "wisdom"
  },
  {
    text: "It's going to be hard, but hard does not mean impossible.",
    category: "motivation"
  },
  {
    text: "Don't wait for opportunity. Create it.",
    category: "success"
  },
  {
    text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    category: "wisdom"
  },
  {
    text: "The key to success is to focus on goals, not obstacles.",
    category: "success"
  },
  {
    text: "Dream it. Believe it. Build it.",
    category: "dreams"
  }
];

// DOM elements
const quoteDisplay = document.getElementById('quote-display');
const quoteCategory = document.getElementById('quote-category');
const categoryFilter = document.getElementById('categoryFilter');
const generateBtn = document.getElementById('generate-btn');
const totalQuotesElement = document.getElementById('total-quotes');
const totalCategoriesElement = document.getElementById('total-categories');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');
const importBtn = document.getElementById('import-btn');

// Local Storage keys
const STORAGE_KEY = 'quoteGeneratorData';
const CATEGORY_PREFERENCE_KEY = 'selectedCategory';

// Session Storage keys
const SESSION_LAST_QUOTE_KEY = 'lastDisplayedQuote';
const SESSION_PREFERENCES_KEY = 'userPreferences';
const SESSION_FILTER_HISTORY_KEY = 'filterHistory';

// Current filter state
let currentFilter = 'all';
let filterHistory = [];

// Initialize the application
function initializeApp() {
  loadQuotesFromStorage();
  loadUserPreferences();
  loadSessionData();
  populateCategories();
  updateStatistics();
  showRandomQuote();
  createAddQuoteForm();
  setupImportExport();
  setupCategoryCards();
  
  // Event listeners
  generateBtn.addEventListener('click', showRandomQuote);
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
  
  setTimeout(() => {
    quoteDisplay.textContent = `"${randomQuote.text}"`;
    quoteCategory.textContent = `Category: ${capitalizeFirstLetter(randomQuote.category)}`;
    
    quoteDisplay.style.opacity = '1';
    quoteCategory.style.opacity = '1';
  }, 150);
  
  console.log(`Displayed quote from category "${selectedCategory}":`, randomQuote.text);
}

// Function to create and handle the add quote form
function createAddQuoteForm() {
  const addQuoteForm = document.getElementById('add-quote-form');
  
  // Handle form submission
  addQuoteForm.addEventListener('submit', function(event) {
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
    const newQuote = {
      text: quoteText,
      category: categoryName
    };
    
    // Add new quote to the quotes array
    quotes.push(newQuote);
    
    // Save to localStorage immediately
    saveQuotesToStorage();
    
    // Update the DOM dynamically
    updateDOMAfterAddingQuote();
    
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
    
    showSuccessMessage('Quotes exported successfully with category data!');
    console.log('Exported', quotes.length, 'quotes with', getUniqueCategories().length, 'categories');
    
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
      
      // Validate quote objects
      const validQuotes = quotesToImport.filter(quote => {
        return quote && 
               typeof quote.text === 'string' && 
               typeof quote.category === 'string' &&
               quote.text.trim() !== '' &&
               quote.category.trim() !== '';
      });
      
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
