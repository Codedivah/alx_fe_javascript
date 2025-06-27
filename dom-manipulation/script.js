// Quote data structure
let quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "life"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "dreams"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "success"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "motivation"
  },
  {
    text: "In the end, we will remember not the words of our enemies, but the silence of our friends.",
    author: "Martin Luther King Jr.",
    category: "friendship"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "life"
  },
  {
    text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein",
    category: "wisdom"
  },
  {
    text: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero",
    category: "wisdom"
  },
  {
    text: "You only live once, but if you do it right, once is enough.",
    author: "Mae West",
    category: "life"
  }
];

// DOM elements
const quoteDisplay = document.getElementById('quote-display');
const quoteAuthor = document.getElementById('quote-author');
const quoteCategory = document.getElementById('quote-category');
const categorySelect = document.getElementById('category-select');
const generateBtn = document.getElementById('generate-btn');
const addQuoteForm = document.getElementById('add-quote-form');
const totalQuotesElement = document.getElementById('total-quotes');
const totalCategoriesElement = document.getElementById('total-categories');

// Initialize the application
function initializeApp() {
  populateCategorySelect();
  updateStatistics();
  showRandomQuote();
  
  // Event listeners
  generateBtn.addEventListener('click', showRandomQuote);
  addQuoteForm.addEventListener('submit', handleAddQuote);
  categorySelect.addEventListener('change', showRandomQuote);
}

// Get unique categories from quotes array
function getCategories() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  return categories.sort();
}

// Populate category select dropdown
function populateCategorySelect() {
  const categories = getCategories();
  
  // Clear existing options except "All Categories"
  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = capitalizeFirstLetter(category);
    categorySelect.appendChild(option);
  });
}

// Show random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  let filteredQuotes;
  
  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    quoteAuthor.textContent = "";
    quoteCategory.textContent = "";
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  // Animate quote change
  quoteDisplay.style.opacity = '0';
  quoteAuthor.style.opacity = '0';
  quoteCategory.style.opacity = '0';
  
  setTimeout(() => {
    quoteDisplay.textContent = `"${randomQuote.text}"`;
    quoteAuthor.textContent = `— ${randomQuote.author}`;
    quoteCategory.textContent = `Category: ${capitalizeFirstLetter(randomQuote.category)}`;
    
    quoteDisplay.style.opacity = '1';
    quoteAuthor.style.opacity = '1';
    quoteCategory.style.opacity = '1';
  }, 150);
}

// Handle adding new quote
function handleAddQuote(event) {
  event.preventDefault();
  
  const quoteText = document.getElementById('quote-text').value.trim();
  const authorName = document.getElementById('quote-author-input').value.trim();
  const categoryName = document.getElementById('quote-category-input').value.trim().toLowerCase();
  
  if (!quoteText || !authorName || !categoryName) {
    alert('Please fill in all fields.');
    return;
  }
  
  // Create new quote object
  const newQuote = {
    text: quoteText,
    author: authorName,
    category: categoryName
  };
  
  // Add to quotes array
  quotes.push(newQuote);
  
  // Update UI
  populateCategorySelect();
  updateStatistics();
  
  // Clear form
  addQuoteForm.reset();
  
  // Show success message
  showSuccessMessage('Quote added successfully!');
  
  // If the new category is selected or "all" is selected, show the new quote
  const selectedCategory = categorySelect.value;
  if (selectedCategory === 'all' || selectedCategory === categoryName) {
    setTimeout(() => {
      showRandomQuote();
    }, 1000);
  }
}

// Update statistics
function updateStatistics() {
  totalQuotesElement.textContent = quotes.length;
  totalCategoriesElement.textContent = getCategories().length;
}

// Show success message
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
      document.body.removeChild(successDiv);
    }, 300);
  }, 3000);
}

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
