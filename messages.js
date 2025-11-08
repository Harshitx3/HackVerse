// Message Data and State
const conversations = [
    {
        id: 1,
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
        lastMessage: "Hey! I just finished the API integration. Want to review it together?",
        timestamp: "10:45 AM",
        unread: 2,
        online: true,
        messages: [
            {
                id: 1,
                text: "Hey! I just finished the API integration. Want to review it together?",
                timestamp: "10:45 AM",
                outgoing: false
            },
            {
                id: 2,
                text: "That's awesome! I'd love to review it. When are you free?",
                timestamp: "10:47 AM",
                outgoing: true
            },
            {
                id: 3,
                text: "How about in 30 minutes? I can walk you through the authentication flow.",
                timestamp: "10:48 AM",
                outgoing: false
            }
        ]
    },
    {
        id: 2,
        name: "Alex Rodriguez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        lastMessage: "The design mockups look great! Can we add some micro-interactions?",
        timestamp: "Yesterday",
        unread: 0,
        online: false,
        messages: [
            {
                id: 1,
                text: "The design mockups look great! Can we add some micro-interactions?",
                timestamp: "Yesterday",
                outgoing: false
            },
            {
                id: 2,
                text: "Absolutely! I was thinking hover effects on the cards and smooth transitions.",
                timestamp: "Yesterday",
                outgoing: true
            }
        ]
    },
    {
        id: 3,
        name: "Emma Wilson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        lastMessage: "Just pushed the latest changes to the feature branch",
        timestamp: "2 days ago",
        unread: 1,
        online: true,
        messages: [
            {
                id: 1,
                text: "Just pushed the latest changes to the feature branch",
                timestamp: "2 days ago",
                outgoing: false
            }
        ]
    },
    {
        id: 4,
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        lastMessage: "Can we schedule a code review session for tomorrow?",
        timestamp: "3 days ago",
        unread: 0,
        online: false,
        messages: [
            {
                id: 1,
                text: "Can we schedule a code review session for tomorrow?",
                timestamp: "3 days ago",
                outgoing: false
            },
            {
                id: 2,
                text: "Sure! How about 2 PM? I'll send you a calendar invite.",
                timestamp: "3 days ago",
                outgoing: true
            }
        ]
    }
];

let currentConversation = null;
let typingTimeout = null;
let isTyping = false;

// DOM Elements
const conversationsList = document.getElementById('conversationsList');
const chatArea = document.getElementById('chatArea');
const emptyState = document.getElementById('emptyState');
const messagesList = document.getElementById('messagesList');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const searchInput = document.getElementById('searchInput');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const conversationsSidebar = document.getElementById('conversationsSidebar');
const chatHeader = document.getElementById('chatHeader');
const contactAvatar = document.getElementById('contactAvatar');
const contactName = document.getElementById('contactName');
const typingIndicator = document.getElementById('typingIndicator');

// Initialize the messaging interface
document.addEventListener('DOMContentLoaded', function() {
    renderConversations();
    setupEventListeners();
    setupMobileMenu();
    setupSearch();
});

// Render conversations list
function renderConversations(searchTerm = '') {
    const filteredConversations = conversations.filter(conv => 
        conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    conversationsList.innerHTML = filteredConversations.map(conversation => `
        <div class="conversation-item ${currentConversation?.id === conversation.id ? 'active' : ''}" 
             data-conversation-id="${conversation.id}">
            <div class="conversation-avatar">
                <img src="${conversation.avatar}" alt="${conversation.name}">
                <div class="status-indicator ${conversation.online ? '' : 'offline'}"></div>
            </div>
            <div class="conversation-info">
                <div class="conversation-name">${conversation.name}</div>
                <div class="conversation-preview">${conversation.lastMessage}</div>
            </div>
            <div class="conversation-meta">
                <span class="conversation-time">${conversation.timestamp}</span>
                ${conversation.unread > 0 ? `<span class="unread-badge">${conversation.unread}</span>` : ''}
            </div>
        </div>
    `).join('');

    // Add click event listeners
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', function() {
            const conversationId = parseInt(this.dataset.conversationId);
            selectConversation(conversationId);
        });
    });
}

