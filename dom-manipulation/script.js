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
  }
];

// DOM elements
const quoteDisplay = document.getElementById('quote-display');
const quoteCategory = document.getElementById('quote-category');
const categorySelect = document.getElementById('category-select');
const generateBtn = document.getElementById('generate-btn');
const totalQuotesElement = document.getElementById('total-quotes');
const totalCategoriesElement = document.getElementById('total-categories');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');
const importBtn = document.getElementById('import-btn');

// Local Storage key
const STORAGE_KEY = 'quoteGeneratorData';

// Session Storage keys
const SESSION_LAST_QUOTE_KEY = 'lastDisplayedQuote';
const SESSION_PREFERENCES_KEY = 'userPreferences';

// Initialize the application
function initializeApp() {
  loadQuotesFromStorage();
  loadSessionData();
  populateCategorySelect();
  updateStatistics();
  showRandomQuote();
  createAddQuoteForm();
  setupImportExport();
  
  // Event listeners
  generateBtn.addEventListener('click', showRandomQuote);
  categorySelect.addEventListener('change', showRandomQuote);
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

// Load session-specific data
function loadSessionData() {
  try {
    // Load last displayed quote
    const lastQuote = sessionStorage.getItem(SESSION_LAST_QUOTE_KEY);
    if (lastQuote) {
      const quoteData = JSON.parse(lastQuote);
      console.log('Last displayed quote from session:', quoteData.text);
    }
    
    // Load user preferences
    const preferences = sessionStorage.getItem(SESSION_PREFERENCES_KEY);
    if (preferences) {
      const prefs = JSON.parse(preferences);
      if (prefs.selectedCategory) {
        // Will be applied after category select is populated
        setTimeout(() => {
          categorySelect.value = prefs.selectedCategory;
        }, 100);
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
function saveUserPreferences() {
  try {
    const preferences = {
      selectedCategory: categorySelect.value,
      timestamp: Date.now()
    };
    sessionStorage.setItem(SESSION_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to session storage:', error);
  }
}

// Function to display a random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  let filteredQuotes;
  
  // Save user preference
  saveUserPreferences();
  
  // Filter quotes based on selected category
  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  // Handle case when no quotes are available
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
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
      alert('Please fill in both quote text and category fields.');
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
    showSuccessMessage('Quote added and saved successfully!');
    
    // If the new category is selected or "all" is selected, show the new quote
    const selectedCategory = categorySelect.value;
    if (selectedCategory === 'all' || selectedCategory === categoryName) {
      setTimeout(() => {
        showRandomQuote();
      }, 1000);
    }
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
      categories: getCategories()
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
    
    showSuccessMessage('Quotes exported successfully!');
    console.log('Exported', quotes.length, 'quotes to JSON file');
    
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
      
      // Ask user for confirmation
      const confirmMessage = `Import ${validQuotes.length} quotes? This will add them to your existing collection.`;
      if (confirm(confirmMessage)) {
        // Add imported quotes to existing array
        quotes.push(...validQuotes);
        
        // Save to localStorage
        saveQuotesToStorage();
        
        // Update DOM
        updateDOMAfterAddingQuote();
        
        showSuccessMessage(`Successfully imported ${validQuotes.length} quotes!`);
        console.log('Imported', validQuotes.length, 'quotes from JSON file');
        
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
  populateCategorySelect();
  
  // Update statistics
  updateStatistics();
}

// Get unique categories from quotes array
function getCategories() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  return categories.sort();
}

// Populate category select dropdown dynamically
function populateCategorySelect() {
  const categories = getCategories();
  const currentSelection = categorySelect.value;
  
  // Clear existing options except "All Categories"
  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  
  // Add category options dynamically
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = capitalizeFirstLetter(category);
    categorySelect.appendChild(option);
  });
  
  // Restore previous selection if it still exists
  if (currentSelection && (currentSelection === 'all' || categories.includes(currentSelection))) {
    categorySelect.value = currentSelection;
  }
}

// Update statistics display
function updateStatistics() {
  totalQuotesElement.textContent = quotes.length;
  totalCategoriesElement.textContent = getCategories().length;
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
