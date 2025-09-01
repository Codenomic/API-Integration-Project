// API Configuration
const API_CONFIG = {
    // Replace 'YOUR_API_KEY_HERE' with your actual NewsAPI key
    // Get your free API key from: https://newsapi.org/register
    API_KEY: 'bd95144d7ece47ad8c718d6799bbef6c',
    BASE_URL: 'https://newsapi.org/v2',
    // Default country and category for news data
    DEFAULT_COUNTRY: 'us',
    DEFAULT_CATEGORY: 'technology'
};

// Construct the full API URL with API key
const getNewsURL = (country = API_CONFIG.DEFAULT_COUNTRY, category = API_CONFIG.DEFAULT_CATEGORY) => {
    return `${API_CONFIG.BASE_URL}/top-headlines?country=${country}&category=${category}&apiKey=${API_CONFIG.API_KEY}`;
};

// DOM Elements
const refreshBtn = document.getElementById('refreshBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const postsContainer = document.getElementById('postsContainer');
const statusDiv = document.getElementById('status');

// Global variables to track state
let isLoading = false;

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page loaded successfully');
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Load initial data
    fetchNewsData();
    
    // Add event listener to refresh button
    refreshBtn.addEventListener('click', handleRefresh);
});

/**
 * Initialize scroll-triggered animations
 * Uses Intersection Observer API for better performance
 */
function initScrollAnimations() {
    // Create intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.fade-in, .slide-up, .zoom-in');
    animateElements.forEach(el => observer.observe(el));

    // Store observer globally for dynamic content
    window.scrollObserver = observer;
}

/**
 * Main function to fetch news data from the API
 * Uses async/await for cleaner asynchronous code
 */
async function fetchNewsData() {
    try {
        // Show loading state
        showLoading();
        
        console.log('🔄 Fetching news data from API...');
        
        // Check if API key is configured
        if (API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error('Please configure your API key in the script.js file');
        }
        
        // Fetch data from the API with error handling for network issues
        const response = await fetch(getNewsURL());
        
        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Convert response to JSON
        const newsData = await response.json();
        
        console.log(`✅ Successfully fetched ${newsData.articles.length} news articles`);
        
        // Display the news data on the page
        displayNewsData(newsData);
        
        // Update status
        updateStatus(`Last updated: ${new Date().toLocaleTimeString()}`);
        
    } catch (error) {
        console.error('❌ Error fetching news data:', error);
        showError();
        updateStatus(error.message.includes('API key') ? 'API key not configured' : 'Failed to load data');
    } finally {
        // Always hide loading state
        hideLoading();
    }
}

/**
 * Display news data in the posts container
 * @param {Object} newsData - News data object from the API
 */
function displayNewsData(newsData) {
    // Clear existing content
    postsContainer.innerHTML = '';
    hideError();
    
    // Create news cards for each article
    newsData.articles.forEach((article, index) => {
        const newsCard = createNewsCard(article, index + 1);
        postsContainer.appendChild(newsCard);
        
        // Observe the new card for scroll animations
        if (window.scrollObserver) {
            window.scrollObserver.observe(newsCard);
        }
    });
    
    console.log(`📰 Displayed ${newsData.articles.length} news articles`);
}

/**
 * Create a DOM element for news data
 * @param {Object} article - News article object
 * @param {number} index - Article index for numbering
 * @returns {HTMLElement} - Complete news card element
 */
function createNewsCard(article, index) {
    // Create main card container
    const card = document.createElement('div');
    card.className = 'post-card zoom-in news-card';
    
    // Extract news information
    const title = article.title || 'No title available';
    const description = article.description || 'No description available';
    const source = article.source.name || 'Unknown source';
    const publishedAt = new Date(article.publishedAt).toLocaleDateString();
    const url = article.url;
    const imageUrl = article.urlToImage;
    
    // Create and populate card content
    card.innerHTML = `
        <div class="post-id">Article #${index}</div>
        ${imageUrl ? `<div class="news-image"><img src="${imageUrl}" alt="News image" onerror="this.parentElement.style.display='none'"></div>` : ''}
        <h2 class="post-title">${title}</h2>
        <div class="news-info">
            <div class="news-meta">
                <span class="source">${source}</span>
                <span class="date">${publishedAt}</span>
            </div>
            <p class="news-description">${description}</p>
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="read-more-btn">Read Full Article</a>
        </div>
    `;
    
    return card;
}

