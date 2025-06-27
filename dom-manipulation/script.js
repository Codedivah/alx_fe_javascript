// Function to display a random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  let filteredQuotes;
  
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
    
    // Update the DOM dynamically
    updateDOMAfterAddingQuote();
    
    // Clear the form
    addQuoteForm.reset();
    
    // Show success feedback
    showSuccessMessage('Quote added successfully!');
    
    // If the new category is selected or "all" is selected, show the new quote
    const selectedCategory = categorySelect.value;
    if (selectedCategory === 'all' || selectedCategory === categoryName) {
      setTimeout(() => {
        showRandomQuote();
      }, 1000);
    }
  });
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

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
