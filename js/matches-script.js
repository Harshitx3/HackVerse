// Matches & Chats Page JavaScript

// DOM Elements
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const sidebar = document.querySelector('.sidebar');
const matchItems = document.querySelectorAll('.match-item');
const chatPlaceholder = document.querySelector('.chat-placeholder');
const chatWindow = document.querySelector('.chat-window');
const messageInput = document.querySelector('.message-input');
const sendBtn = document.querySelector('.send-btn');
const searchInput = document.querySelector('.search-input');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.querySelector('.theme-toggle');
const settingsBtn = document.querySelector('.settings-btn');

// State Management
let currentChat = null;
let messages = [];
let isDarkMode = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadChatData();
    animateElements();
});

// Event Listeners
function initializeEventListeners() {
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Match item clicks
    matchItems.forEach(item => {
        item.addEventListener('click', function() {
            selectMatch(this);
        });
    });
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleNavigation(this);
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    searchInput.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
    
    // Message input and send
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Settings button
    settingsBtn.addEventListener('click', function() {
        showNotification('Settings panel coming soon!');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            sidebar.classList.remove('open');
        }
    });
    
    // Auto-resize message input
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

// Mobile Menu Functions
function toggleMobileMenu() {
    sidebar.classList.toggle('open');
    
    // Animate hamburger icon
    const icon = mobileMenuToggle.querySelector('i');
    if (sidebar.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// Match Selection
function selectMatch(matchElement) {
    // Remove active class from all matches
    matchItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to selected match
    matchElement.classList.add('active');
    
    // Get match data
    const matchName = matchElement.querySelector('.match-name').textContent;
    const matchAvatar = matchElement.querySelector('.match-avatar img').src;
    const matchStatus = matchElement.querySelector('.status-indicator').classList.contains('online') ? 'Online' : 'Offline';
    
    // Update current chat
    currentChat = {
        name: matchName,
        avatar: matchAvatar,
        status: matchStatus
    };
    
    // Show chat window
    showChatWindow();
    
    // Update chat header
    updateChatHeader();
    
    // Load messages for this chat
    loadMessagesForChat(matchName);
    
    // Remove unread indicator
    const unreadCount = matchElement.querySelector('.unread-count');
    if (unreadCount) {
        unreadCount.style.display = 'none';
        updateNavBadge();
    }
    
    // Smooth scroll to chat window on mobile
    if (window.innerWidth <= 768) {
        document.querySelector('.chat-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Chat Window Functions
function showChatWindow() {
    chatPlaceholder.style.display = 'none';
    chatWindow.style.display = 'flex';
    
    // Animate chat window appearance
    chatWindow.style.opacity = '0';
    chatWindow.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        chatWindow.style.transition = 'all 0.3s ease';
        chatWindow.style.opacity = '1';
        chatWindow.style.transform = 'translateX(0)';
    }, 100);
}

function updateChatHeader() {
    const partnerName = chatWindow.querySelector('.partner-name');
    const partnerAvatar = chatWindow.querySelector('.partner-avatar');
    const partnerStatus = chatWindow.querySelector('.partner-status');
    
    if (partnerName) partnerName.textContent = currentChat.name;
    if (partnerAvatar) partnerAvatar.src = currentChat.avatar;
    if (partnerStatus) partnerStatus.textContent = currentChat.status;
}

function loadMessagesForChat(chatName) {
    // Clear existing messages
    const messagesContainer = chatWindow.querySelector('.chat-messages');
    messagesContainer.innerHTML = '';
    
    // Load sample messages (in a real app, this would come from an API)
    const sampleMessages = getSampleMessages(chatName);
    
    sampleMessages.forEach((message, index) => {
        setTimeout(() => {
            addMessageToChat(message);
        }, index * 100);
    });
}

function addMessageToChat(message) {
    const messagesContainer = chatWindow.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.type}`;
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${message.text}</p>
            <span class="message-time">${message.time}</span>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Animate message
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        messageElement.style.transition = 'all 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);
}

// Message Functions
function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (!messageText || !currentChat) return;
    
    // Create message object
    const message = {
        text: messageText,
        type: 'sent',
        time: formatTime(new Date())
    };
    
    // Add message to chat
    addMessageToChat(message);
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Simulate typing indicator
    showTypingIndicator();
    
    // Simulate response after delay
    setTimeout(() => {
        hideTypingIndicator();
        simulateResponse();
    }, 1500 + Math.random() * 1000);
}

function simulateResponse() {
    const responses = [
        "That's interesting! Tell me more about it.",
        "I completely agree with you on that.",
        "When would be a good time to discuss this further?",
        "I have some experience with that as well.",
        "Let's schedule a call to talk about this in detail."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const responseMessage = {
        text: randomResponse,
        type: 'received',
        time: formatTime(new Date())
    };
    
    addMessageToChat(responseMessage);
}

function showTypingIndicator() {
    const messagesContainer = chatWindow.querySelector('.chat-messages');
    const typingElement = document.createElement('div');
    typingElement.className = 'message received typing-indicator';
    typingElement.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typingElement = chatWindow.querySelector('.typing-indicator');
    if (typingElement) {
        typingElement.remove();
    }
}

// Search Functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    
    matchItems.forEach(item => {
        const matchName = item.querySelector('.match-name').textContent.toLowerCase();
        const matchPreview = item.querySelector('.match-preview').textContent.toLowerCase();
        
        if (matchName.includes(searchTerm) || matchPreview.includes(searchTerm)) {
            item.style.display = 'flex';
            item.style.opacity = '1';
        } else {
            item.style.display = 'none';
            item.style.opacity = '0';
        }
    });
    
    // Highlight search results
    if (searchTerm.length > 0) {
        matchItems.forEach(item => {
            const matchName = item.querySelector('.match-name');
            const matchPreview = item.querySelector('.match-preview');
            
            highlightText(matchName, searchTerm);
            highlightText(matchPreview, searchTerm);
        });
    }
}

function highlightText(element, searchTerm) {
    const text = element.textContent;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const highlightedText = text.replace(regex, '<mark>$1</mark>');
    
    if (highlightedText !== text) {
        element.innerHTML = highlightedText;
    }
}

// Navigation Functions
function handleNavigation(link) {
    const page = link.getAttribute('aria-label');
    
    // Remove active class from all nav links
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    
    // Add active class to clicked link
    link.classList.add('active');
    
    // Show navigation feedback
    showNotification(`Navigating to ${page}...`);
    
    // In a real app, this would navigate to different pages
    setTimeout(() => {
        if (page === 'Discover') {
            window.location.href = 'swipe.html';
        } else if (page === 'Profile') {
            window.location.href = 'profile.html';
        }
    }, 300);
}

// Theme Functions
function toggleTheme() {
    isDarkMode = !isDarkMode;
    
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');
    
    if (isDarkMode) {
        body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        document.documentElement.style.setProperty('--light-bg', '#1a1a2e');
        document.documentElement.style.setProperty('--lighter-bg', '#16213e');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
    } else {
        body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        document.documentElement.style.setProperty('--light-bg', '#f9f9fb');
        document.documentElement.style.setProperty('--lighter-bg', '#ffffff');
        document.documentElement.style.setProperty('--text-primary', '#1c1c1c');
        document.documentElement.style.setProperty('--text-secondary', '#888');
    }
    
    showNotification(isDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
}

// Utility Functions
function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-gradient);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-medium);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-size: 14px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function updateNavBadge() {
    const navBadge = document.querySelector('.nav-badge');
    const unreadCounts = document.querySelectorAll('.unread-count:not([style*="display: none"])');
    
    if (navBadge) {
        const totalUnread = unreadCounts.length;
        if (totalUnread > 0) {
            navBadge.textContent = totalUnread;
            navBadge.style.display = 'block';
        } else {
            navBadge.style.display = 'none';
        }
    }
}

function loadChatData() {
    // In a real app, this would load data from localStorage or API
    const savedTheme = localStorage.getItem('skillset-theme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }
}

function animateElements() {
    // Animate sidebar elements
    const sidebarElements = document.querySelectorAll('.nav-item, .sidebar-footer > *');
    sidebarElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        }, index * 100);
    });
    
    // Animate header elements
    const headerElements = document.querySelectorAll('.matches-title, .search-container');
    headerElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 500 + index * 100);
    });
}

// Sample Data Functions
function getSampleMessages(chatName) {
    const messageSets = {
        'Jane Smith': [
            { text: "Hey! I'm really interested in working on that React project with you. I have 3 years of experience with React and modern JavaScript.", type: 'received', time: '2:30 PM' },
            { text: "That's awesome! What kind of projects have you worked on before?", type: 'sent', time: '2:32 PM' },
            { text: "I've built several full-stack applications using React, Node.js, and MongoDB. Recently worked on an e-commerce platform and a task management app.", type: 'received', time: '2:35 PM' },
            { text: "Perfect! Those sound like great projects. Would you be available for a call this week to discuss the details?", type: 'sent', time: '2:37 PM' }
        ],
        'Mike Williams': [
            { text: "Hi there! I saw your profile and I'm impressed with your backend skills.", type: 'received', time: 'Yesterday' },
            { text: "Thanks! I noticed you're working on some interesting projects too.", type: 'sent', time: 'Yesterday' },
            { text: "Yes, I'm building a microservices architecture for a fintech startup.", type: 'received', time: 'Yesterday' }
        ],
        'Carlos Reyes': [
            { text: "Hello! I have experience with Node.js and would love to collaborate!", type: 'received', time: '3 days ago' }
        ],
        'Emily Chen': [
            { text: "Your UI/UX design skills would be perfect for our startup!", type: 'received', time: '5 days ago' }
        ]
    };
    
    return messageSets[chatName] || [];
}

// Touch/Swipe Support for Mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
});

function handleSwipeGesture() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && window.innerWidth <= 768) {
            // Swipe left - show chat if match is selected
            if (currentChat) {
                document.querySelector('.chat-section').scrollIntoView({ behavior: 'smooth' });
            }
        } else if (diff < 0 && window.innerWidth <= 768) {
            // Swipe right - show matches list
            document.querySelector('.matches-section').scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Add CSS for typing indicator
const typingIndicatorCSS = `
    .typing-dots {
        display: flex;
        gap: 4px;
    }
    
    .typing-dots span {
        width: 6px;
        height: 6px;
        background: #667eea;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) {
        animation-delay: -0.32s;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: -0.16s;
    }
    
    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    mark {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
        color: inherit;
        padding: 0 2px;
        border-radius: 2px;
    }
`;

// Add the CSS to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = typingIndicatorCSS;
document.head.appendChild(styleSheet);