/**
 * Utility function to capitalize the first letter of a string
 * @param {string} str - Input string
 * @returns {string} - String with first letter capitalized
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Handle refresh button click
 * Prevents multiple simultaneous requests and adds visual feedback
 */
function handleRefresh() {
    if (!isLoading) {
        console.log('🔄 Refresh news data button clicked');
        
        // Add click animation
        refreshBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            refreshBtn.style.transform = '';
        }, 150);
        
        fetchNewsData();
    }
}

/**
 * Show loading state with smooth transitions
 */
function showLoading() {
    isLoading = true;
    loadingDiv.classList.remove('hidden');
    refreshBtn.disabled = true;
    refreshBtn.querySelector('.btn-text').textContent = 'Loading News...';
    refreshBtn.querySelector('.btn-icon').style.animation = 'spin 1s linear infinite';
    hideError();
    
    // Fade out existing posts
    const existingCards = document.querySelectorAll('.post-card');
    existingCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0.3';
            card.style.transform = 'scale(0.95)';
        }, index * 50);
    });
}

/**
 * Hide loading state with smooth transitions
 */
function hideLoading() {
    isLoading = false;
    loadingDiv.classList.add('hidden');
    refreshBtn.disabled = false;
    refreshBtn.querySelector('.btn-text').textContent = 'Refresh News';
    refreshBtn.querySelector('.btn-icon').style.animation = '';
    
    // Restore existing posts opacity
    const existingCards = document.querySelectorAll('.post-card');
    existingCards.forEach(card => {
        card.style.opacity = '';
        card.style.transform = '';
    });
}

/**
 * Show error state with animation
 */
function showError() {
    errorDiv.classList.remove('hidden');
    postsContainer.innerHTML = '';
    
    // Add entrance animation to error message
    setTimeout(() => {
        errorDiv.querySelector('.error-content').style.transform = 'translateY(0)';
        errorDiv.querySelector('.error-content').style.opacity = '1';
    }, 100);
}

/**
 * Hide error state
 */
function hideError() {
    errorDiv.classList.add('hidden');
    if (errorDiv.querySelector('.error-content')) {
        errorDiv.querySelector('.error-content').style.transform = 'translateY(20px)';
        errorDiv.querySelector('.error-content').style.opacity = '0';
    }
}

/**
 * Update status message with smooth transition
 * @param {string} message - Status message to display
 */
function updateStatus(message) {
    // Fade out current status
    statusDiv.style.opacity = '0';
    
    setTimeout(() => {
        statusDiv.textContent = message;
        // Fade in new status
        statusDiv.style.opacity = '1';
    }, 200);
    
    console.log(`📊 Status: ${message}`);
}

/**
 * Handle network status changes
 */
window.addEventListener('online', function() {
    console.log('🌐 Internet connection restored');
    updateStatus('Connection restored - Click refresh to reload');
    
    // Add visual feedback for connection restored
    document.body.style.borderTop = '3px solid #27ae60';
    setTimeout(() => {
        document.body.style.borderTop = '';
    }, 3000);
});

window.addEventListener('offline', function() {
    console.log('📱 Internet connection lost');
    updateStatus('No internet connection');
    
    // Add visual feedback for connection lost
    document.body.style.borderTop = '3px solid #e74c3c';
});

/**
 * Smooth scroll to top functionality (optional enhancement)
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top on logo click (if desired)
document.querySelector('.header h1').addEventListener('click', scrollToTop);

/**
 * Performance optimization: Debounce scroll events
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optional: Add parallax effect to header (uncomment if desired)
// const parallaxHeader = debounce(() => {
//     const scrolled = window.pageYOffset;
//     const header = document.querySelector('.header');
//     header.style.transform = `translateY(${scrolled * 0.5}px)`;
// }, 10);
// 
// window.addEventListener('scroll', parallaxHeader);

// Initialize status with transition
statusDiv.style.transition = 'opacity 0.3s ease';

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleRefresh();
    }
});

console.log('🚀 Application initialized with animations and enhanced UX');