// Select a conversation
function selectConversation(conversationId) {
    currentConversation = conversations.find(conv => conv.id === conversationId);
    
    if (currentConversation) {
        // Clear unread count
        currentConversation.unread = 0;
        
        // Update UI
        renderConversations();
        renderChatHeader();
        renderMessages();
        
        // Show chat area, hide empty state
        emptyState.style.display = 'none';
        chatArea.style.display = 'flex';
        
        // Close mobile sidebar
        if (window.innerWidth <= 768) {
            conversationsSidebar.classList.remove('mobile-open');
        }
        
        // Focus input
        messageInput.focus();
    }
}

// Render chat header
function renderChatHeader() {
    if (currentConversation) {
        contactAvatar.src = currentConversation.avatar;
        contactName.textContent = currentConversation.name;
    }
}

// Render messages
function renderMessages() {
    if (currentConversation) {
        messagesList.innerHTML = currentConversation.messages.map(message => `
            <div class="message ${message.outgoing ? 'outgoing' : 'incoming'}">
                ${!message.outgoing ? `<img src="${currentConversation.avatar}" alt="${currentConversation.name}" class="message-avatar">` : ''}
                <div class="message-bubble">
                    <div class="message-content">${escapeHtml(message.text)}</div>
                    <div class="message-time">${message.timestamp}</div>
                </div>
            </div>
        `).join('');
        
        scrollToBottom();
    }
}

// Send message
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentConversation) return;

    // Create new message
    const newMessage = {
        id: Date.now(),
        text: text,
        timestamp: getCurrentTime(),
        outgoing: true
    };

    // Add to conversation
    currentConversation.messages.push(newMessage);
    currentConversation.lastMessage = text;
    currentConversation.timestamp = 'Just now';

    // Clear input
    messageInput.value = '';
    
    // Add sending animation
    sendButton.classList.add('sending');
    setTimeout(() => sendButton.classList.remove('sending'), 300);

    // Update UI
    renderMessages();
    renderConversations();

    // Simulate response after delay
    setTimeout(() => simulateResponse(), 1500 + Math.random() * 1000);
}

// Simulate receiving a response
function simulateResponse() {
    if (!currentConversation) return;

    const responses = [
        "That sounds great! Let's discuss the details.",
        "I agree with your approach on this.",
        "When would be a good time to review this together?",
        "Thanks for the update! Keep me posted on the progress.",
        "I have some ideas about this. Want to hop on a quick call?",
        "This looks promising! Can we schedule a meeting to go over it?",
        "I like where this is heading. What are the next steps?",
        "Perfect timing! I was just thinking about this."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const responseMessage = {
        id: Date.now() + 1,
        text: randomResponse,
        timestamp: getCurrentTime(),
        outgoing: false
    };

    currentConversation.messages.push(responseMessage);
    currentConversation.lastMessage = randomResponse;
    currentConversation.timestamp = 'Just now';

    renderMessages();
    renderConversations();
}

// Handle typing indicator
function handleTyping() {
    if (!currentConversation) return;

    // Show typing indicator
    if (!isTyping) {
        isTyping = true;
        typingIndicator.textContent = 'typing...';
        typingIndicator.classList.add('active');
    }

    // Clear existing timeout
    clearTimeout(typingTimeout);

    // Hide typing indicator after delay
    typingTimeout = setTimeout(() => {
        isTyping = false;
        typingIndicator.classList.remove('active');
        typingIndicator.textContent = '';
    }, 1000);
}

// Setup event listeners
function setupEventListeners() {
    // Send message
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Typing indicator
    messageInput.addEventListener('input', handleTyping);

    // Search functionality
    searchInput.addEventListener('input', function() {
        renderConversations(this.value);
    });
}

// Setup mobile menu
function setupMobileMenu() {
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            conversationsSidebar.classList.toggle('mobile-open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!conversationsSidebar.contains(event.target) && 
                !mobileMenuToggle.contains(event.target)) {
                conversationsSidebar.classList.remove('mobile-open');
            }
        }
    });
}

// Setup search functionality
function setupSearch() {
    searchInput.addEventListener('input', function() {
        renderConversations(this.value);
    });
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        conversationsSidebar.classList.remove('mobile-open');
    }
});

// Initialize with first conversation if available
if (conversations.length > 0) {
    // Auto-select first conversation after a short delay
    setTimeout(() => {
        selectConversation(conversations[0].id);
    }, 500);
}

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add click sound effect (optional)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    function playClickSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    // Add sound to send button (optional)
    sendButton.addEventListener('click', function() {
        if (messageInput.value.trim()) {
            try {
                playClickSound();
            } catch (e) {
                // Silent fail if audio context not supported
            }
        }
    });
});